import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiUrl = environment.apiUrl.replace(/\/+$/, '');

  // No enviar el token a otras direcciones.
  if (!req.url.startsWith(`${apiUrl}/`)) {
    return next(req);
  }

  const ruta = req.url
    .slice(apiUrl.length)
    .split(/[?#]/)[0]
    .replace(/\/+$/, '');

  const rutasPublicas = [
    '/auth/registro',
    '/auth/login',
    '/auth/recuperar-contrasena',
    '/auth/verificar-codigo',
    '/auth/restablecer-contrasena',
    '/contacto',
  ];

  if (req.method === 'POST' && rutasPublicas.includes(ruta)) {
    return next(req);
  }

  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.obtenerToken();

  const solicitud = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      })
    : req;

  return next(solicitud).pipe(
    catchError((error: HttpErrorResponse) => {
      // Evita que una respuesta antigua cierre una sesión nueva.
      if (
        error.status === 401 &&
        authService.obtenerToken() === token
      ) {
        authService.cerrarSesion();

        void router.navigateByUrl('/auth/iniciar-sesion');
      }

      return throwError(() => error);
    }),
  );
};
