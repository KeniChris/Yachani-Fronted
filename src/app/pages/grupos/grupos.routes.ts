import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', children: [] },
  // Reservas de navegación de la guía; las pantallas se incorporarán en sus áreas.
  { path: 'descubrimiento', children: [] },
  { path: 'gestion', children: [] },
  { path: 'crear', children: [] },
  { path: 'recomendaciones', children: [] },
  { path: 'crear-con-ia', children: [] },
  { path: 'solicitudes', children: [] },
  {
    path: ':grupoId',
    loadComponent: () =>
      import('../../layout/grupo-layout/grupo-layout').then((m) => m.GrupoLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'chat' },
      // Los contenedores reservan la navegación sin implementar pantallas.
      { path: 'chat', children: [] },
      {
        path: 'recursos',
        loadChildren: () => import('../recursos/recursos.routes').then((m) => m.routes),
      },
      {
        path: 'flashcards',
        loadChildren: () => import('../flashcards/flashcards-grupo.routes').then((m) => m.routes),
      },
      { path: 'sesiones', children: [] },
      { path: 'integrantes', children: [] },
      { path: 'solicitudes', children: [] },
      { path: 'avisos', children: [] },
    ],
  },
];
