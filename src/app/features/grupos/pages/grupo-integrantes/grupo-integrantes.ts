import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ContextoGrupo } from '../../contexto-grupo';
import { IntegranteGrupo } from '../../grupos.models';
import { etiquetaDia, formatearDiaMes, iniciales } from '../../grupos.formato';

// Regla de la etiqueta "Nuevo": se unió hace menos de 24 horas.
const VENTANA_NUEVO_MS = 24 * 60 * 60_000;

@Component({
  selector: 'app-grupo-integrantes',
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './grupo-integrantes.html',
  styleUrls: ['../../grupos.css', './grupo-integrantes.css'],
})
export class GrupoIntegrantes {
  readonly ctx = inject(ContextoGrupo);
  private readonly store = this.ctx.store;

  readonly busqueda = signal('');
  readonly limite = signal(this.ctx.grupo()?.capacidadMaxima ?? 0);
  readonly mensaje = signal('');
  readonly error = signal('');

  readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    // El tutor aparece primero; el resto, por fecha de ingreso.
    return this.ctx.integrantes()
      .filter(item => !texto || `${item.nombre} ${item.carrera}`.toLowerCase().includes(texto))
      .sort((a, b) => Number(b.rol === 'tutor') - Number(a.rol === 'tutor') || (a.fechaIngreso?.getTime() ?? 0) - (b.fechaIngreso?.getTime() ?? 0));
  });
  readonly ocupacion = computed(() => {
    const capacidad = this.ctx.grupo()?.capacidadMaxima ?? 0;
    return capacidad ? Math.min(100, Math.round(this.ctx.integrantes().length / capacidad * 100)) : 0;
  });
  readonly limiteInvalido = computed(() => this.limite() < this.ctx.integrantes().length);
  readonly sinCambios = computed(() => this.limite() === this.ctx.grupo()?.capacidadMaxima);

  readonly iniciales = iniciales;

  esPropio(item: IntegranteGrupo): boolean { return item.usuarioId === this.ctx.usuarioId; }
  esNuevo(item: IntegranteGrupo): boolean {
    return !!item.fechaIngreso && this.store.ahora().getTime() - item.fechaIngreso.getTime() < VENTANA_NUEVO_MS;
  }
  ingreso(item: IntegranteGrupo): string {
    if (!item.fechaIngreso) return '—';
    const etiqueta = etiquetaDia(item.fechaIngreso, this.store.ahora());
    return etiqueta === 'Hoy' || etiqueta === 'Ayer' ? etiqueta : formatearDiaMes(item.fechaIngreso);
  }
  carrera(item: IntegranteGrupo): string { return item.ciclo ? `${item.carrera} · ${item.ciclo}` : item.carrera; }

  buscar(evento: Event): void { this.busqueda.set((evento.target as HTMLInputElement).value); }

  cambiarLimite(delta: number): void {
    this.limite.update(valor => Math.max(1, valor + delta));
    this.mensaje.set('');
    this.error.set(this.limiteInvalido() ? `El límite no puede ser menor que los integrantes actuales (${this.ctx.integrantes().length}).` : '');
  }

  guardarLimite(): void {
    // Pendiente: actualizar la capacidad en el backend; él recalcula los cupos disponibles.
    const error = this.store.actualizarCapacidad(this.ctx.grupoId(), this.limite());
    this.error.set(error ?? '');
    if (error) return;
    this.mensaje.set(`Cupos disponibles actualizados: ${this.ctx.cuposDisponibles()} (${this.ctx.integrantes().length} de ${this.limite()}).`);
  }
}
