// Página que devuelve el backend en grupos, solicitudes y notificaciones.
export interface PaginaGrupos<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

// Tamaño máximo de página permitido por el backend: se pide para traer todos los elementos.
export const TAMANO_PAGINA_MAXIMO = 100;
