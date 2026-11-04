import {
  Component,
  DestroyRef,
  Input,
  TemplateRef,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subscription, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { MazoCompartidoResponse } from '../../../core/models/flashcards.models';
import { GrupoRecursos } from '../../../core/models/recursos.models';
import { FlashcardsApiService } from '../../../core/services/flashcards-api.service';
import { RecursosApiService } from '../../../core/services/recursos-api.service';
import { errorApi, idPositivo } from '../../../core/services/recursos-ui';
import { CompartirMazo } from './compartir-mazo';
type Publicacion = MazoCompartidoResponse & { nombreGrupo: string; miembro: boolean };
@Component({
  selector: 'app-publicaciones-mazo',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatDialogModule],
  templateUrl: './publicaciones-mazo.html',
  styleUrls: ['../flashcards.css', './publicaciones-mazo.css'],
})
export class PublicacionesMazo {
  readonly id = signal<number | null>(null);
  @Input() set mazoId(v: string) {
    this.id.set(idPositivo(v));
  }
  readonly titulo = signal('');
  readonly publicaciones = signal<Publicacion[]>([]);
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly errorDialogo = signal('');
  readonly guardando = signal(false);
  readonly exito = signal('');
  private readonly api = inject(FlashcardsApiService);
  private readonly recursos = inject(RecursosApiService);
  private readonly dialog = inject(MatDialog);
  private readonly destroy = inject(DestroyRef);
  private carga?: Subscription;
  constructor() {
    effect(() => {
      const id = this.id();
      untracked(() => this.cargar(id));
    });
  }
  cargar(id = this.id()): void {
    this.carga?.unsubscribe();
    this.error.set('');
    this.publicaciones.set([]);
    if (!id) {
      this.error.set('El identificador del mazo no es válido.');
      return;
    }
    this.cargando.set(true);
    this.carga = forkJoin({
      detalle: this.api.detalle(id),
      publicaciones: this.api.publicaciones(id),
      grupos: this.recursos.grupos(),
    })
      .pipe(
        switchMap((r) => {
          this.titulo.set(r.detalle.mazo.titulo);
          const filas = r.publicaciones.map((p) => {
            const grupo = r.grupos.find((g) => g.idGrupo === p.idGrupo);
            const nombre = grupo
              ? of(grupo.nombre)
              : this.recursos.grupo(p.idGrupo).pipe(
                  map((g) => g.nombre),
                  catchError(() => of(`Grupo ${p.idGrupo}`)),
                );
            return nombre.pipe(map((nombreGrupo) => ({ ...p, nombreGrupo, miembro: !!grupo })));
          });
          return filas.length ? forkJoin(filas) : of([] as Publicacion[]);
        }),
        takeUntilDestroyed(this.destroy),
      )
      .subscribe({
        next: (r) => {
          this.publicaciones.set(r);
          this.cargando.set(false);
        },
        error: (e) => {
          this.error.set(errorApi(e));
          this.cargando.set(false);
        },
      });
  }
  compartir(): void {
    if (!this.id()) return;
    this.dialog
      .open(CompartirMazo, {
        width: '600px',
        maxWidth: 'calc(100vw - 32px)',
        data: { idMazo: this.id() },
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe((r) => {
        if (r) this.cargar();
      });
  }
  abrir(template: TemplateRef<unknown>, p: Publicacion): void {
    this.errorDialogo.set('');
    this.dialog.open(template, { width: '600px', maxWidth: 'calc(100vw - 32px)', data: p });
  }
  retirar(p: Publicacion, ref: MatDialogRef<unknown>): void {
    const id = this.id();
    if (!id || !p.miembro || this.guardando()) return;
    this.guardando.set(true);
    ref.disableClose = true;
    this.errorDialogo.set('');
    this.api
      .retirarDeGrupo(p.idGrupo, id)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: () => {
          this.guardando.set(false);
          ref.close();
          this.exito.set('Mazo retirado de este grupo.');
          this.cargar();
        },
        error: (e) => {
          this.guardando.set(false);
          ref.disableClose = false;
          this.errorDialogo.set(errorApi(e));
        },
      });
  }
}
