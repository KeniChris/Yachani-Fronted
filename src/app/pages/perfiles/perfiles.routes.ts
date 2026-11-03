import { Routes } from '@angular/router';

import { inject } from '@angular/core';
import { Router } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    // Mismo query param que recibe AppLayout; los datos de una ruta hija no configuran al padre.
    canMatch: [
      () => inject(Router).getCurrentNavigation()?.extractedUrl.queryParams['rol'] !== 'tutor',
    ],
    loadComponent: () => import('./estudiante/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
  },
  {
    path: '',
    pathMatch: 'full',
    canMatch: [
      () => inject(Router).getCurrentNavigation()?.extractedUrl.queryParams['rol'] === 'tutor',
    ],
    loadComponent: () =>
      import('./tutor/mi-perfil-tutor/mi-perfil-tutor').then((m) => m.MiPerfilTutor),
  },
  {
    path: 'otro-estudiante',
    loadComponent: () =>
      import('./estudiante/perfil-estudiante/perfil-estudiante').then((m) => m.PerfilEstudiante),
  },
  {
    path: 'otro-tutor/resenas',
    loadComponent: () => import('./tutor/resenas-tutor/resenas-tutor').then((m) => m.ResenasTutor),
  },
  {
    path: 'otro-tutor',
    loadComponent: () => import('./tutor/perfil-tutor/perfil-tutor').then((m) => m.PerfilTutor),
  },
];
