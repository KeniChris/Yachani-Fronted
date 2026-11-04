// Coincide con com.yachaniapi.sesion.dto.SesionResponse.
export interface SesionEstudioResponse {
  idSesion: number;
  idGrupo: number;
  nombreGrupo: string;
  tema: string;
  descripcion: string;
  fechaHoraInicio: string;
  duracionMinutos: number;
  lugar: string;
  estado: string;
  mensaje: string;
}

// Coincide con com.yachaniapi.sesion.dto.SesionRequest.
export interface SesionEstudioRequest {
  tema: string;
  descripcion: string;
  // Hora local ISO sin "Z", p. ej. "2026-11-15T19:00:00".
  fechaHoraInicio: string;
  duracionMinutos: number;
  lugar: string;
}
