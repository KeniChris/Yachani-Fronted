export interface MazoRequest {
  titulo: string;
  descripcion: string;
}
export interface TarjetaRequest {
  pregunta: string;
  respuesta: string;
}
export interface MazoResponse {
  idMazo: number;
  idAutor: number;
  autor: string;
  titulo: string;
  descripcion: string | null;
  estado: 'BORRADOR' | 'PUBLICADO';
  cantidadTarjetas: number;
  fechaCreacion: string;
}
export interface TarjetaResponse extends TarjetaRequest {
  idTarjeta: number;
  orden: number;
}
export interface MazoDetalleResponse {
  mazo: MazoResponse;
  tarjetas: TarjetaResponse[];
}
export interface MazoCompartidoResponse {
  idCompartido: number;
  idGrupo: number;
  idTema: number;
  nombreTema: string;
  mazo: MazoResponse;
  fechaCompartido: string;
}
export interface OperacionFlashcards<T> {
  mensaje: string;
  datos: T;
}
export interface EstadoTarjetaResponse {
  idTarjeta: number;
  vista: boolean;
  aprendida: boolean;
  fechaUltimaPractica: string | null;
}
export interface ProgresoResponse {
  idMazo: number;
  totalTarjetas: number;
  tarjetasVistas: number;
  tarjetasAprendidas: number;
  porcentajeRevisado: number;
  completado: boolean;
  idSiguienteTarjeta: number | null;
  tarjetas: EstadoTarjetaResponse[];
}
