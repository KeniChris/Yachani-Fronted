import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  NotificacionResponse,
  NotificacionSesionResponse,
} from '../models/notificacion.models';
import { PaginaGrupos, TAMANO_PAGINA_MAXIMO } from '../models/pagina.models';

// El backend tiene dos fuentes: la bandeja general paginada (/notificaciones) y la ruta
// antigua de sesiones (/estudiantes/{id}/notificaciones), que es la única con los datos
// del encuentro. No se envía idUsuario: el token identifica a quien consulta, y mandar
// el de otra persona responde 403.
@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  listar() {
    return this.http
      .get<PaginaGrupos<NotificacionResponse>>(`${this.apiUrl}/notificaciones`, {
        params: { size: TAMANO_PAGINA_MAXIMO, sort: 'fechaCreacion,desc' },
      })
      .pipe(map((pagina) => pagina.content));
  }

  contarNoLeidas() {
    return this.http
      .get<{ cantidad: number }>(`${this.apiUrl}/notificaciones/no-leidas/conteo`)
      .pipe(map((r) => r.cantidad));
  }

  marcarComoLeida(idNotificacion: number) {
    return this.http.patch<NotificacionResponse>(
      `${this.apiUrl}/notificaciones/${idNotificacion}/leida`,
      {},
    );
  }

  marcarTodasComoLeidas() {
    return this.http
      .patch<{ actualizadas: number }>(`${this.apiUrl}/notificaciones/leidas`, {})
      .pipe(map((r) => r.actualizadas));
  }

  listarDeSesiones(idEstudiante: number) {
    return this.http.get<NotificacionSesionResponse[]>(
      `${this.apiUrl}/estudiantes/${idEstudiante}/notificaciones`,
    );
  }
}
