// Coincide con com.yachaniapi.aviso.dto.AvisoResponse.
export interface AvisoResponse {
  idAviso: number;
  idGrupo: number;
  titulo: string;
  mensaje: string;
  nombreAutor: string;
  fechaPublicacion: string;
}

// Coincide con com.yachaniapi.aviso.dto.AvisoRequest.
export interface AvisoRequest {
  idAutor: number;
  titulo: string;
  mensaje: string;
}
