import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canMatch: [
      () => {
        const usuario = inject(AuthService).usuario();

        if (!usuario) {
          return inject(Router).parseUrl('/auth/iniciar-sesion');
        }

        return usuario.tipoUsuario === 'ESTUDIANTE';
      },
    ],
    loadComponent: () =>
      import('./inicio-estudiante/inicio-estudiante').then(
        (m) => m.InicioEstudiante,
      ),
  },
  {
    path: '',
    pathMatch: 'full',
    canMatch: [
      () => {
        const usuario = inject(AuthService).usuario();

        if (!usuario) {
          return inject(Router).parseUrl('/auth/iniciar-sesion');
        }

        return usuario.tipoUsuario === 'TUTOR';
      },
    ],
    loadComponent: () =>
      import('./inicio-tutor/inicio-tutor').then(
        (m) => m.InicioTutor,
      ),
  },
];