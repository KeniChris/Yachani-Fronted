export interface TutorPerfilRequest {
  presentacion: string;
  metodoEnsenanza: string;
}

export interface TutorPerfilResponse {
  idUsuario: number;
  nombres: string;
  apellidos: string;
  correo: string;
  presentacion: string | null;
  metodoEnsenanza: string | null;
}