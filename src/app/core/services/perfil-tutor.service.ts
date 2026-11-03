import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  TutorPerfilRequest,
  TutorPerfilResponse,
} from '../models/perfil-tutor.models';

@Injectable({
  providedIn: 'root',
})
export class PerfilTutorService {
  private readonly http = inject(HttpClient);

  private perfilUrl(idUsuario: number): string {
    return `${environment.apiUrl}/tutores/${idUsuario}/perfil`;
  }

  consultarPerfil(idUsuario: number) {
    return this.http.get<TutorPerfilResponse>(
      `${this.perfilUrl(idUsuario)}/datos`,
    );
  }

  guardarPerfil(idUsuario: number, datos: TutorPerfilRequest) {
    return this.http.put<TutorPerfilResponse>(
      this.perfilUrl(idUsuario),
      datos,
    );
  }
}