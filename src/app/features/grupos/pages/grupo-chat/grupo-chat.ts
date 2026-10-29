import { Component, DestroyRef, ElementRef, afterNextRender, computed, inject, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { confirmarAccion } from '../../../../shared/components/dialogo-confirmacion/dialogo-confirmacion';
import { ContextoGrupo } from '../../contexto-grupo';
import { MensajeChat } from '../../grupos.models';
import { etiquetaDia, formatearHora, formatearTamano, mismoDia } from '../../grupos.formato';

// Pendiente de confirmar con backend (Cloudinary): formatos y tamaño máximo por archivo.
export const FORMATOS_PERMITIDOS = ['pdf', 'docx', 'pptx', 'xlsx', 'jpg', 'jpeg', 'png'];
export const MAX_ARCHIVOS_POR_ENVIO = 5;
export const MAX_TAMANO_BYTES = 20 * 1024 * 1024;

interface ArchivoSeleccionado { nombre: string; tamanoBytes: number; extension: string; error: string | null; }
interface Aviso { tipo: 'success' | 'error'; texto: string; }

@Component({
  selector: 'app-grupo-chat',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatSelectModule],
  templateUrl: './grupo-chat.html',
  styleUrls: ['../../grupos.css', './grupo-chat.css'],
})
export class GrupoChat {
  readonly ctx = inject(ContextoGrupo);
  private readonly store = this.ctx.store;
  private readonly dialog = inject(MatDialog);
  private readonly lista = viewChild<ElementRef<HTMLElement>>('lista');

  readonly formatosTexto = 'PDF, DOCX, PPTX, XLSX, JPG y PNG';
  readonly maxArchivos = MAX_ARCHIVOS_POR_ENVIO;
  readonly aceptar = FORMATOS_PERMITIDOS.map(formato => `.${formato}`).join(',');
  readonly texto = new FormControl('', { nonNullable: true });
  readonly archivos = signal<ArchivoSeleccionado[]>([]);
  readonly temaDestino = new FormControl<string | null>(null);
  readonly limiteSuperado = signal(false);
  readonly aviso = signal<Aviso | null>(null);
  // Reloj por segundo para el límite de 2 minutos de "Eliminar para todos".
  readonly reloj = signal(new Date());

  readonly mensajes = computed(() => this.store.mensajes()
    .filter(mensaje => mensaje.grupoId === this.ctx.grupoId())
    .sort((a, b) => a.fechaEnvio.getTime() - b.fechaEnvio.getTime()));
  readonly elementos = computed(() => this.mensajes().map((mensaje, i, lista) => ({
    mensaje,
    separador: i === 0 || !mismoDia(lista[i - 1].fechaEnvio, mensaje.fechaEnvio) ? etiquetaDia(mensaje.fechaEnvio, this.store.ahora()) : '',
  })));
  // Adjuntos enviados en este chat; los materiales por tema se gestionan en "Temas y materiales".
  readonly compartidos = computed(() => this.mensajes().filter(mensaje => mensaje.adjunto && !mensaje.eliminado).reverse());
  readonly archivosValidos = computed(() => this.archivos().filter(archivo => !archivo.error));
  readonly archivosRechazados = computed(() => this.archivos().filter(archivo => archivo.error));

  readonly formatearHora = formatearHora;
  readonly formatearTamano = formatearTamano;

