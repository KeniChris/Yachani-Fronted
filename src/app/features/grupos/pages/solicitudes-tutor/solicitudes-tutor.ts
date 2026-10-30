import { Component, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AppLayout } from '../../../../layouts/app-layout/app-layout';
import { GruposStore } from '../../grupos.store';
import { SolicitudUnion } from '../../grupos.models';
import { rutaGrupo } from '../../grupos.formato';
import { RespuestaSolicitud, TarjetaSolicitud, confirmarRespuesta } from '../../components/tarjeta-solicitud/tarjeta-solicitud';
import { compararSolicitudes } from '../grupo-solicitudes/grupo-solicitudes';

@Component({
  selector: 'app-solicitudes-tutor',
  imports: [RouterLink, MatIconModule, TarjetaSolicitud],
  templateUrl: './solicitudes-tutor.html',
  styleUrls: ['../../grupos.css', './solicitudes-tutor.css'],
})
export class SolicitudesTutor {
  readonly store = inject(GruposStore);
  private readonly dialog = inject(MatDialog);
  readonly filtro = signal<string>('todos');
  readonly verRespondidas = signal(false);
  readonly error = signal('');

  readonly grupos = computed(() => this.store.gruposDe('tutor', this.store.usuarioActualId('tutor')));
  private readonly propias = computed(() => {
    const ids = new Set(this.grupos().map(grupo => grupo.id));
    return this.store.solicitudes().filter(item => ids.has(item.grupoId));
  });
  readonly pendientes = computed(() => this.propias().filter(item => item.estado === 'pendiente'));
  readonly solicitudes = computed(() => this.propias()
    .filter(item => (this.filtro() === 'todos' || item.grupoId === this.filtro()) && (this.verRespondidas() || item.estado === 'pendiente'))
    .sort(compararSolicitudes));

  constructor() {
    const layout = inject(AppLayout, { optional: true });
    if (this.store.modoPrevisualizacion && layout) {
      afterNextRender(() => layout.nombrePrevisualizacion.set(this.store.nombreUsuario('tutor')));
      inject(DestroyRef).onDestroy(() => layout.nombrePrevisualizacion.set(''));
    }
  }

  pendientesDe(grupoId: string): number { return this.pendientes().filter(item => item.grupoId === grupoId).length; }
  nombreGrupo(grupoId: string): string { return this.store.grupo(grupoId)?.nombre ?? 'Grupo'; }
  cupos(grupoId: string): number {
    const grupo = this.store.grupo(grupoId);
    return grupo ? Math.max(0, grupo.capacidadMaxima - this.store.integrantesDe(grupoId).length) : 0;
  }
  rutaIntegrantes(grupoId: string): string { return rutaGrupo('tutor', grupoId, 'integrantes'); }

  responder(item: SolicitudUnion, respuesta: RespuestaSolicitud): void {
    confirmarRespuesta(this.dialog, item, respuesta, this.cupos(item.grupoId)).subscribe(confirmado => {
      if (!confirmado) return;
      // Pendiente: enviar la respuesta al backend; él actualiza cupos y notifica al estudiante.
      this.error.set(this.store.responderSolicitud(item.id, respuesta) ?? '');
    });
  }
}
