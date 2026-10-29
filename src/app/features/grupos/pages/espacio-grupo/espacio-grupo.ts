import { Component, DestroyRef, afterNextRender, computed, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { AppLayout } from '../../../../layouts/app-layout/app-layout';
import { ContextoGrupo } from '../../contexto-grupo';
import { etiquetaDia, formatearHora } from '../../grupos.formato';

// incluye: otra ruta hija que también marca la pestaña como activa.
interface PestanaGrupo { ruta: string; etiqueta: string; icono: string; incluye?: string; }

@Component({
  selector: 'app-espacio-grupo',
  imports: [RouterOutlet, RouterLink, MatIconModule],
  providers: [ContextoGrupo],
  templateUrl: './espacio-grupo.html',
  styleUrls: ['../../grupos.css', './espacio-grupo.css'],
})
export class EspacioGrupo {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly url = toSignal(
    this.router.events.pipe(filter(evento => evento instanceof NavigationEnd), map(() => this.router.url)),
    { initialValue: this.router.url });
  readonly ctx = inject(ContextoGrupo);
  readonly store = this.ctx.store;

  // Una pestaña se habilita al registrar su ruta hija en grupos.routes.ts.
  private readonly pestanas: PestanaGrupo[] = [
    { ruta: 'chat', etiqueta: 'Chat', icono: 'chat' },
    { ruta: 'temas', etiqueta: 'Temas y materiales', icono: 'menu_book', incluye: 'materiales' },
    { ruta: 'sesiones', etiqueta: 'Sesiones', icono: 'calendar_month' },
    { ruta: 'avisos', etiqueta: 'Avisos', icono: 'campaign' },
    { ruta: 'flashcards', etiqueta: 'Flashcards', icono: 'style' },
    { ruta: 'integrantes', etiqueta: 'Integrantes', icono: 'group' },
    { ruta: 'solicitudes', etiqueta: 'Solicitudes', icono: 'inbox' },
  ];
  private readonly rutasHijas = new Set((this.route.routeConfig?.children ?? []).map(hija => hija.path));
  // Solicitudes solo existe en las rutas del tutor.
  readonly pestanasVisibles = this.pestanas
    .filter(pestana => pestana.ruta !== 'solicitudes' || this.rutasHijas.has(pestana.ruta))
    .map(pestana => ({ ...pestana, disponible: this.rutasHijas.has(pestana.ruta) }));

  readonly misGrupos = `/app/${this.ctx.rol}/grupos`;

  activa(pestana: PestanaGrupo): boolean {
    return [pestana.ruta, pestana.incluye].some(hija => {
      if (!hija) return false;
      const ruta = this.router.createUrlTree([hija], { relativeTo: this.route }).toString();
      return this.url() === ruta || this.url().startsWith(ruta + '/');
    });
  }

  readonly proxima = computed(() => {
    const sesion = this.ctx.proximaSesion();
    return sesion ? `${etiquetaDia(sesion.inicio, this.store.ahora())}, ${formatearHora(sesion.inicio)}` : '';
  });

  constructor() {
    const layout = inject(AppLayout, { optional: true });
    if (this.store.modoPrevisualizacion && layout) {
      afterNextRender(() => layout.nombrePrevisualizacion.set(this.store.nombreUsuario(this.ctx.rol)));
      inject(DestroyRef).onDestroy(() => layout.nombrePrevisualizacion.set(''));
    }
  }
}
