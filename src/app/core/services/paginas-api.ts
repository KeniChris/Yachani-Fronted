import { EMPTY, Observable, expand, reduce } from 'rxjs';
import { PaginaGrupos } from '../models/recursos.models';
// Mantiene los arrays de las pantallas existentes y recorre todas las páginas.
export function todasLasPaginas<T>(cargar: (pagina: number) => Observable<PaginaGrupos<T>>) {
  return cargar(0).pipe(
    expand((p) => (p.last || p.page + 1 >= p.totalPages ? EMPTY : cargar(p.page + 1))),
    reduce((items, p) => [...items, ...p.content], [] as T[]),
  );
}
