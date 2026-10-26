import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { AppLayout } from './layouts/app-layout/app-layout';
import { LandingPage } from './features/landing/pages/landing-page/landing-page';
import { AuthLayout } from './layouts/auth-layout/auth-layout';

export const routes: Routes = [
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
      // Aquí se agregarán las rutas de las funcionalidades.
    ]
  }
];
