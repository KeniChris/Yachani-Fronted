import { Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppLayout } from '../../../../layouts/app-layout/app-layout';
import { GruposStore } from '../../grupos.store';
import { GrupoEstudio, RolGrupo } from '../../grupos.models';
import { etiquetaDia, formatearHora, formatearHorario, iniciales, rutaGrupo } from '../../grupos.formato';

@Component({
  selector: 'app-mis-grupos',
  imports: [RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './mis-grupos.html',
  styleUrls: ['../../grupos.css', './mis-grupos.css'],
})
export class MisGrupos {
  readonly store = inject(GruposStore);
  private readonly router = inject(Router);
  readonly rol: RolGrupo = inject(ActivatedRoute).snapshot.data['rolVista'] === 'tutor' ? 'tutor' : 'estudiante';
  readonly esTutor = this.rol === 'tutor';
  private readonly usuarioId = this.store.usuarioActualId(this.rol);
  readonly busqueda = signal('');

  readonly grupos = computed(() => this.store.gruposDe(this.rol, this.usuarioId));
  readonly filtrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    return this.grupos().filter(grupo => !texto || `${grupo.nombre} ${grupo.curso} ${grupo.tema}`.toLowerCase().includes(texto));
  });
  readonly explorarDisponible = this.router.config.some(ruta => ruta.children?.some(hija => hija.path === 'explorar'));

  readonly formatearHorario = formatearHorario;
  readonly iniciales = iniciales;

  constructor() {
    const layout = inject(AppLayout, { optional: true });
    if (this.store.modoPrevisualizacion && layout) {
      afterNextRender(() => layout.nombrePrevisualizacion.set(this.store.nombreUsuario(this.rol)));
      inject(DestroyRef).onDestroy(() => layout.nombrePrevisualizacion.set(''));
    }
  }

  ruta(grupo: GrupoEstudio, pestana?: string): string { return rutaGrupo(this.rol, grupo.id, pestana); }
  rutaEditar(grupo: GrupoEstudio): string { return `${rutaGrupo('tutor', grupo.id)}/editar`; }
  integrantes(grupo: GrupoEstudio) { return this.store.integrantesDe(grupo.id); }
  ocupacion(grupo: GrupoEstudio): number {
    return grupo.capacidadMaxima ? Math.min(100, Math.round(this.integrantes(grupo).length / grupo.capacidadMaxima * 100)) : 0;
  }
  pendientes(grupo: GrupoEstudio): number {
    return this.store.solicitudes().filter(item => item.grupoId === grupo.id && item.estado === 'pendiente').length;
  }
  proxima(grupo: GrupoEstudio): string {
    const sesion = this.store.recordatorios().find(item => item.grupoId === grupo.id);
    return sesion ? `${etiquetaDia(sesion.inicio, this.store.ahora())}, ${formatearHora(sesion.inicio)}` : '';
  }
  tutor(grupo: GrupoEstudio): string {
    return this.integrantes(grupo).find(item => item.usuarioId === grupo.tutorId)?.nombre ?? 'Por asignar';
  }

  buscar(evento: Event): void { this.busqueda.set((evento.target as HTMLInputElement).value); }
}
