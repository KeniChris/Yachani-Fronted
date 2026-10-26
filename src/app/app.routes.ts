import { Routes } from '@angular/router';
import { PublicLayout } from './layouts/public-layout/public-layout';
import { AppLayout } from './layouts/app-layout/app-layout';
import { LandingPage } from './features/landing/pages/landing-page/landing-page';

export const routes: Routes = [
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