export type TipoGrupo = 'TUTOR' | 'ESTUDIANTES';

// Coincide con com.yachaniapi.grupoestudio.dto.GrupoEstudioDTO.Response.
export interface GrupoEstudioResponse {
  idGrupo: number;
  nombre: string;
  descripcion: string;
  metodoEstudio: string;
  capacidadMaxima: number;
  integrantesActuales: number;
  estado: string;
  tipoGrupo: TipoGrupo;
  idCreador: number;
  mensaje: string | null;
  permitirPublicaciones?: boolean;
}

// El backend espera idCreador (no idTutor): un estudiante también puede crear grupos,
// y el tipoGrupo se deduce del tipo de usuario que lo crea.
export interface CrearGrupoRequest {
  nombre: string;
  descripcion: string;
  metodoEstudio: string;
  capacidadMaxima: number;
  idCreador: number;
}

export interface FiltrarGruposParams {
  curso?: string;
  metodoEstudio?: string;
  cantidadIntegrantes?: number;
  tipoGrupo?: TipoGrupo;
}

// La API no marca quién es el tutor: hay que comparar con el idCreador del grupo.
export interface IntegranteResponse {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
}

export interface SolicitudResponse {
  idSolicitud: number;
  idGrupo: number;
  estado: string;
  mensaje: string;
}

// Solicitud vista desde el estudiante que la envió ("Mis solicitudes").
export interface MiSolicitudResponse {
  idSolicitud: number;
  idGrupo: number;
  nombreGrupo: string;
  estado: string;
  fechaSolicitud: string;
}

export interface SolicitudPendienteResponse {
  idSolicitud: number;
  idGrupo: number;
  idEstudiante: number;
  nombreEstudiante: string;
  estado: string;
  fechaSolicitud: string;
}
