import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, Routes } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

type UserRole = 'estudiante' | 'tutor';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  // false: también queda activo en sus subrutas (p. ej. el espacio de un grupo).
  exact: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar {
  private readonly router = inject(Router);
  @Input() role: UserRole = 'estudiante';

  // Un menú por rol: cada uno muestra solo las funcionalidades que le corresponden.
  // Las rutas con prefijo de rol conservan la vista al navegar.
  private readonly menus: Record<UserRole, MenuItem[]> = {
    estudiante: [
      { label: 'Inicio', icon: 'home', route: '/app/inicio-estudiante', exact: true },
      { label: 'Explorar grupos', icon: 'explore', route: '/app/explorar', exact: true },
      { label: 'Mis grupos', icon: 'groups', route: '/app/estudiante/grupos', exact: false },
      { label: 'Recomendaciones IA', icon: 'auto_awesome', route: '/app/recomendaciones', exact: true },
      { label: 'Flashcards', icon: 'style', route: '/app/flashcards', exact: true },
    ],
    tutor: [
      { label: 'Inicio', icon: 'home', route: '/app/inicio-tutor', exact: true },
      { label: 'Mis grupos', icon: 'groups', route: '/app/tutor/grupos', exact: false },
      { label: 'Crear grupo', icon: 'add', route: '/app/tutor/crear-grupo', exact: true },
      { label: 'Crear grupo con IA', icon: 'auto_awesome', route: '/app/tutor/crear-grupo-ia', exact: true },
      { label: 'Solicitudes', icon: 'person_add', route: '/app/tutor/solicitudes', exact: true },
      { label: 'Flashcards', icon: 'style', route: '/app/flashcards', exact: true },
    ],
  };

  get visibleItems(): MenuItem[] { return this.menus[this.role]; }

  get homeRoute(): string { return this.role === 'estudiante' ? '/app/inicio-estudiante' : '/app/inicio-tutor'; }

  rutaDisponible(ruta: string): boolean {
    const buscar = (config: Routes, segmentos: string[]): boolean => config.some(route => {
      const partes = (route.path ?? '').split('/').filter(Boolean);
      if (!partes.every((parte, i) => parte === segmentos[i])) return false;
      const restantes = segmentos.slice(partes.length);
      return restantes.length === 0 || (!!route.children && buscar(route.children, restantes));
    });
    return buscar(this.router.config, ruta.split('/').filter(Boolean));
  }
}
