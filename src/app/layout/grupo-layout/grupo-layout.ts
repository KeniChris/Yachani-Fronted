import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { ContextoGrupoService } from '../../core/services/contexto-grupo.service';
@Component({
  selector: 'app-grupo-layout',
  standalone: true,
  providers: [ContextoGrupoService],
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatButtonModule, MatMenuModule],
  templateUrl: './grupo-layout.html',
  styleUrl: './grupo-layout.css',
})
export class GrupoLayout {
  readonly contexto = inject(ContextoGrupoService);
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );
  private readonly secciones = [
    { label: 'Chat', path: 'chat' },
    { label: 'Temas y materiales', path: 'recursos' },
    { label: 'Sesiones', path: 'sesiones' },
    { label: 'Avisos', path: 'avisos' },
    { label: 'Flashcards', path: 'flashcards' },
    { label: 'Integrantes', path: 'integrantes' },
  ];
  // Solicitudes ya no es una sección del grupo: tiene su propia pantalla en
  // /grupos/solicitudes, con las de todos los grupos que administro.
  readonly tabs = computed(() => this.secciones);
  readonly seleccion = computed(
    () =>
      this.tabs().find((t) => this.url().split('?')[0].split('/')[3] === t.path) ?? {
        label: 'Configuración del grupo',
        path: 'configuracion',
      },
  );
  readonly detalle = computed(() => {
    const g = this.contexto.grupo();
    return g
      ? `${g.metodoEstudio} · ${g.tipoGrupo === 'TUTOR' ? 'Tutor:' : 'Creado por:'} ${g.nombreCreador}`
      : '';
  });
}
