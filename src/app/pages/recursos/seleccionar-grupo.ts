import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { GrupoRecursos } from '../../core/models/recursos.models';
import { RecursosApiService } from '../../core/services/recursos-api.service';
import { errorApi } from '../../core/services/recursos-ui';
@Component({
  selector: 'app-seleccionar-grupo',
  standalone: true,
  imports: [RouterLink, MatButtonModule],
  template: `<h1>Temas y materiales</h1>
    <p>Elige uno de tus grupos para consultar y organizar sus recursos.</p>
    @if (cargando()) {
      <p role="status">Cargando tus grupos…</p>
    }
    @if (error()) {
      <p role="alert">{{ error() }}</p>
    }
    <div class="grupos">
      @for (g of grupos(); track g.idGrupo) {
        <a mat-stroked-button [routerLink]="['/grupos', g.idGrupo, 'recursos', 'temas']">{{
          g.nombre
        }}</a>
      }
    </div>
    @if (!cargando() && !error() && !grupos().length) {
      <p>Todavía no perteneces a un grupo.</p>
      <a mat-flat-button routerLink="/grupos/descubrimiento">Explorar grupos</a>
    }`,
  styles: `
    :host {
      display: block;
    }
    p {
      color: var(--color-muted);
    }
    .grupos {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-4);
    }
  `,
})
export class SeleccionarGrupo {
  readonly grupos = signal<GrupoRecursos[]>([]);
  readonly cargando = signal(true);
  readonly error = signal('');
  constructor() {
    inject(RecursosApiService)
      .grupos()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (g) => {
          this.grupos.set(g);
          this.cargando.set(false);
        },
        error: (e) => {
          this.error.set(errorApi(e));
          this.cargando.set(false);
        },
      });
  }
}
