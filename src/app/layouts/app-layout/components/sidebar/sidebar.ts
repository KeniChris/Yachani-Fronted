import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

type UserRole = 'estudiante' | 'tutor';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  roles: UserRole[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  @Input() role: UserRole = 'estudiante';

  readonly items: MenuItem[] = [
    {
      label: 'Inicio',
      icon: 'home',
      route: '/app',
      roles: ['estudiante', 'tutor']
    },
    {
      label: 'Explorar grupos',
      icon: 'explore',
      route: '/app/explorar',
      roles: ['estudiante']
    },
    {
      label: 'Mis grupos',
      icon: 'groups',
      route: '/app/grupos',
      roles: ['estudiante', 'tutor']
    },
    {
      label: 'Crear grupo',
      icon: 'add',
      route: '/app/grupos/crear',
      roles: ['estudiante', 'tutor']
    },
    {
      label: 'Recomendaciones IA',
      icon: 'auto_awesome',
      route: '/app/recomendaciones',
      roles: ['estudiante']
    },
    {
      label: 'Crear grupo con IA',
      icon: 'auto_awesome',
      route: '/app/grupos/crear-ia',
      roles: ['tutor']
    },
    {
      label: 'Solicitudes',
      icon: 'person_add',
      route: '/app/solicitudes',
      roles: ['tutor']
    },
    {
      label: 'Flashcards',
      icon: 'style',
      route: '/app/flashcards',
      roles: ['estudiante', 'tutor']
    }
  ];

  get visibleItems(): MenuItem[] {
    return this.items.filter(item => item.roles.includes(this.role));
  }
}