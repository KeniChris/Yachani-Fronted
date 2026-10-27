import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
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
    let ruta = this.router.routerState.snapshot.root;
    while (ruta.firstChild) ruta = ruta.firstChild;
    return ruta.data['rolVista'] === 'tutor' ? 'tutor' : 'estudiante';
  }
}
