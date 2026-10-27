export type EstadoSeccion = 'cargando' | 'error' | 'vacio' | 'listo';
export interface Seccion<T> { estado: EstadoSeccion; datos: T; }
export interface SesionInicio { titulo: string; grupo: string; horario: string; duracionMinutos: number | null; modalidad: string; }
export interface GrupoInicio { id: string; titulo: string; tema: string; icono: string; miembros: string[]; integrantes: number | null; sinLeer: number | null; }
export interface RecomendacionInicio { id: string; titulo: string; descripcion: string; compatibilidad: number | null; etiquetas: string[]; }
export interface AvisoInicio { id: string; texto: string; fecha: string; }
export interface FlashcardsInicio { id: string; titulo: string; completadas: number | null; total: number | null; }
export interface DatosInicioEstudiante {
  sesion: Seccion<SesionInicio | null>;
  grupos: Seccion<GrupoInicio[]>;
  recomendaciones: Seccion<RecomendacionInicio[]>;
  avisos: Seccion<AvisoInicio[]>;
  flashcards: Seccion<FlashcardsInicio[]>;
}
