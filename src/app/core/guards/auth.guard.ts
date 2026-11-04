import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import {
  catchError,
  finalize,
  map,
  Observable,
  of,
  shareReplay,
} from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UsuarioResponse } from '../models/auth.models';

// Comparte una consulta en curso entre los guards de la misma navegación.
let consultaEnCurso: {
  token: string;
  respuesta: Observable<UsuarioResponse>;
} | null = null;

function consultarSesion(
  authService: AuthService,
  token: string,
): Observable<UsuarioResponse> {
  if (consultaEnCurso?.token === token) {
    return consultaEnCurso.respuesta;
  }

  const respuesta = authService.consultarUsuarioActual().pipe(
    finalize(() => {
      if (consultaEnCurso?.respuesta === respuesta) {
        consultaEnCurso = null;
      }
    }),
    shareReplay({
      bufferSize: 1,
      refCount: true,
    }),
  );

  consultaEnCurso = { token, respuesta };

  return respuesta;
}

function manejarError(
  error: unknown,
  authService: AuthService,
  router: Router,
  tokenConsultado: string,
): Observable<boolean | UrlTree> {
  if (
    error instanceof HttpErrorResponse &&
    error.status === 401 &&
    (
      authService.obtenerToken() === null ||
      authService.obtenerToken() === tokenConsultado
    )
  ) {
    authService.cerrarSesion();
    return of(router.parseUrl('/auth/iniciar-sesion'));
  }

  // Si falla la red o el servidor, cancela esta navegación
  // sin borrar la sesión ni tratar el error como credenciales incorrectas.
  return of(false);
}

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.obtenerToken();

  if (!token) {
    return router.parseUrl('/auth/iniciar-sesion');
  }

  return consultarSesion(authService, token).pipe(
    map(() =>
      authService.obtenerToken() === token
        ? true
        : router.parseUrl('/auth/iniciar-sesion'),
    ),
    catchError((error: unknown) =>
      manejarError(error, authService, router, token),
    ),
  );
};

export const configuracionCompletadaGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.obtenerToken();

  if (!token) {
    return router.parseUrl('/auth/iniciar-sesion');
  }

  return consultarSesion(authService, token).pipe(
    map((usuario): boolean | UrlTree => {
      if (authService.obtenerToken() !== token) {
        return router.parseUrl('/auth/iniciar-sesion');
      }

      if (usuario.configuracionCompletada) {
        return true;
      }

      return router.parseUrl(
        usuario.tipoUsuario === 'TUTOR'
          ? '/configuracion-inicial/tutor'
          : '/configuracion-inicial/estudiante',
      );
    }),
    catchError((error: unknown) =>
      manejarError(error, authService, router, token),
    ),
  );
};