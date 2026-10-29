import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { confirmarAccion } from '../../../../shared/components/dialogo-confirmacion/dialogo-confirmacion';
import { ContextoGrupo } from '../../contexto-grupo';
import { DatosSesion, ModalidadSesion, SesionEstudio } from '../../grupos.models';
import { diferenciaDias, etiquetaDia, formatearDiaMes, formatearDiaSemana, formatearHora, formatearRangoHora } from '../../grupos.formato';

// "Por empezar": dentro de la misma ventana del recordatorio.
const MARGEN_UNIRSE_MS = 30 * 60_000;
const dosDigitos = (valor: number) => String(valor).padStart(2, '0');
const aFechaInput = (fecha: Date) => `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}`;
const aHoraInput = (fecha: Date) => `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
const combinar = (fecha: string, hora: string) => new Date(`${fecha}T${hora}:00`);

@Component({
  selector: 'app-grupo-sesiones',
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  templateUrl: './grupo-sesiones.html',
  styleUrls: ['../../grupos.css', './grupo-sesiones.css'],
})
export class GrupoSesiones {
  readonly ctx = inject(ContextoGrupo);
  private readonly store = this.ctx.store;
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly tituloFormulario = viewChild<ElementRef<HTMLElement>>('tituloFormulario');

  readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(80)]],
    temaId: ['', Validators.required],
    fecha: ['', Validators.required],
    modalidad: ['virtual' as ModalidadSesion, Validators.required],
    horaInicio: ['', Validators.required],
    horaFin: ['', Validators.required],
    enlaceLugar: ['', Validators.maxLength(200)],
    descripcion: ['', Validators.maxLength(300)],
  });
  readonly editandoId = signal<string | null>(null);
  readonly datosInvalidos = signal(false);
  readonly mensaje = signal('');
  readonly filtro = signal<'semana' | 'todas'>('semana');
  readonly detallesAbiertos = signal<string | null>(null);

  readonly sesiones = computed(() => this.store.sesiones()
    .filter(sesion => sesion.grupoId === this.ctx.grupoId() && sesion.fin > this.store.ahora())
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime()));
  // "Esta semana": sesiones de hoy hasta dentro de 7 días.
  readonly sesionesVisibles = computed(() => this.filtro() === 'todas' ? this.sesiones()
    : this.sesiones().filter(sesion => diferenciaDias(sesion.inicio, this.store.ahora()) <= 7));

  readonly formatearDiaMes = formatearDiaMes;

  diaSemana(fecha: Date): string { return formatearDiaSemana(fecha).toUpperCase(); }
  dia(fecha: Date): string { return etiquetaDia(fecha, this.store.ahora()); }
  rango(sesion: { inicio: Date; fin: Date }): string { return formatearRangoHora(sesion.inicio, sesion.fin); }
  hora(fecha: Date): string { return formatearHora(fecha); }
  nombreTema(temaId: string | null): string { return this.store.tema(temaId)?.nombre ?? ''; }
  modalidad(sesion: SesionEstudio): string { return sesion.modalidad === 'virtual' ? 'Virtual' : 'Presencial'; }

  // "Unirse" solo para sesiones virtuales que están por empezar o en curso.
  puedeUnirse(sesion: SesionEstudio): boolean {
    const ahora = this.store.ahora().getTime();
    return sesion.modalidad === 'virtual' && sesion.estado !== 'cancelada' && !!sesion.enlaceLugar &&
      ahora >= sesion.inicio.getTime() - MARGEN_UNIRSE_MS && ahora <= sesion.fin.getTime();
  }

  enlace(sesion: SesionEstudio): string {
    return /^https?:\/\//.test(sesion.enlaceLugar) ? sesion.enlaceLugar : `https://${sesion.enlaceLugar}`;
  }

  alternarDetalles(id: string): void {
    this.detallesAbiertos.update(actual => actual === id ? null : id);
  }

  editar(sesion: SesionEstudio): void {
    this.form.reset({
      titulo: sesion.titulo, temaId: sesion.temaId ?? '', fecha: aFechaInput(sesion.inicio), modalidad: sesion.modalidad,
      horaInicio: aHoraInput(sesion.inicio), horaFin: aHoraInput(sesion.fin), enlaceLugar: sesion.enlaceLugar, descripcion: sesion.descripcion,
    });
    this.editandoId.set(sesion.id);
    this.datosInvalidos.set(false);
    this.mensaje.set('');
    setTimeout(() => this.tituloFormulario()?.nativeElement.focus());
  }

  cancelarEdicion(): void {
    this.editandoId.set(null);
    this.datosInvalidos.set(false);
    this.form.reset();
  }

  guardar(): void {
    const datos = this.validar();
    if (!datos) return;
    const id = this.editandoId();
    // Pendiente: enviar al backend; él notifica a los integrantes y reprograma los recordatorios.
    if (id) {
      this.store.editarSesion(id, datos);
      this.mensaje.set(`Cambios de «${datos.titulo}» guardados. Se avisó a los ${this.ctx.integrantesANotificar()} integrantes.`);
    } else {
      this.store.crearSesion(this.ctx.grupoId(), datos);
      this.mensaje.set(`Sesión «${datos.titulo}» creada. Ya es visible para los ${this.ctx.integrantes().length} integrantes.`);
    }
    this.cancelarEdicion();
  }

  cancelarSesion(sesion: SesionEstudio): void {
    confirmarAccion(this.dialog, {
      titulo: `¿Cancelar «${sesion.titulo}»?`,
      mensaje: `Se avisará a los ${this.ctx.integrantesANotificar()} integrantes y no se enviarán recordatorios de esta sesión. Esta acción no se puede deshacer.`,
      confirmar: 'Cancelar sesión', cancelar: 'Volver', tono: 'peligro', icono: 'event_busy',
    }).subscribe(confirmado => {
      if (!confirmado) return;
      this.store.cancelarSesion(sesion.id);
      if (this.editandoId() === sesion.id) this.cancelarEdicion();
      this.mensaje.set(`Sesión «${sesion.titulo}» cancelada. Se avisó a los integrantes.`);
    });
  }

  private validar(): DatosSesion | null {
    const { fecha, horaInicio, horaFin } = this.form.controls;
    fecha.updateValueAndValidity();
    horaFin.updateValueAndValidity();
    const valores = this.form.getRawValue();
    if (valores.fecha && valores.horaInicio && combinar(valores.fecha, valores.horaInicio) <= new Date()) fecha.setErrors({ pasada: true });
    if (valores.horaInicio && valores.horaFin && valores.horaFin <= valores.horaInicio) horaFin.setErrors({ antesDeInicio: true });
    this.form.markAllAsTouched();
    this.datosInvalidos.set(this.form.invalid);
    if (this.form.invalid) return null;
    return {
      titulo: valores.titulo.trim(), temaId: valores.temaId, modalidad: valores.modalidad,
      inicio: combinar(valores.fecha, horaInicio.value), fin: combinar(valores.fecha, valores.horaFin),
      enlaceLugar: valores.enlaceLugar.trim(), descripcion: valores.descripcion.trim(),
    };
  }
}
