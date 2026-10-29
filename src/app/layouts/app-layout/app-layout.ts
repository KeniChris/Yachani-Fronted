import { Component, inject, signal } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { filter, map } from 'rxjs';

import { Sidebar } from './components/sidebar/sidebar';
import { Topbar } from './components/topbar/topbar';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MatSidenavModule,
    Sidebar,
    Topbar
  ],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css'
})
export class AppLayout {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly router = inject(Router);
  private readonly rolSesion = signal<'estudiante' | 'tutor' | null>(null);
  // Las rutas sin rolVista (p. ej. /app/flashcards) conservan la vista del último rol.
  private ultimoRolVista: 'estudiante' | 'tutor' = 'estudiante';
  private readonly rolVista = toSignal(
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.leerRolVista()),
    ),
    { initialValue: this.leerRolVista() },
  );

  readonly isMobile = toSignal(
    this.breakpointObserver
      .observe('(max-width: 768px)')
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

  // Al integrar autenticación, asignar role desde la sesión: tiene prioridad.
  // Sin sesión, el rol de ruta solo configura la interfaz, no concede permisos.
  get role(): 'estudiante' | 'tutor' { return this.rolSesion() ?? this.rolVista(); }
  set role(value: 'estudiante' | 'tutor' | null) { this.rolSesion.set(value); }
  userName = '';
  // Nombre solo visual, separado del usuario autenticado y limpiado al salir.
  readonly nombrePrevisualizacion = signal('');

  private leerRolVista(): 'estudiante' | 'tutor' {
    // Gana el rolVista más profundo; las pantallas de otros módulos dentro de un grupo lo heredan del grupo.
    let ruta: ActivatedRouteSnapshot | null = this.router.routerState.snapshot.root;
    let rolRuta: 'estudiante' | 'tutor' | null = null;
    for (; ruta; ruta = ruta.firstChild) {
      const rol = ruta.data['rolVista'];
      if (rol === 'tutor' || rol === 'estudiante') rolRuta = rol;
    }
    if (rolRuta) this.ultimoRolVista = rolRuta;
    return this.ultimoRolVista;
  }
}
