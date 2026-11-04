// Coincide con com.yachaniapi.notificacion.dto.NotificacionResponse.
// tipo: SOLICITUD_RECIBIDA | SOLICITUD_ACEPTADA | SOLICITUD_RECHAZADA.
export interface NotificacionSolicitudResponse {
  idNotificacion: number;
  idSolicitud: number | null;
  idGrupo: number | null;
  nombreGrupo: string | null;
  tipo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
}

// Coincide con com.yachaniapi.sesion.dto.NotificacionResponse: recordatorios y cambios
// de sesión, que viven en otro endpoint y no se marcan como leídos.
// tipo: RECORDATORIO | CAMBIO.
export interface NotificacionSesionResponse {
  idNotificacion: number;
  idSesion: number;
  tipo: string;
  titulo: string;
  grupo: string;
  tema: string;
  fecha: string;
  hora: string;
  lugar: string;
  fechaCreacion: string;
}

// Vista unificada de las dos fuentes que muestra la pantalla de notificaciones.
export interface NotificacionVista {
  clave: string;
  idNotificacion: number;
  titulo: string;
  texto: string;
  fecha: string;
  accion: string;
  enlace: unknown[];
  leida: boolean;
  // Solo las de solicitudes se pueden marcar como leídas.
  marcable: boolean;
  sesion: NotificacionSesionResponse | null;
}