  constructor() {
    const intervalo = setInterval(() => this.reloj.set(new Date()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(intervalo));
    afterNextRender(() => this.irAlFinal());
  }

  esPropio(mensaje: MensajeChat): boolean { return mensaje.autorId === this.ctx.usuarioId; }
  esTutor(usuarioId: string): boolean { return usuarioId === this.ctx.grupo()?.tutorId; }
  nombreTema(temaId: string | null): string { return this.store.tema(temaId)?.nombre ?? ''; }

  puedeEliminar(mensaje: MensajeChat): boolean {
    return this.store.puedeEliminarMensaje(mensaje, this.ctx.usuarioId, this.reloj());
  }

  tiempoRestante(mensaje: MensajeChat): string {
    const segundos = Math.ceil(this.store.msRestantesEliminar(mensaje, this.reloj()) / 1000);
    return `${Math.floor(segundos / 60)}:${String(segundos % 60).padStart(2, '0')} min`;
  }

  tieneOpciones(mensaje: MensajeChat): boolean {
    return !mensaje.eliminado && (!!mensaje.contenido || this.puedeEliminar(mensaje));
  }

  iconoArchivo(extension: string): string {
    if (['jpg', 'jpeg', 'png'].includes(extension)) return 'image';
    if (extension === 'pptx') return 'bar_chart';
    if (extension === 'xlsx') return 'table_chart';
    return 'description';
  }

  enviar(): void {
    const contenido = this.texto.value.trim();
    if (!contenido) {
      this.texto.setErrors({ vacio: true });
      this.texto.markAsTouched();
      return;
    }
    // Pendiente: enviar por el canal del chat y esperar la confirmación del backend.
    this.store.enviarMensaje(this.ctx.grupoId(), this.ctx.usuarioId, contenido);
    this.texto.reset();
    this.aviso.set(null);
    this.irAlFinal();
  }

  seleccionarArchivos(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const seleccion = Array.from(input.files ?? []);
    input.value = '';
    if (!seleccion.length) return;
    this.limiteSuperado.set(seleccion.length > MAX_ARCHIVOS_POR_ENVIO);
    this.archivos.set(seleccion.slice(0, MAX_ARCHIVOS_POR_ENVIO).map(archivo => {
      const extension = archivo.name.split('.').pop()?.toLowerCase() ?? '';
      const error = !FORMATOS_PERMITIDOS.includes(extension) ? 'Formato no compatible'
        : archivo.size > MAX_TAMANO_BYTES ? 'Supera los 20 MB' : null;
      return { nombre: archivo.name, tamanoBytes: archivo.size, extension, error };
    }));
    this.aviso.set(null);
  }

  quitarArchivo(nombre: string): void {
    this.archivos.update(lista => lista.filter(archivo => archivo.nombre !== nombre));
    if (!this.archivos().length) this.cancelarAdjuntos();
  }

  cancelarAdjuntos(): void {
    this.archivos.set([]);
    this.limiteSuperado.set(false);
    this.temaDestino.reset();
  }

  enviarAdjuntos(): void {
    const validos = this.archivosValidos();
    const rechazados = this.archivosRechazados();
    const temaId = this.temaDestino.value;
    // Pendiente: subir a Cloudinary y registrar el material en el tema destino.
    validos.forEach(({ nombre, tamanoBytes, extension }) =>
      this.store.enviarMensaje(this.ctx.grupoId(), this.ctx.usuarioId, '', { nombre, tamanoBytes, extension, temaId }));
    const tema = this.nombreTema(temaId);
    const compartidos = validos.length === 1 ? '1 archivo se compartió' : `${validos.length} archivos se compartieron`;
    this.aviso.set(rechazados.length
      ? { tipo: 'error', texto: `No se pudo enviar ${rechazados.map(archivo => `«${archivo.nombre}»`).join(', ')}: formato o tamaño no compatible.${validos.length ? ` ${compartidos} con el grupo.` : ''}` }
      : { tipo: 'success', texto: `${compartidos} con el grupo${tema ? ` en «${tema}»` : ''}.` });
    this.cancelarAdjuntos();
    this.irAlFinal();
  }

  copiar(mensaje: MensajeChat): void {
    navigator.clipboard?.writeText(mensaje.contenido).then(
      () => this.aviso.set({ tipo: 'success', texto: 'Mensaje copiado.' }),
      () => this.aviso.set({ tipo: 'error', texto: 'No se pudo copiar el mensaje.' }),
    );
  }

  eliminar(mensaje: MensajeChat): void {
    confirmarAccion(this.dialog, {
      titulo: '¿Eliminar para todos?',
      mensaje: 'El mensaje se reemplazará por «Este mensaje fue eliminado» para todos los integrantes.',
      confirmar: 'Eliminar', tono: 'peligro', icono: 'delete',
    }).subscribe(confirmado => {
      if (!confirmado) return;
      // Pendiente: el backend debe validar autoría y el límite de 2 minutos.
      const eliminado = this.store.eliminarMensaje(mensaje.id, this.ctx.usuarioId);
      this.aviso.set(eliminado ? null : { tipo: 'error', texto: 'Ya pasaron los 2 minutos para eliminar este mensaje.' });
    });
  }

  private irAlFinal(): void {
    setTimeout(() => {
      const lista = this.lista()?.nativeElement;
      if (lista) lista.scrollTop = lista.scrollHeight;
    });
  }
}
