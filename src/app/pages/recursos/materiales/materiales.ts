import {
  Component,
  DestroyRef,
  TemplateRef,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Observable, Subscription, catchError, forkJoin, of } from 'rxjs';
import { ContextoGrupoService } from '../../../core/services/contexto-grupo.service';
import { RecursosApiService } from '../../../core/services/recursos-api.service';
import { FlashcardsApiService } from '../../../core/services/flashcards-api.service';
import {
  errorApi,
  iconoArchivo,
  idPositivo,
  tamanoArchivo,
  validarArchivos,
} from '../../../core/services/recursos-ui';
import { MaterialResponse, TemaResponse } from '../../../core/models/recursos.models';
import { MazoCompartidoResponse } from '../../../core/models/flashcards.models';
import { SeleccionarGrupo } from '../seleccionar-grupo';
function paginador(): MatPaginatorIntl {
  const p = new MatPaginatorIntl();
  p.itemsPerPageLabel = 'Archivos por página';
  p.nextPageLabel = 'Página siguiente';
  p.previousPageLabel = 'Página anterior';
  p.getRangeLabel = (page, size, total) =>
    total ? `${page * size + 1}–${Math.min((page + 1) * size, total)} de ${total}` : '0 de 0';
  return p;
}
@Component({
  selector: 'app-materiales',
  standalone: true,
  providers: [ContextoGrupoService, { provide: MatPaginatorIntl, useFactory: paginador }],
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    SeleccionarGrupo,
  ],
  templateUrl: './materiales.html',
  styleUrl: './materiales.css',
})
export class Materiales {
  readonly contexto = inject(ContextoGrupoService);
  private readonly api = inject(RecursosApiService);
  private readonly flash = inject(FlashcardsApiService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  private carga?: Subscription;
  private readonly query = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  readonly idTema = computed(() => idPositivo(this.query().get('idTema')));
  readonly temas = signal<TemaResponse[]>([]);
  readonly materiales = signal<MaterialResponse[]>([]);
  readonly mazos = signal<MazoCompartidoResponse[]>([]);
  readonly nombreTema = computed(
    () => this.temas().find((t) => t.idTema === this.idTema())?.nombre ?? 'Materiales del grupo',
  );
  readonly errorMazos = signal('');
  readonly cargando = signal(false);
  readonly error = signal('');
  readonly exito = signal('');
  readonly errorDialogo = signal('');
  readonly guardando = signal(false);
  readonly pagina = signal(0);
  readonly tamano = signal(10);
  readonly total = signal(0);
  readonly archivos = signal<File[]>([]);
  readonly errorArchivos = computed(() => validarArchivos(this.archivos()));
  readonly temaSubida = new FormControl<number | null>(null);
  readonly temaCambio = new FormControl<number | null>(null);
  readonly bytes = tamanoArchivo;
  readonly icono = iconoArchivo;
  constructor() {
    effect(() => {
      const id = this.contexto.idGrupo();
      const tema = this.idTema();
      untracked(() => {
        this.pagina.set(0);
        this.cargar(id, tema);
      });
    });
  }
  cargar(id = this.contexto.idGrupo(), tema = this.idTema()): void {
    this.carga?.unsubscribe();
    if (!id) return;
    this.cargando.set(true);
    this.error.set('');
    this.errorMazos.set('');
    this.mazos.set([]);
    this.carga = forkJoin({
      temas: this.api.temas(id),
      materiales: this.api.materiales(id, this.pagina(), this.tamano(), tema),
      mazos: tema
        ? this.flash.delGrupo(id, tema).pipe(
            catchError((e) => {
              this.errorMazos.set(errorApi(e));
              return of([] as MazoCompartidoResponse[]);
            }),
          )
        : of([] as MazoCompartidoResponse[]),
    })
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (r) => {
          this.temas.set(r.temas);
          this.materiales.set(r.materiales.contenido);
          this.total.set(r.materiales.totalElementos);
          this.mazos.set(r.mazos);
          this.cargando.set(false);
        },
        error: (e) => {
          this.error.set(errorApi(e));
          this.cargando.set(false);
        },
      });
  }
  filtrar(idTema: number | null): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { idTema },
      queryParamsHandling: 'merge',
    });
  }
  cambiarPagina(e: PageEvent): void {
    this.pagina.set(e.pageIndex);
    this.tamano.set(e.pageSize);
    this.cargar();
  }
  propio(m: MaterialResponse): boolean {
    return this.contexto.miembro() && m.idAutor === this.contexto.usuario()?.idUsuario;
  }
  puedeEliminar(m: MaterialResponse): boolean {
    return this.propio(m) || (this.contexto.miembro() && this.contexto.administrador());
  }
  fecha(valor: string): string {
    const d = new Date(valor);
    return Number.isNaN(d.valueOf())
      ? valor
      : new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(d);
  }
  abrir(template: TemplateRef<unknown>, material?: MaterialResponse, subida = false): void {
    this.errorDialogo.set('');
    if (subida) {
      this.archivos.set([]);
      this.temaSubida.setValue(this.idTema());
    }
    if (material) this.temaCambio.setValue(material.idTema);
    this.dialog.open(template, { width: '600px', maxWidth: 'calc(100vw - 32px)', data: material });
  }
  elegir(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.archivos.update((a) => [...a, ...Array.from(input.files ?? [])]);
    input.value = '';
  }
  quitar(index: number): void {
    this.archivos.update((a) => a.filter((_, i) => i !== index));
  }
  private ejecutar<T>(
    operacion: Observable<T>,
    ref: MatDialogRef<unknown>,
    mensaje: string,
    despues?: () => void,
  ): void {
    if (this.guardando()) return;
    this.guardando.set(true);
    this.errorDialogo.set('');
    ref.disableClose = true;
    operacion.pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: () => {
        this.guardando.set(false);
        ref.close();
        despues?.();
        this.exito.set(mensaje);
        this.cargar();
      },
      error: (e) => {
        this.guardando.set(false);
        ref.disableClose = false;
        this.errorDialogo.set(errorApi(e));
      },
    });
  }
  subir(ref: MatDialogRef<unknown>): void {
    const id = this.contexto.idGrupo();
    if (!id || this.errorArchivos() || !this.contexto.puedePublicar()) return;
    this.ejecutar(
      this.api.subir(id, this.archivos(), this.temaSubida.value),
      ref,
      'Materiales publicados.',
    );
  }
  mover(m: MaterialResponse, ref: MatDialogRef<unknown>): void {
    const id = this.contexto.idGrupo();
    if (!id || !this.propio(m)) return;
    this.ejecutar(
      this.api.cambiarTema(id, m.idMaterial, this.temaCambio.value),
      ref,
      'Tema actualizado.',
    );
  }
  eliminar(m: MaterialResponse, ref: MatDialogRef<unknown>): void {
    const id = this.contexto.idGrupo();
    if (!id || !this.puedeEliminar(m)) return;
    this.ejecutar(this.api.eliminar(id, m.idMaterial), ref, 'Material eliminado.', () => {
      if (this.materiales().length === 1 && this.pagina() > 0) this.pagina.update((p) => p - 1);
    });
  }
  descargar(m: MaterialResponse): void {
    const id = this.contexto.idGrupo();
    if (!id) return;
    const ventana = window.open('about:blank', '_blank');
    if (ventana) ventana.opener = null;
    this.api
      .descarga(id, m.idMaterial)
      .pipe(takeUntilDestroyed(this.destroy))
      .subscribe({
        next: (r) => {
          try {
            const url = new URL(r.url);
            if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
            if (ventana) ventana.location.replace(url.href);
            else {
              const a = document.createElement('a');
              a.href = url.href;
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              a.click();
            }
          } catch {
            ventana?.close();
            this.error.set('El servidor devolvió un enlace de descarga inválido.');
          }
        },
        error: (e) => {
          ventana?.close();
          this.error.set(errorApi(e));
        },
      });
  }
}
