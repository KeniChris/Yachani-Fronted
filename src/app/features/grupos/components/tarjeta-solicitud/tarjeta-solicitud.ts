import { Component, computed, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Observable } from 'rxjs';
import { confirmarAccion } from '../../../../shared/components/dialogo-confirmacion/dialogo-confirmacion';
import { GruposStore } from '../../grupos.store';
import { SolicitudUnion } from '../../grupos.models';
import { haceTiempo, iniciales } from '../../grupos.formato';

export type RespuestaSolicitud = 'aceptada' | 'rechazada';

// Confirmación previa a aceptar o rechazar (US10).
export function confirmarRespuesta(dialog: MatDialog, item: SolicitudUnion, respuesta: RespuestaSolicitud, cuposDisponibles: number): Observable<boolean> {
  if (respuesta === 'rechazada') {
    return confirmarAccion(dialog, {
      titulo: `¿Rechazar a ${item.nombre}?`,
      mensaje: 'Se le notificará la decisión. Los cupos disponibles no cambiarán.',
      confirmar: 'Rechazar', tono: 'peligro', icono: 'person_remove',
    });
  }
  const restantes = cuposDisponibles - 1;
  const cupos = restantes === 0 ? 'El grupo quedará completo.'
    : restantes === 1 ? 'Quedará 1 cupo disponible.' : `Quedarán ${restantes} cupos disponibles.`;
  return confirmarAccion(dialog, {
    titulo: `¿Aceptar a ${item.nombre}?`,
    mensaje: `Se unirá al grupo y se le enviará una notificación. ${cupos}`,
    confirmar: 'Aceptar', icono: 'person_add',
  });
}

@Component({
  selector: 'app-tarjeta-solicitud',
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './tarjeta-solicitud.html',
  styleUrls: ['../../grupos.css', './tarjeta-solicitud.css'],
})
export class TarjetaSolicitud {
  private readonly store = inject(GruposStore);
  readonly solicitud = input.required<SolicitudUnion>();
  readonly grupoLleno = input(false);
  // Nombre del grupo: se muestra cuando la lista mezcla varios grupos.
  readonly grupo = input('');
  readonly responder = output<RespuestaSolicitud>();

  readonly iniciales = computed(() => iniciales(this.solicitud().nombre));
  readonly detalle = computed(() => {
    const item = this.solicitud();
    return [item.carrera, item.ciclo, haceTiempo(item.fechaRespuesta ?? item.fechaSolicitud, this.store.ahora())].filter(Boolean).join(' · ');
  });
  readonly nombreCorto = computed(() => this.solicitud().nombre.split(/\s+/)[0]);
}
