// Bandeja general: coincide con com.yachaniapi.notificacion.dto.NotificacionResponse.
// tipo: SOLICITUD_RECIBIDA | SOLICITUD_ACEPTADA | SOLICITUD_RECHAZADA y los de sesión.
// idSolicitud puede ser null cuando la solicitud se aceptó o se reemplazó en un reintento;
// idSesion es null en las de solicitudes. 'ruta' ya viene lista como ruta de Angular
// (sin /api): se usa para el enlace, nunca como endpoint HTTP.
export interface NotificacionResponse {
  idNotificacion: number;
  idSolicitud: number | null;
  idGrupo: number | null;
  nombreGrupo: string | null;
  tipo: string;
  mensaje: string;
  leida: boolean;
  fechaCreacion: string;
  idSesion: number | null;
  titulo: string;
  ruta: string;
}

// Coincide con com.yachaniapi.sesion.dto.NotificacionResponse: la ruta antigua de
// sesiones, que es la única que trae fecha, hora, tema y lugar del encuentro.
// tipo: RECORDATORIO | CAMBIO. No se marcan como leídas.
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
  // Ruta de Angular a la que lleva la acción.
  enlace: string;
  leida: boolean;
  // Solo las de la bandeja general se pueden marcar como leídas.
  marcable: boolean;
  sesion: NotificacionSesionResponse | null;
}
