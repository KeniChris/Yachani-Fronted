import { Routes } from '@angular/router';

export const routes: Routes = [
  // Reserva de la landing: sin componente hasta que se solicite su implementación.
  { path: '', pathMatch: 'full', children: [] },
  {
    path: 'auth',
    loadComponent: () => import('./layout/auth-layout/auth-layout').then((m) => m.AuthLayout),
    loadChildren: () => import('./pages/auth/auth.routes').then((m) => m.routes),
  },
  {
    path: 'configuracion-inicial',
    loadComponent: () =>
      import('./layout/configuracion-layout/configuracion-layout').then(
        (m) => m.ConfiguracionLayout,
      ),
    loadChildren: () =>
      import('./pages/configuracion-inicial/configuracion-inicial.routes').then((m) => m.routes),
  },
  {
    path: '',
    loadComponent: () => import('./layout/app-layout/app-layout').then((m) => m.AppLayout),
    children: [
      {
        path: 'inicio',
        loadChildren: () => import('./pages/inicio/inicio.routes').then((m) => m.routes),
      },
      {
        path: 'perfiles',
        loadChildren: () => import('./pages/perfiles/perfiles.routes').then((m) => m.routes),
      },
      {
        path: 'grupos',
        loadChildren: () => import('./pages/grupos/grupos.routes').then((m) => m.routes),
      },
      {
        path: 'recursos',
        loadChildren: () => import('./pages/recursos/recursos.routes').then((m) => m.routes),
      },
      {
        path: 'flashcards',
        loadChildren: () => import('./pages/flashcards/flashcards.routes').then((m) => m.routes),
      },
      {
        path: 'notificaciones',
        loadChildren: () =>
          import('./pages/notificaciones/notificaciones.routes').then((m) => m.routes),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
