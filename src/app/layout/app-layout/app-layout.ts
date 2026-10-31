import { NgTemplateOutlet } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
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
    Brand,
  ],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.css',
})
export class AppLayout {
  // Variante visual mediante datos de ruta o ?rol=tutor; sin autenticación.
  @Input() rol: 'estudiante' | 'tutor' = 'estudiante';
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
