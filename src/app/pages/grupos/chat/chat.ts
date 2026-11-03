import { Component, DestroyRef, Input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ChatService } from '../../../core/services/chat.service';
import { MensajeChatResponse, MINUTOS_PARA_ELIMINAR } from '../../../core/models/chat.models';
import {
  ID_GRUPO_DEMO,
  idGrupoDesdeSlug,
} from '../../../core/services/grupo-estudio.service';
import { SesionUsuarioService } from '../../../core/services/sesion-usuario.service';


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
  // /api/grupos/{idGrupo}/mensajes. La app es zoneless: el estado que cambia tras una
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
  readonly avisoEnviado = signal(false);
  readonly avisoEliminado = signal(false);
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
  // El mensaje empieza vacío con el placeholder de Figma (CH12).
  readonly form = new FormGroup({
    mensaje: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(1000)],
    }),
  });
  constructor(
    public readonly dialog: MatDialog,
    private readonly api: ChatService,
    private readonly sesion: SesionUsuarioService,
    private readonly destroyRef: DestroyRef,
  ) {}
  ngOnInit() {
    this.cargar();
    // Refresca la ventana de borrado para que el botón desaparezca al cumplirse los 2 minutos.
    const reloj = setInterval(() => this.ahora.set(Date.now()), 10000);
    this.destroyRef.onDestroy(() => clearInterval(reloj));
  }
  get idUsuario() {
    return this.sesion.idUsuario(this.rol);
  }
  cargar() {
    this.cargando.set(true);
    this.error.set(false);
    this.api.listarMensajes(this.idGrupo, this.idUsuario).subscribe({
      next: (mensajes) => {
        this.mensajes.set(mensajes);
        this.cargando.set(false);
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
    if (this.form.invalid || this.enviando()) return;
    this.errorAccion.set('');
    this.enviando.set(true);
    this.api
      .enviarMensaje(this.idGrupo, {
        idUsuario: this.idUsuario,
        contenido: this.form.controls.mensaje.value,
      })
      .subscribe({
        next: () => {
          this.form.reset();
          this.avisoEnviado.set(true);
          this.avisoEliminado.set(false);
          this.enviando.set(false);
          this.cargar();
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
        this.avisoEliminado.set(true);
        this.avisoEnviado.set(false);
        this.ahora.set(Date.now());
        this.cargar();
      },
      error: (respuesta) => {
        this.errorAccion.set(respuesta.error?.mensaje || 'No pudimos eliminar el mensaje.');
      },
    });
  }
}
