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
      import('./estudiante/mi-perfil/mi-perfil').then(
        (m) => m.MiPerfil,
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
      import('./tutor/mi-perfil-tutor/mi-perfil-tutor').then(
        (m) => m.MiPerfilTutor,
      ),
  },
  {
    path: 'otro-estudiante',
    loadComponent: () =>
      import('./estudiante/perfil-estudiante/perfil-estudiante').then(
        (m) => m.PerfilEstudiante,
      ),
  },
  {
    path: 'otro-tutor/resenas',
    loadComponent: () =>
      import('./tutor/resenas-tutor/resenas-tutor').then(
        (m) => m.ResenasTutor,
      ),
  },
  {
    path: 'otro-tutor',
    loadComponent: () =>
      import('./tutor/perfil-tutor/perfil-tutor').then(
        (m) => m.PerfilTutor,
      ),
  },
];