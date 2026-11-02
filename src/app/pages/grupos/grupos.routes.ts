import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', children: [] },
  // Reservas de navegación de la guía; las pantallas se incorporarán en sus áreas.
  { path: 'descubrimiento', children: [] },
  {
    path: 'gestion',
    loadComponent: () => import('./gestion/mis-grupos').then((m) => m.MisGrupos),
  },
  {
    path: 'crear',
    loadComponent: () => import('./gestion/crear-grupo').then((m) => m.CrearGrupo),
  },
  { path: 'recomendaciones', children: [] },
  {
    path: 'crear-con-ia',
    loadComponent: () => import('./gestion/crear-con-ia').then((m) => m.CrearConIa),
  },
  // Figma no tiene una pantalla global de solicitudes: se abre la del grupo de ejemplo.
  { path: 'solicitudes', pathMatch: 'full', redirectTo: 'dominando-calculo/solicitudes' },
  {
    path: ':grupoId',
    loadComponent: () =>
      import('../../layout/grupo-layout/grupo-layout').then((m) => m.GrupoLayout),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'chat' },
      // Los contenedores reservan la navegación sin implementar pantallas.
      { path: 'chat', loadComponent: () => import('./chat/chat').then((m) => m.Chat) },
      {
        path: 'recursos',
        loadChildren: () => import('../recursos/recursos.routes').then((m) => m.routes),
      },
      {
        path: 'flashcards',
        loadChildren: () => import('../flashcards/flashcards-grupo.routes').then((m) => m.routes),
      },
      {
        path: 'sesiones',
        loadComponent: () => import('./sesiones/sesiones').then((m) => m.Sesiones),
      },
      {
        path: 'integrantes',
        loadComponent: () => import('./integrantes/integrantes').then((m) => m.Integrantes),
      },
      {
        path: 'solicitudes',
        loadComponent: () => import('./solicitudes/solicitudes').then((m) => m.Solicitudes),
      },
      { path: 'avisos', loadComponent: () => import('./avisos/avisos').then((m) => m.Avisos) },
    ],
  },
];
