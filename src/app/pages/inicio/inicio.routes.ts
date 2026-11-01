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
    loadComponent: () =>
      import('./inicio-estudiante/inicio-estudiante').then((m) => m.InicioEstudiante),
  },
  // Reserva para el inicio del tutor, que todavía no tiene componente.
  { path: '', pathMatch: 'full', children: [] },
];
