import { Observable, catchError, from, map, mergeMap, of, reduce } from 'rxjs';
import { ProgresoResponse } from '../models/flashcards.models';
// Un fallo individual no oculta los mazos ni se interpreta como progreso cero.
export function progresosDe(ids: number[], cargar: (id: number) => Observable<ProgresoResponse>) {
  return from([...new Set(ids)]).pipe(
    mergeMap(
      (id) =>
        cargar(id).pipe(
          map((progreso) => ({ id, progreso })),
          catchError(() => of({ id, progreso: null })),
        ),
      4,
    ),
    reduce(
      (resultado, item) => ({ ...resultado, [item.id]: item.progreso }),
      {} as Record<number, ProgresoResponse | null>,
    ),
  );
}
