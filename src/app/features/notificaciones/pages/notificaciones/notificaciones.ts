import { Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppLayout } from '../../../../layouts/app-layout/app-layout';
import { GruposStore } from '../../../grupos/grupos.store';
import { RolGrupo, SesionEstudio } from '../../../grupos/grupos.models';
import { ICONOS_NOTIFICACION, etiquetaDia, formatearFechaLarga, formatearHora, formatearRangoHora, haceTiempo, minutosHasta, mismoDia, rutaGrupo } from '../../../grupos/grupos.formato';

type Filtro = 'todas' | 'recordatorios' | 'cambios';

@Component({
  selector: 'app-notificaciones',
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['../../../grupos/grupos.css', './notificaciones.css'],
})
export class Notificaciones {
  readonly store = inject(GruposStore);
  private readonly rol: RolGrupo = inject(ActivatedRoute).snapshot.data['rolVista'] === 'tutor' ? 'tutor' : 'estudiante';
  readonly misGrupos = `/app/${this.rol}/grupos`;
  readonly filtro = signal<Filtro>('todas');
  readonly filtros: { valor: Filtro; etiqueta: string }[] = [
    { valor: 'todas', etiqueta: 'Todas' },
    { valor: 'recordatorios', etiqueta: 'Recordatorios' },
    { valor: 'cambios', etiqueta: 'Cambios de sesión' },
  ];
  readonly iconos = ICONOS_NOTIFICACION;

  readonly recordatorios = computed(() => this.store.recordatorios().filter(sesion =>
    this.filtro() === 'todas' || (this.filtro() === 'cambios') === (sesion.estado === 'modificada')));
  readonly actividad = computed(() => this.store.notificaciones()
    .filter(item => this.filtro() === 'todas' || (this.filtro() === 'recordatorios') === (item.tipo === 'recordatorio'))
    .sort((a, b) => b.fecha.getTime() - a.fecha.getTime()));

  constructor() {
    const layout = inject(AppLayout, { optional: true });
    if (this.store.modoPrevisualizacion && layout) {
      afterNextRender(() => layout.nombrePrevisualizacion.set(this.store.nombreUsuario(this.rol)));
      inject(DestroyRef).onDestroy(() => layout.nombrePrevisualizacion.set(''));
    }
  }

  grupo(sesion: SesionEstudio): string { return this.store.grupo(sesion.grupoId)?.nombre ?? 'Grupo'; }
  tema(sesion: SesionEstudio): string { return this.store.tema(sesion.temaId)?.nombre ?? 'Sin tema'; }
  dia(fecha: Date): string { return etiquetaDia(fecha, this.store.ahora()); }
  fechaLarga(fecha: Date): string { return formatearFechaLarga(fecha); }
  hora(fecha: Date): string { return formatearHora(fecha); }
  rango(sesion: { inicio: Date; fin: Date }): string { return formatearRangoHora(sesion.inicio, sesion.fin); }
  hace(fecha: Date): string { return haceTiempo(fecha, this.store.ahora()); }
  cambioFecha(sesion: SesionEstudio): boolean { return !!sesion.anterior && !mismoDia(sesion.anterior.inicio, sesion.inicio); }
  cambioHora(sesion: SesionEstudio): boolean { return !!sesion.anterior && this.hora(sesion.anterior.inicio) !== this.hora(sesion.inicio); }
  esActivo(sesion: SesionEstudio): boolean { return this.store.recordatorioActivo()?.id === sesion.id; }
  minutos(sesion: SesionEstudio): number { return Math.max(1, minutosHasta(sesion.inicio, this.store.ahora())); }

  rutaSesion(sesionId: string): string | null {
    const sesion = this.store.sesion(sesionId);
    return sesion ? rutaGrupo(this.rol, sesion.grupoId, 'sesiones') : null;
  }
}
