import {
  afterNextRender,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  Injector,
  Input,
  OnInit,
  signal,
  untracked,
  ViewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { ChatService } from '../../../core/services/chat.service';
import { ChatTiempoRealService } from '../../../core/services/chat-tiempo-real.service';
import {
  EventoChat,
  MensajeChatResponse,
  MINUTOS_PARA_ELIMINAR,
} from '../../../core/models/chat.models';
import {
  ID_GRUPO_DEMO,
  idGrupoDesdeSlug,
} from '../../../core/services/grupo-estudio.service';
import { SesionUsuarioService } from '../../../core/services/sesion-usuario.service';
import { crearAvisoTemporal } from '../../../core/services/aviso-temporal';


// Los mensajes nuevos llegan al instante por WebSocket. Solo si el socket está caído
// volvemos a preguntar a la API cada cierto tiempo, para que el chat siga funcionando.
const MILISEGUNDOS_RESPALDO = 15000;

// Cuánto puede alejarse del final la vista y seguir considerándose "abajo". Si la
// persona subió más que esto para leer mensajes viejos, no le movemos la pantalla.
const MARGEN_FINAL = 120;

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './chat.html',
  styleUrls: ['../grupos.css', './chat.css'],
})
export class Chat implements OnInit {
  // Variante visual mediante ?rol=tutor (CH08). Conectado a la API real: GET/POST/DELETE
  // /api/grupos/{idGrupo}/mensajes, y a /topic/grupos/{idGrupo}/mensajes por WebSocket
  // para recibir al momento lo que escriben o borran los demás. La app es zoneless: el estado que cambia tras una
  // respuesta HTTP tiene que ser signal(), si no la vista no se refresca.
  @Input() rol = 'estudiante';
  // Grupo activo según el :grupoId de la ruta padre.
  idGrupo = ID_GRUPO_DEMO;
  @Input() set grupoId(valor: string) {
    this.idGrupo = idGrupoDesdeSlug(valor) ?? ID_GRUPO_DEMO;
  }
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly mensajes = signal<MensajeChatResponse[]>([]);
  // Confirmaciones que se desvanecen a los 3 s ('enviado' | 'eliminado').
  readonly aviso = crearAvisoTemporal();
  readonly errorAccion = signal('');
  // Evita que un segundo clic (o Enter + clic) envíe el mismo mensaje dos veces
  // mientras la primera petición sigue en curso.
  readonly enviando = signal(false);
  // El backend solo permite borrar un mensaje propio dentro de los 2 primeros minutos,
  // así que el botón Eliminar solo se muestra mientras esa ventana sigue abierta.
  private readonly ahora = signal(Date.now());
  puedeEliminar(mensaje: MensajeChatResponse): boolean {
    if (mensaje.idAutor !== this.idUsuario) return false;
    const minutos = (this.ahora() - new Date(mensaje.fechaEnvio).getTime()) / 60000;
    return minutos < MINUTOS_PARA_ELIMINAR;
  }
  // El formulario de envío: su elemento marca el final de la conversación (el punto
  // al que bajamos) y su directiva permite limpiar el estado de "enviado" de Material.
  @ViewChild('composer') composer?: ElementRef<HTMLElement>;
  @ViewChild(FormGroupDirective) private formDirective?: FormGroupDirective;
  // La primera carga siempre baja al último mensaje, como al abrir un chat.
  private primeraCarga = true;
  // El mensaje empieza vacío con el placeholder de Figma (CH12). A propósito NO lleva
  // Validators.required: un campo vacío no es un error que haya que señalar en rojo,
  // simplemente todavía no hay nada que enviar. Quien manda es el botón.
  readonly form = new FormGroup({
    mensaje: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(1000)],
    }),
  });
  // Habilita el botón de enviar: hace falta texto de verdad, no solo espacios.
  readonly puedeEnviar = signal(false);
  constructor(
    public readonly dialog: MatDialog,
    private readonly api: ChatService,
    private readonly tiempoReal: ChatTiempoRealService,
    private readonly sesion: SesionUsuarioService,
    private readonly destroyRef: DestroyRef,
    private readonly injector: Injector,
  ) {}
  ngOnInit() {
    this.cargar();
    // El botón se habilita en cuanto hay texto no vacío y se vuelve a apagar al
    // limpiar el campo o al dejar solo espacios.
    const escritura = this.form.controls.mensaje.valueChanges.subscribe((valor) =>
      this.puedeEnviar.set((valor ?? '').trim().length > 0),
    );
    // Refresca la ventana de borrado para que el botón desaparezca al cumplirse los 2 minutos.
    const reloj = setInterval(() => this.ahora.set(Date.now()), 10000);
    // Tiempo real: cada mensaje que alguien envía o borra en el grupo llega por WebSocket.
    const avisos = this.tiempoReal
      .escucharGrupo(this.idGrupo)
      .subscribe((evento) => this.alRecibir(evento));
    // Al conectar (y sobre todo al reconectar tras un corte) pedimos la conversación una
    // vez: lo que se escribió mientras no había conexión no llegó por el socket.
    effect(
      () => {
        if (this.tiempoReal.conectado()) untracked(() => this.refrescar());
      },
      { injector: this.injector },
    );
    // Respaldo: si el socket está caído (backend reiniciándose, red que bloquea
    // WebSockets...) seguimos trayendo mensajes por la API, aunque más despacio.
    const sondeo = setInterval(() => {
      if (!this.tiempoReal.conectado()) this.refrescar();
    }, MILISEGUNDOS_RESPALDO);
    // Al volver a la pestaña no esperamos el siguiente ciclo: pedimos los mensajes ya.
    const alVolver = () => {
      if (!document.hidden) this.refrescar();
    };
    document.addEventListener('visibilitychange', alVolver);
    this.destroyRef.onDestroy(() => {
      escritura.unsubscribe();
      avisos.unsubscribe();
      clearInterval(reloj);
      clearInterval(sondeo);
      document.removeEventListener('visibilitychange', alVolver);
      this.peticionRefresco?.unsubscribe();
    });
  }

  // Petición de refresco en curso, para no dejarla colgada al destruir el componente.
  private peticionRefresco?: Subscription;
  // Refresco en segundo plano: sin spinner, sin avisos y sin vaciar la conversación si
  // falla la red, para que la vista no cambie salvo que haya mensajes nuevos.
  private refrescar() {
    // Ni mientras carga la primera vez, ni mientras se envía, ni con una petición de
    // refresco todavía en vuelo (una pestaña oculta tampoco necesita refrescarse).
    if (this.cargando() || this.enviando() || document.hidden) return;
    if (this.peticionRefresco && !this.peticionRefresco.closed) return;
    this.peticionRefresco = this.api.listarMensajes(this.idGrupo, this.idUsuario).subscribe({
      next: (mensajes) => {
        // Si la carga inicial había fallado, un refresco correcto recupera la vista.
        this.error.set(false);
        if (!this.hayNovedades(mensajes)) return;
        // Se mira antes de añadir los mensajes: si la persona estaba leyendo más arriba,
        // los nuevos entran sin moverle la pantalla.
        const bajar = this.estaAlFinal();
        this.mensajes.set(mensajes);
        if (bajar) this.bajarAlFinal(true);
      },
      // Un fallo puntual de red se ignora: seguimos mostrando lo que ya hay y
      // reintentamos en el siguiente ciclo.
      error: () => {},
    });
  }

  // Aviso del WebSocket. Quien envía recibe su propio mensaje dos veces (respuesta del
  // POST y aviso), así que agregar() descarta el repetido.
  private alRecibir(evento: EventoChat) {
    if (evento.tipo === 'CREADO') {
      if (this.mensajes().some((m) => m.idMensaje === evento.mensaje.idMensaje)) return;
      // Igual que en el refresco: si la persona estaba leyendo más arriba, no la movemos.
      const bajar = this.estaAlFinal();
      this.agregar(evento.mensaje);
      if (bajar) this.bajarAlFinal(true);
    } else {
      this.mensajes.update((lista) => lista.filter((m) => m.idMensaje !== evento.idMensaje));
    }
  }

  // Añade un mensaje al final, salvo que ya estuviera en la lista.
  private agregar(mensaje: MensajeChatResponse) {
    this.mensajes.update((lista) =>
      lista.some((m) => m.idMensaje === mensaje.idMensaje) ? lista : [...lista, mensaje],
    );
  }

  // El elemento que de verdad hace scroll alrededor del chat: en este layout es el
  // contenedor del sidenav, no la ventana, así que se busca en los ancestros.
  private contenedorDesplazable(nodo: HTMLElement): HTMLElement {
    for (let actual = nodo.parentElement; actual; actual = actual.parentElement) {
      const desborda = actual.scrollHeight > actual.clientHeight + 1;
      if (desborda && /auto|scroll|overlay/.test(getComputedStyle(actual).overflowY)) {
        return actual;
      }
    }
    return (document.scrollingElement as HTMLElement | null) ?? document.documentElement;
  }

  // ¿La vista está pegada al final de la conversación? Sin referencia todavía (primer
  // render) se asume que sí, que es lo que se espera al abrir el chat.
  private estaAlFinal(): boolean {
    const fin = this.composer?.nativeElement;
    if (!fin) return true;
    const contenedor = this.contenedorDesplazable(fin);
    return (
      contenedor.scrollHeight - contenedor.scrollTop - contenedor.clientHeight <= MARGEN_FINAL
    );
  }

  // Baja hasta el último mensaje después de que Angular pinte los nuevos. Suave para
  // los mensajes que van llegando; de golpe al abrir el chat, para no ver el viaje.
  private bajarAlFinal(suave: boolean) {
    afterNextRender(
      () =>
        this.composer?.nativeElement.scrollIntoView({
          block: 'end',
          behavior: suave ? 'smooth' : 'auto',
        }),
      { injector: this.injector },
    );
  }

  // Solo reemplazamos la lista cuando algo cambió de verdad: así el @for no vuelve a
  // pintar los mensajes (ni interrumpe una selección de texto) en cada ciclo.
  private hayNovedades(nuevos: MensajeChatResponse[]): boolean {
    const actuales = this.mensajes();
    if (actuales.length !== nuevos.length) return true;
    return nuevos.some(
      (mensaje, indice) =>
        actuales[indice].idMensaje !== mensaje.idMensaje ||
        actuales[indice].contenido !== mensaje.contenido ||
        actuales[indice].fechaEnvio !== mensaje.fechaEnvio,
    );
  }
  get idUsuario() {
    return this.sesion.idUsuario(this.rol);
  }
  cargar() {
    // Descartamos un refresco en vuelo: si respondiera después de esta carga podría
    // devolver a la lista un mensaje que acabamos de eliminar.
    this.peticionRefresco?.unsubscribe();
    // Se mide antes de pedir los datos, mientras la vista sigue en su sitio.
    const bajar = this.primeraCarga || this.estaAlFinal();
    this.cargando.set(true);
    this.error.set(false);
    this.api.listarMensajes(this.idGrupo, this.idUsuario).subscribe({
      next: (mensajes) => {
        this.mensajes.set(mensajes);
        this.cargando.set(false);
        if (bajar) this.bajarAlFinal(!this.primeraCarga);
        this.primeraCarga = false;
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
  enviar() {
    // El guard enviando() es lo que evita los mensajes duplicados: sin él, un segundo
    // clic antes de que respondiera el servidor creaba una segunda fila con el mismo texto.
    if (!this.puedeEnviar() || this.form.invalid || this.enviando()) return;
    this.errorAccion.set('');
    this.enviando.set(true);
    this.api
      .enviarMensaje(this.idGrupo, {
        idUsuario: this.idUsuario,
        contenido: this.form.controls.mensaje.value.trim(),
      })
      .subscribe({
        next: (creado) => {
          // resetForm() (y no form.reset()) es lo que borra el estado 'submitted' del
          // formulario: con él puesto, Material pinta el campo vacío en rojo en cuanto
          // se envía, aunque no haya ningún error que mostrar.
          this.formDirective?.resetForm();
          this.form.reset();
          this.puedeEnviar.set(false);
          this.enviando.set(false);
          // El POST ya devuelve el mensaje creado, así que se añade al final de la lista
          // en lugar de recargar la conversación: nada se vacía ni se vuelve a pintar,
          // el @for solo agrega la burbuja nueva.
          this.agregar(creado);
          this.bajarAlFinal(true);
        },
        error: (respuesta) => {
          this.enviando.set(false);
          this.errorAccion.set(respuesta.error?.mensaje || 'No pudimos enviar tu mensaje.');
        },
      });
  }
  eliminar(idMensaje: number) {
    this.errorAccion.set('');
    this.api.eliminarMensaje(this.idGrupo, idMensaje, this.idUsuario).subscribe({
      next: () => {
        this.aviso.mostrar('eliminado');
        this.ahora.set(Date.now());
        // Igual que al enviar: se retira esa burbuja y el resto de la conversación
        // se queda como está.
        this.mensajes.update((lista) => lista.filter((m) => m.idMensaje !== idMensaje));
      },
      error: (respuesta) => {
        this.errorAccion.set(respuesta.error?.mensaje || 'No pudimos eliminar el mensaje.');
      },
    });
  }
}
