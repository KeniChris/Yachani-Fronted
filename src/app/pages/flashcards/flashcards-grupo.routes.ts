import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./mazos-grupo/mazos-grupo').then((m) => m.MazosGrupo),
  },
  {
    path: ':mazoId',
    loadComponent: () => import('./repaso/repaso').then((m) => m.Repaso),
    data: { enGrupo: true },
  },
];
