import { computed, inject, Injectable, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  combineLatest,
  distinctUntilChanged,
  map,
  switchMap,
  of,
  catchError,
  forkJoin,
  Subject,
  startWith,
} from 'rxjs';
import { GrupoRecursos, IntegranteGrupo } from '../models/recursos.models';
import { AuthService } from './auth.service';
import { RecursosApiService } from './recursos-api.service';
import { errorApi, idPositivo } from './recursos-ui';
@Injectable()
export class ContextoGrupoService {
  private readonly api = inject(RecursosApiService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly refrescar = new Subject<void>();
  readonly idGrupo = signal<number | null>(null);
  readonly grupo = signal<GrupoRecursos | null>(null);
  readonly integrantes = signal<IntegranteGrupo[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly usuario = this.auth.usuario;
  readonly administrador = computed(
    () => this.usuario() != null && this.grupo()?.idCreador === this.usuario()?.idUsuario,
  );
  readonly miembro = computed(
    () =>
      this.administrador() ||
      this.integrantes().some((i) => i.idUsuario === this.usuario()?.idUsuario),
  );
  readonly puedeGestionarTemas = computed(
    () => this.administrador() || (this.miembro() && this.grupo()?.tipoGrupo === 'ESTUDIANTES'),
  );
  readonly puedePublicar = computed(
    () =>
      this.administrador() ||
      (this.miembro() &&
        (this.grupo()?.tipoGrupo === 'ESTUDIANTES' ||
          this.grupo()?.permitirPublicaciones === true)),
  );
  constructor() {
    const ids = combineLatest(this.route.pathFromRoot.map((r) => r.paramMap)).pipe(
      map((params) =>
        idPositivo(
          params
            .map((p) => p.get('grupoId'))
            .reverse()
            .find((id) => id !== null),
        ),
      ),
      distinctUntilChanged(),
    );
    combineLatest([ids, this.refrescar.pipe(startWith(undefined))])
      .pipe(
        switchMap(([id]) => {
          this.idGrupo.set(id);
          this.grupo.set(null);
          this.integrantes.set([]);
          this.error.set('');
          this.cargando.set(!!id);
          return id
            ? forkJoin({ grupo: this.api.grupo(id), integrantes: this.api.integrantes(id) }).pipe(
                catchError((e) => {
                  this.error.set(errorApi(e));
                  return of(null);
                }),
              )
            : of(null);
        }),
        takeUntilDestroyed(),
      )
      .subscribe((datos) => {
        if (datos) {
          this.grupo.set(datos.grupo);
          this.integrantes.set(datos.integrantes);
        }
        this.cargando.set(false);
      });
  }
  recargar(): void {
    this.refrescar.next();
  }
}
