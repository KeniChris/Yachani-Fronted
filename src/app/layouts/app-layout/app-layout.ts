import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { map } from 'rxjs';

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

  readonly isMobile = toSignal(
    this.breakpointObserver
      .observe('(max-width: 768px)')
      .pipe(map(result => result.matches)),
    { initialValue: false }
  );

  // Pendiente: recibir estos datos desde autenticación.
  role: 'estudiante' | 'tutor' = 'estudiante';
  userName = '';
}