import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface BorradorGrupoIa {
  nombre: string | null;
  descripcion: string | null;
  metodoEstudio: string | null;
  capacidadMaxima: number | null;
  temasSugeridos: string[];
}

@Injectable({ providedIn: 'root' })
export class TutorIaService {
  private readonly http = inject(HttpClient);
  private readonly url = environment.apiUrl + '/ia';

  generarBorrador(instruccion: string) {
    return this.http.post<BorradorGrupoIa>(this.url + '/tutorias/borrador', { instruccion });
  }

  transcribir(audio: Blob, nombre: string) {
    const datos = new FormData();
    datos.append('audio', audio, nombre);
    return this.http.post<{ texto: string }>(this.url + '/voz/transcribir', datos);
  }
}
