import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', children: [] },
  {
    path: 'estudiante',
    loadComponent: () =>
      import('./configuracion-estudiante/configuracion-estudiante').then(
        (m) => m.ConfiguracionEstudiante,
      ),
  },
];
