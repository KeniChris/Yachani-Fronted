import { NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, inject, Input, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificacionService } from '../../core/services/notificacion.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { Brand } from '../brand/brand';

@Component({
  selector: 'app-app-layout',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatMenuModule,
    Brand,
  ],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificaciones = inject(NotificacionService);
  // Se guarda el DestroyRef porque ngOnInit ya no es contexto de inyección.
  private readonly destroyRef = inject(DestroyRef);
  // Punto de aviso en la campanita cuando hay notificaciones sin leer.
  // App zoneless: el conteo llega por HTTP, así que tiene que ser signal().
  readonly sinLeer = signal(0);

  ngOnInit(): void {
    this.contarSinLeer();
    // Se vuelve a consultar al cambiar de pantalla, para que el punto desaparezca
    // en cuanto se marcan como leídas y se sale de notificaciones.
    this.router.events
      .pipe(
        filter((evento) => evento instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.contarSinLeer());
  }

  private contarSinLeer(): void {
    if (!this.authService.obtenerToken()) {
      this.sinLeer.set(0);
      return;
    }
    this.notificaciones.contarNoLeidas().subscribe({
      next: (cantidad) => this.sinLeer.set(cantidad),
      // Sin sesión válida o sin conexión, simplemente no se muestra el punto.
      error: () => this.sinLeer.set(0),
    });
  }

cerrarSesion(): void {
  this.authService.cerrarSesion();

  void this.router.navigateByUrl('/auth/iniciar-sesion', {
    replaceUrl: true,
  });
}

get rol(): 'estudiante' | 'tutor' {
  return this.authService.usuario()?.tipoUsuario === 'TUTOR'
    ? 'tutor'
    : 'estudiante';
}

get usuario(): {
  nombre: string;
  iniciales: string;
  rol: string;
} | null {
  const datos = this.authService.usuario();

  if (!datos) {
    return null;
  }

  const nombres = datos.nombres.trim();
  const apellidos = datos.apellidos.trim();

  const inicialNombre = Array.from(nombres)[0] ?? '';
  const inicialApellido = Array.from(apellidos)[0] ?? '';

  return {
    nombre: `${nombres} ${apellidos}`.trim(),
    iniciales: `${inicialNombre}${inicialApellido}`.toLocaleUpperCase(),
    rol: datos.tipoUsuario === 'TUTOR' ? 'Tutor' : 'Estudiante',
  };
}
  // Texto de cabecera para contextos de grupo; por defecto se muestra la ruta activa.
  @Input() ruta = '';
  readonly navigation = {
    estudiante: [
      { label: 'Inicio', short: 'Inicio', path: '/inicio', icon: 'home' },
      {
        label: 'Explorar grupos',
        short: 'Explorar',
        path: '/grupos/descubrimiento',
        icon: 'explore',
      },
      { label: 'Mis grupos', short: 'Grupos', path: '/grupos/gestion', icon: 'groups' },
      { label: 'Crear grupo', short: 'Crear', path: '/grupos/crear', icon: 'add' },
      {
        label: 'Recomendaciones IA',
        short: 'Recomendaciones',
        path: '/grupos/recomendaciones',
        icon: 'auto_awesome',
      },
      { label: 'Flashcards', short: 'Flashcards', path: '/flashcards', icon: 'style' },
    ],
    tutor: [
      { label: 'Inicio', short: 'Inicio', path: '/inicio', icon: 'home' },
      { label: 'Mis grupos', short: 'Grupos', path: '/grupos/gestion', icon: 'groups' },
      { label: 'Crear grupo', short: 'Crear', path: '/grupos/crear', icon: 'add' },
      {
        label: 'Crear grupo con IA',
        short: 'Crear con IA',
        path: '/grupos/crear-con-ia',
        icon: 'auto_awesome',
      },
      {
        label: 'Solicitudes',
        short: 'Solicitudes',
        path: '/grupos/solicitudes',
        icon: 'person_add',
      },
      { label: 'Flashcards', short: 'Flashcards', path: '/flashcards', icon: 'style' },
    ],
  };
  readonly mobileNavigation = {
    estudiante: [
      this.navigation.estudiante[0],
      this.navigation.estudiante[1],
      this.navigation.estudiante[2],
      this.navigation.estudiante[5],
    ],
    tutor: [
      this.navigation.tutor[0],
      this.navigation.tutor[1],
      this.navigation.tutor[2],
      this.navigation.tutor[4],
    ],
  };
}
