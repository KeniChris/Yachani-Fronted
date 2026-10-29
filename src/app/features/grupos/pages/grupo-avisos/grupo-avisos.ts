import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { confirmarAccion } from '../../../../shared/components/dialogo-confirmacion/dialogo-confirmacion';
import { ContextoGrupo } from '../../contexto-grupo';
import { AvisoGrupo, PrioridadAviso } from '../../grupos.models';
import { etiquetaDia, formatearHora } from '../../grupos.formato';

@Component({
  selector: 'app-grupo-avisos',
  imports: [ReactiveFormsModule, MatButtonModule, MatButtonToggleModule, MatFormFieldModule, MatIconModule, MatInputModule, MatMenuModule, MatSlideToggleModule],
  templateUrl: './grupo-avisos.html',
  styleUrls: ['../../grupos.css', './grupo-avisos.css'],
})
export class GrupoAvisos {
  readonly ctx = inject(ContextoGrupo);
  private readonly store = this.ctx.store;
  private readonly dialog = inject(MatDialog);
  private readonly fb = inject(FormBuilder);
  private readonly tituloFormulario = viewChild<ElementRef<HTMLElement>>('tituloFormulario');

  readonly form = this.fb.nonNullable.group({
    titulo: ['', [Validators.required, Validators.maxLength(80)]],
    contenido: ['', [Validators.required, Validators.maxLength(500)]],
    prioridad: ['normal' as PrioridadAviso],
    fijado: [false],
  });
  readonly editandoId = signal<string | null>(null);
  readonly camposFaltantes = signal(false);
  readonly mensaje = signal('');

  // Los avisos fijados van primero; luego, del más reciente al más antiguo.
  readonly avisos = computed(() => this.store.avisos()
    .filter(aviso => aviso.grupoId === this.ctx.grupoId())
    .sort((a, b) => Number(b.fijado) - Number(a.fijado) || b.fechaEnvio.getTime() - a.fechaEnvio.getTime()));

  fecha(aviso: AvisoGrupo): string {
    return `${etiquetaDia(aviso.fechaEnvio, this.store.ahora())}, ${formatearHora(aviso.fechaEnvio)}`;
  }

  editar(aviso: AvisoGrupo): void {
    this.form.reset({ titulo: aviso.titulo, contenido: aviso.contenido, prioridad: aviso.prioridad, fijado: aviso.fijado });
    this.editandoId.set(aviso.id);
    this.camposFaltantes.set(false);
    this.mensaje.set('');
    setTimeout(() => this.tituloFormulario()?.nativeElement.focus());
  }

  cancelar(): void {
    this.editandoId.set(null);
    this.camposFaltantes.set(false);
    this.form.reset();
  }

  guardar(): void {
    this.form.markAllAsTouched();
    this.camposFaltantes.set(this.form.invalid);
    if (this.form.invalid) return;
    const valores = this.form.getRawValue();
    const datos = { ...valores, titulo: valores.titulo.trim(), contenido: valores.contenido.trim() };
    const id = this.editandoId();
    // Pendiente: el backend publica el aviso y notifica a todos los integrantes.
    if (id) {
      this.store.editarAviso(id, datos);
      this.mensaje.set(`Aviso actualizado. Se notificó el cambio a los ${this.ctx.integrantesANotificar()} integrantes.`);
    } else {
      this.store.publicarAviso(this.ctx.grupoId(), this.ctx.usuarioId, datos);
      this.mensaje.set(`Aviso publicado. Se notificó a los ${this.ctx.integrantesANotificar()} integrantes del grupo.`);
    }
    this.cancelar();
  }

  alternarFijado(aviso: AvisoGrupo): void {
    this.store.alternarFijado(aviso.id);
    this.mensaje.set(aviso.fijado ? `«${aviso.titulo}» ya no está fijado.` : `«${aviso.titulo}» quedó fijado al inicio.`);
  }

  eliminar(aviso: AvisoGrupo): void {
    confirmarAccion(this.dialog, {
      titulo: '¿Eliminar este aviso?',
      mensaje: `«${aviso.titulo}» dejará de mostrarse a los integrantes. Esta acción no se puede deshacer.`,
      confirmar: 'Eliminar', tono: 'peligro', icono: 'delete',
    }).subscribe(confirmado => {
      if (!confirmado) return;
      this.store.eliminarAviso(aviso.id);
      if (this.editandoId() === aviso.id) this.cancelar();
      this.mensaje.set('Aviso eliminado.');
    });
  }
}
