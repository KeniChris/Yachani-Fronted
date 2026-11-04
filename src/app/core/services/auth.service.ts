import {
  computed,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  LoginResponse,
  RegistroRequest,
  SesionGuardada,
  UsuarioResponse,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly claveSesion = 'yachani.sesion';

  private readonly sesionActual = signal<SesionGuardada | null>(null);

  readonly usuario = computed(
    () => this.sesionActual()?.usuario ?? null,
  );

  constructor() {
    this.restaurarSesion();
  }

  registrar(datos: RegistroRequest) {
    return this.http.post<UsuarioResponse>(
      `${this.authUrl}/registro`,
      datos,
    );
  }

  iniciarSesion(datos: LoginRequest) {
    this.cerrarSesion();

    return this.http
      .post<LoginResponse>(`${this.authUrl}/login`, datos)
      .pipe(
        tap((respuesta) => {
          const {
            accessToken,
            tokenType,
            expiresIn,
            ...usuario
          } = respuesta;

          if (
            !accessToken ||
            tokenType.toLowerCase() !== 'bearer' ||
            !Number.isFinite(expiresIn) ||
            expiresIn <= 0
          ) {
            throw new Error('La respuesta de inicio de sesión no es válida.');
          }

          this.guardarSesion({
            usuario,
            accessToken,
            venceEn: Date.now() + expiresIn * 1000,
          });
        }),
      );
  }

  obtenerToken(): string | null {
    const sesion = this.sesionActual();

    if (!sesion) {
      return null;
    }

    if (Date.now() >= sesion.venceEn) {
      this.cerrarSesion();
      return null;
    }

    return sesion.accessToken;
  }

  estaAutenticado(): boolean {
    return this.obtenerToken() !== null;
  }

  consultarUsuarioActual() {
    return this.http
      .get<UsuarioResponse>(`${this.authUrl}/me`)
      .pipe(
        tap((usuario) => {
          const sesion = this.sesionActual();

          if (sesion && usuario.idUsuario === sesion.usuario.idUsuario) {
            this.guardarSesion({
              ...sesion,
              usuario,
            });
          }
        }),
      );
  }

  cerrarSesion(): void {
    this.sesionActual.set(null);

    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.removeItem(this.claveSesion);
      } catch {
        // La sesión en memoria ya se eliminó.
      }
    }
  }

  solicitarCodigo(correo: string) {
    return this.http.post<{ mensaje: string }>(
      `${this.authUrl}/recuperar-contrasena`,
      { correo },
    );
  }

  verificarCodigo(correo: string, codigo: string) {
    return this.http.post<{ mensaje: string }>(
      `${this.authUrl}/verificar-codigo`,
      { correo, codigo },
    );
  }

  restablecerContrasena(datos: {
    correo: string;
    codigo: string;
    nuevaContrasena: string;
    confirmarContrasena: string;
  }) {
    return this.http.post<{ mensaje: string }>(
      `${this.authUrl}/restablecer-contrasena`,
      datos,
    );
  }

  private guardarSesion(sesion: SesionGuardada): void {
    this.sesionActual.set(sesion);

    if (isPlatformBrowser(this.platformId)) {
      try {
        sessionStorage.setItem(
          this.claveSesion,
          JSON.stringify(sesion),
        );
      } catch {
        // Si el navegador bloquea el almacenamiento,
        // la sesión funciona en memoria.
      }
    }
  }

  private restaurarSesion(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const texto = sessionStorage.getItem(this.claveSesion);

      if (!texto) {
        return;
      }

      const datos = JSON.parse(texto) as SesionGuardada | null;

      if (
        !datos ||
        typeof datos.accessToken !== 'string' ||
        !datos.accessToken ||
        typeof datos.venceEn !== 'number' ||
        !Number.isFinite(datos.venceEn) ||
        datos.venceEn <= Date.now() ||
        !datos.usuario ||
        !Number.isInteger(datos.usuario.idUsuario) ||
        typeof datos.usuario.nombres !== 'string' ||
        typeof datos.usuario.apellidos !== 'string' ||
        typeof datos.usuario.correo !== 'string' ||
        typeof datos.usuario.configuracionCompletada !== 'boolean' ||
        !['ESTUDIANTE', 'TUTOR'].includes(datos.usuario.tipoUsuario)
      ) {
        this.cerrarSesion();
        return;
      }

      this.sesionActual.set(datos);
    } catch {
      this.cerrarSesion();
    }
  }
}