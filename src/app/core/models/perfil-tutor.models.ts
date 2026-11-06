export interface TutorPerfilRequest {
  universidad?: string | null;
  carrera?: string | null;
  presentacion: string;
  metodoEnsenanza: string;
}

export interface TutorPerfilResponse {
  idUsuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
  universidad: string | null;
  carrera: string | null;
  presentacion: string | null;
  metodoEnsenanza: string | null;
  configuracionCompletada: boolean;
}