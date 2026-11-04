import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  NotificacionSesionResponse,
  NotificacionSolicitudResponse,
} from '../models/notificacion.models';

// El backend tiene dos fuentes de notificaciones: las de solicitudes de grupo
// (/notificaciones) y las de sesiones (/estudiantes/{id}/notificaciones).
@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  listarDeSolicitudes(idUsuario: number) {
    return this.http.get<NotificacionSolicitudResponse[]>(`${this.apiUrl}/notificaciones`, {
      params: { idUsuario },
    });
  }

  marcarComoLeida(idNotificacion: number, idUsuario: number) {
    return this.http.patch<NotificacionSolicitudResponse>(
      `${this.apiUrl}/notificaciones/${idNotificacion}/leida`,
      {},
      { params: { idUsuario } },
    );
  }

  listarDeSesiones(idEstudiante: number) {
    return this.http.get<NotificacionSesionResponse[]>(
      `${this.apiUrl}/estudiantes/${idEstudiante}/notificaciones`,
    );
  }
}
