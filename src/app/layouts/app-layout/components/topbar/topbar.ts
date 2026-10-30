import { Component, Input, Output, EventEmitter, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { GruposStore } from '../../../../features/grupos/grupos.store';
import { SesionEstudio } from '../../../../features/grupos/grupos.models';
import { ICONOS_NOTIFICACION, etiquetaDia, formatearFechaLarga, formatearRangoHora, haceTiempo, minutosHasta, rutaGrupo } from '../../../../features/grupos/grupos.formato';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  readonly store = inject(GruposStore);
  @Input() userName = '';
  @Input() role: 'estudiante' | 'tutor' = 'estudiante';
  @Input() showMenuButton = false;
  @Input() menuOpen = false;
  @Output() menuToggle = new EventEmitter<void>();

  readonly iconos = ICONOS_NOTIFICACION;
  readonly recientes = computed(() => [...this.store.notificaciones()].sort((a, b) => b.fecha.getTime() - a.fecha.getTime()).slice(0, 3));
  // Aviso flotante: se muestra una vez por sesión de estudio dentro de su ventana de recordatorio.
  readonly avisoFlotante = computed(() => {
    const sesion = this.store.recordatorioActivo();
    return sesion && !this.store.recordatoriosDescartados().includes(sesion.id) ? sesion : null;
  });

  get initials(): string {
    return this.userName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  get rutaNotificaciones(): string { return `/app/${this.role}/notificaciones`; }
  rutaSesion(sesionId: string): string | null {
    const sesion = this.store.sesion(sesionId);
    return sesion ? rutaGrupo(this.role, sesion.grupoId, 'sesiones') : null;
  }
  grupo(sesion: SesionEstudio): string { return this.store.grupo(sesion.grupoId)?.nombre ?? 'Grupo'; }
  tema(sesion: SesionEstudio): string { return this.store.tema(sesion.temaId)?.nombre ?? 'Sin tema'; }
  curso(sesion: SesionEstudio): string { return this.store.grupo(sesion.grupoId)?.curso ?? ''; }
  minutos(sesion: SesionEstudio): number { return Math.max(1, minutosHasta(sesion.inicio, this.store.ahora())); }
  dia(sesion: SesionEstudio): string { return etiquetaDia(sesion.inicio, this.store.ahora()); }
  fecha(sesion: SesionEstudio): string { return formatearFechaLarga(sesion.inicio); }
  rango(sesion: SesionEstudio): string { return formatearRangoHora(sesion.inicio, sesion.fin); }
  hace(fecha: Date): string { return haceTiempo(fecha, this.store.ahora()); }
}
