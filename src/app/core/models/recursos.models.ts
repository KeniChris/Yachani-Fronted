import { GrupoEstudioResponse } from './grupo-estudio.models';
export interface PaginaGrupos<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
export interface GrupoRecursos extends GrupoEstudioResponse {
  nombreCreador: string;
  tipoCreador: 'TUTOR' | 'ESTUDIANTE';
  cuposDisponibles: number;
  permitirPublicaciones: boolean;
}
export interface IntegranteGrupo {
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  tipoUsuario: 'TUTOR' | 'ESTUDIANTE';
  administrador: boolean;
}
export interface TemaResponse {
  idTema: number;
  idGrupo: number;
  nombre: string;
  descripcion: string | null;
  idCreador: number;
  fechaCreacion: string;
}
export interface TemaRequest {
  nombre: string;
  descripcion: string;
}
export interface MaterialResponse {
  idMaterial: number;
  idGrupo: number;
  idTema: number | null;
  nombreTema: string | null;
  idAutor: number;
  autor: string;
  nombreArchivo: string;
  tipoArchivo: string;
  tamanoArchivo: number;
  fechaPublicacion: string;
}
export interface PaginaMateriales<T> {
  contenido: T[];
  pagina: number;
  tamano: number;
  totalElementos: number;
  totalPaginas: number;
}
export interface EnvioResponse {
  mensaje: string;
  materiales: MaterialResponse[];
}
export interface DescargaResponse {
  url: string;
  venceEn: string;
}
