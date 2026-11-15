export interface AvisoResponse {
  idAviso: number;
  idGrupo: number;
  idAutor: number;
  nombreAutor: string;
  titulo: string;
  mensaje: string;
  fechaPublicacion: string;
}

export interface AvisoRequest {
  titulo: string;
  mensaje: string;
}