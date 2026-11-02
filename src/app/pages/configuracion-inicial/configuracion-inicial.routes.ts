import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tutor',
    loadComponent: () =>
      import('./configuracion-tutor/configuracion-tutor').then((m) => m.ConfiguracionTutor),
  },
  { path: '', children: [] },
  {
    path: 'estudiante',
    loadComponent: () =>
      import('./configuracion-estudiante/configuracion-estudiante').then(
        (m) => m.ConfiguracionEstudiante,
      ),
  },
];
