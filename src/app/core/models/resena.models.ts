export interface PerfilTutorPublicoResponse {
  idTutor: number;
  nombres: string;
  apellidos: string;
  correo: string;
  promedioCalificacion: number | null;
  totalResenas: number;
  mensaje: string;
  presentacion: string | null;
  metodoEnsenanza: string | null;
  universidad: string | null;
  carrera: string | null;
}

export interface ResenaResponse {
  idResena: number;
  nombreEstudiante: string;
  calificacion: number;
  comentario: string;
  fechaPublicacion: string;
}

export interface ResenaRequest {
  calificacion: number;
  comentario: string;
}
