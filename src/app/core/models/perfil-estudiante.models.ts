export interface PerfilAcademicoRequest {
  universidad: string;
  carrera: string;
}

export interface PreferenciasEstudioRequest {
  modalidadPreferida: string;
  metodoPreferido: string;
  temasInteres: string[];
}

export interface ConocimientoAcademicoRequest {
  curso: string;
  nivel: string;
}

export interface ConocimientoAcademicoResponse {
  idConocimiento: number;
  curso: string;
  nivel: string;
}

export interface PerfilAcademicoResponse {
  idUsuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
  universidad: string | null;
  carrera: string | null;
  modalidadPreferida: string | null;
  metodoPreferido: string | null;
  temasInteres: string[];
  conocimientos: ConocimientoAcademicoResponse[];
}