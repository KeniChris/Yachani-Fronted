import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  PerfilTutorPublicoResponse,
  ResenaRequest,
  ResenaResponse,
} from '../models/resena.models';

@Injectable({ providedIn: 'root' })
export class ResenaService {
  private readonly http = inject(HttpClient);

  consultarPerfilTutor(idTutor: number) {
    return this.http.get<PerfilTutorPublicoResponse>(
      `${this.tutorUrl(idTutor)}/perfil`,
    );
  }

  listar(idTutor: number) {
    return this.http.get<ResenaResponse[]>(`${this.tutorUrl(idTutor)}/resenas`);
  }

  publicar(idTutor: number, datos: ResenaRequest) {
    return this.http.post<ResenaResponse>(
      `${this.tutorUrl(idTutor)}/resenas`,
      datos,
    );
  }

  private tutorUrl(idTutor: number): string {
    return `${environment.apiUrl}/tutores/${idTutor}`;
  }
}

export function formatearPromedio(promedio: number | null): string {
  return (promedio ?? 0).toFixed(1).replace('.', ',');
}

export function inicialesDe(nombreCompleto: string): string {
  return nombreCompleto
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => Array.from(parte)[0] ?? '')
    .join('')
    .toLocaleUpperCase();
}
