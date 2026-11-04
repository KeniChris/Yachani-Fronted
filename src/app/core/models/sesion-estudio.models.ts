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
  idTutor: number;
  tema: string;
  descripcion: string;
  fechaHoraInicio: string;
  duracionMinutos: number;
  lugar: string;
}
