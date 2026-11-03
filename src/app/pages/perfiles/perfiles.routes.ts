import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./estudiante/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
  },
];
