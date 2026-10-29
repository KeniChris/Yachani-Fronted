import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ContextoGrupo } from '../../contexto-grupo';
import { EstadoSolicitud, SolicitudUnion } from '../../grupos.models';
import { RespuestaSolicitud, TarjetaSolicitud, confirmarRespuesta } from '../../components/tarjeta-solicitud/tarjeta-solicitud';

export const ORDEN_SOLICITUDES: Record<EstadoSolicitud, number> = { pendiente: 0, aceptada: 1, rechazada: 2 };
// Pendientes primero; dentro de cada estado, la más reciente arriba.
export const compararSolicitudes = (a: SolicitudUnion, b: SolicitudUnion) =>
  ORDEN_SOLICITUDES[a.estado] - ORDEN_SOLICITUDES[b.estado] || b.fechaSolicitud.getTime() - a.fechaSolicitud.getTime();

@Component({
  selector: 'app-grupo-solicitudes',
  imports: [RouterLink, MatIconModule, TarjetaSolicitud],
  templateUrl: './grupo-solicitudes.html',
  styleUrls: ['../../grupos.css', './grupo-solicitudes.css'],
})
export class GrupoSolicitudes {
  readonly ctx = inject(ContextoGrupo);
  private readonly store = this.ctx.store;
  private readonly dialog = inject(MatDialog);
  readonly error = signal('');

  readonly solicitudes = computed(() => this.store.solicitudes()
    .filter(item => item.grupoId === this.ctx.grupoId())
    .sort(compararSolicitudes));
  readonly grupoLleno = computed(() => this.ctx.cuposDisponibles() === 0);

  responder(item: SolicitudUnion, respuesta: RespuestaSolicitud): void {
    confirmarRespuesta(this.dialog, item, respuesta, this.ctx.cuposDisponibles()).subscribe(confirmado => {
      if (!confirmado) return;
      // Pendiente: enviar la respuesta al backend; él actualiza cupos y notifica al estudiante.
      this.error.set(this.store.responderSolicitud(item.id, respuesta) ?? '');
    });
  }
}
