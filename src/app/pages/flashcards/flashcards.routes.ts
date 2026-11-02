import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./mis-mazos/mis-mazos').then((m) => m.MisMazos),
  },
  { path: 'crear', loadComponent: () => import('./mis-mazos/datos-mazo').then((m) => m.DatosMazo) },
  {
    path: ':mazoId/datos',
    loadComponent: () => import('./mis-mazos/datos-mazo').then((m) => m.DatosMazo),
  },
  {
    path: ':mazoId/publicaciones',
    loadComponent: () =>
      import('./compartir-mazo/publicaciones-mazo').then((m) => m.PublicacionesMazo),
  },
  {
    path: ':mazoId/repaso',
    loadComponent: () => import('./repaso/repaso').then((m) => m.Repaso),
    data: { enGrupo: false },
  },
  { path: ':mazoId', loadComponent: () => import('./tarjetas/tarjetas').then((m) => m.Tarjetas) },
];
