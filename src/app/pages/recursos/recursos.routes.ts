import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'temas' },
  { path: 'temas', loadComponent: () => import('./temas/temas').then(m => m.Temas) },
  { path: 'materiales', loadComponent: () => import('./materiales/materiales').then(m => m.Materiales) },
];
