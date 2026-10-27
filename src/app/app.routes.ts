import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { AppLayout } from './layouts/app-layout/app-layout';
import { LandingPage } from './features/landing/pages/landing-page/landing-page';
import { AuthLayout } from './layouts/auth-layout/auth-layout';
import { ConfiguracionLayout } from './layouts/configuracion-layout/configuracion-layout';

export const routes: Routes = [
  {
    path: 'configuracion-inicial',
    component: ConfiguracionLayout,
    children: [{
      path: 'estudiante',
      title: 'Completa tu perfil de estudiante | Yachani',
      loadComponent: () => import('./features/configuracion-inicial/pages/configuracion-estudiante/configuracion-estudiante').then(m => m.ConfiguracionEstudiante),
    }, {
      path: 'tutor',
      title: 'Completa tu perfil de tutor | Yachani',
      loadComponent: () => import('./features/configuracion-inicial/pages/configuracion-tutor/configuracion-tutor').then(m => m.ConfiguracionTutor),
    }],
  },
  {
    path: 'recuperar-contrasena', component: AuthLayout, data: { variante: 'recuperacion' },
    children: [{ path: '', title: 'Recuperar contraseña | Yachani', loadComponent: () => import('./features/auth/pages/recuperar-contrasena/recuperar-contrasena').then(m => m.RecuperarContrasena) }],
  },
  {
    path: 'verificar-codigo', component: AuthLayout, data: { variante: 'recuperacion' },
    children: [{ path: '', title: 'Verificar código | Yachani', loadComponent: () => import('./features/auth/pages/verificar-codigo/verificar-codigo').then(m => m.VerificarCodigo) }],
  },
  {
    path: 'restablecer-contrasena', component: AuthLayout, data: { variante: 'recuperacion' },
    children: [{ path: '', title: 'Nueva contraseña | Yachani', loadComponent: () => import('./features/auth/pages/restablecer-contrasena/restablecer-contrasena').then(m => m.RestablecerContrasena) }],
  },
  {
    path: 'registro',
    component: AuthLayout,
    children: [{
      path: '',
      title: 'Crea tu cuenta | Yachani',
      loadComponent: () => import('./features/auth/pages/registro/registro').then(m => m.Registro),
    }],
  },
  {
    path: 'login',
    component: AuthLayout,
    children: [
      {
        path: '',
        title: 'Iniciar sesión | Yachani',
        loadComponent: () => import('./features/auth/pages/iniciar-sesion/iniciar-sesion').then(m => m.IniciarSesion),
      },
    ],
  },
  {
    path: '',
    component: PublicLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: LandingPage
      }
    ]
  },
  {
    path: 'app',
    component: AppLayout,
    children: [
      {
        path: 'inicio-estudiante',
        title: 'Inicio del estudiante | Yachani',
        data: { rolVista: 'estudiante' },
        // La autenticación deberá comprobar el rol; esta ruta no lo valida.
        loadComponent: () => import('./features/dashboard/pages/inicio-estudiante/inicio-estudiante').then(m => m.InicioEstudiante),
      },
      {
        path: 'inicio-tutor',
        title: 'Inicio del tutor | Yachani',
        // Solo indica la variante visual. El backend deberá autorizar el rol real.
        data: { rolVista: 'tutor' },
        loadComponent: () => import('./features/dashboard/pages/inicio-tutor/inicio-tutor').then(m => m.InicioTutor),
      },
    ]
  }
];
