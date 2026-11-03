import { inject, Injectable, signal } from '@angular/core';
import { UsuarioResponse } from '../models/auth.models';
import { AuthService } from './auth.service';

const CLAVE_SESION = 'yachani.sesion';

// Usuarios de ejemplo sembrados en la base, para cuando todavía no hay sesión iniciada.
const ID_TUTOR_DEMO = 1; // Carlos Ríos
const ID_ESTUDIANTE_DEMO = 2; // Leicy Cahuana

// Identidad del usuario para las pantallas de grupos y notificaciones.
// La fuente de verdad del login es AuthService; este servicio solo añade persistencia,
// porque AuthService guarda la sesión en memoria y se pierde al recargar la página.
@Injectable({
  providedIn: 'root',
})
export class SesionUsuarioService {
  private readonly auth = inject(AuthService);
  private readonly guardado = signal<UsuarioResponse | null>(this.leerGuardado());

  private leerGuardado(): UsuarioResponse | null {
    try {
      const valor = localStorage.getItem(CLAVE_SESION);
      return valor ? JSON.parse(valor) : null;
    } catch {
      return null;
    }
  }

  // Prioriza la sesión viva de AuthService; si no hay (p. ej. tras recargar),
  // recurre a la última sesión guardada.
  actual(): UsuarioResponse | null {
    const enMemoria = this.auth.usuario();

    if (enMemoria) {
      this.recordar(enMemoria);
      return enMemoria;
    }

    return this.guardado();
  }

  private recordar(usuario: UsuarioResponse) {
    if (this.guardado()?.idUsuario === usuario.idUsuario) {
      return;
    }

    this.guardado.set(usuario);

    try {
      localStorage.setItem(CLAVE_SESION, JSON.stringify(usuario));
    } catch {
      // Sin almacenamiento disponible: la sesión queda solo en memoria.
    }
  }

  // Identidad para las llamadas a la API. Sin sesión iniciada se usan los usuarios
  // de ejemplo, según el rol visible (?rol=tutor).
  idUsuario(rolVisible = 'estudiante'): number {
    const usuario = this.actual();

    if (usuario) {
      return usuario.idUsuario;
    }

    return rolVisible === 'tutor' ? ID_TUTOR_DEMO : ID_ESTUDIANTE_DEMO;
  }

  esTutor(rolVisible = 'estudiante'): boolean {
    const usuario = this.actual();

    if (usuario) {
      return usuario.tipoUsuario === 'TUTOR';
    }

    return rolVisible === 'tutor';
  }

  cerrarSesion() {
    this.guardado.set(null);

    try {
      localStorage.removeItem(CLAVE_SESION);
    } catch {
      // Ignorar si no hay almacenamiento disponible.
    }
  }
}
