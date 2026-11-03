import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoginRequest,
  RegistroRequest,
  UsuarioResponse,
} from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly authUrl = `${environment.apiUrl}/auth`;

  private readonly usuarioActual = signal<UsuarioResponse | null>(null);
  readonly usuario = this.usuarioActual.asReadonly();

  registrar(datos: RegistroRequest) {
    return this.http.post<UsuarioResponse>(
      `${this.authUrl}/registro`,
      datos,
    );
  }

  iniciarSesion(datos: LoginRequest) {
    this.usuarioActual.set(null);

    return this.http
      .post<UsuarioResponse>(`${this.authUrl}/login`, datos)
      .pipe(
        tap((usuario) => this.usuarioActual.set(usuario)),
      );
  }
}