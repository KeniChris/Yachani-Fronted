import { Routes } from '@angular/router';

// Registrar aquí las pantallas del área cuando se implementen.
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./notificaciones').then((m) => m.Notificaciones),
  },
];
