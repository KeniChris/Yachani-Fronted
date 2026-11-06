import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'recuperar-contrasena',
    loadComponent: () =>
      import('./recuperar-contrasena/recuperar-contrasena').then((m) => m.RecuperarContrasena),
  },
  {
    path: 'verificar-codigo',
    loadComponent: () =>
      import('./verificar-codigo/verificar-codigo').then((m) => m.VerificarCodigo),
  },
  {
    path: 'restablecer-contrasena',
    loadComponent: () =>
      import('./restablecer-contrasena/restablecer-contrasena').then(
        (m) => m.RestablecerContrasena,
      ),
  },
  {
    path: 'registro',
    loadComponent: () => import('./registro/registro').then((m) => m.Registro),
  },
  { path: '', pathMatch: 'full', redirectTo: 'iniciar-sesion' },
  {
    path: 'iniciar-sesion',
    loadComponent: () => import('./iniciar-sesion/iniciar-sesion').then((m) => m.IniciarSesion),
  },
];
