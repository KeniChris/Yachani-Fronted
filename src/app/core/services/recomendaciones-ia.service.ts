import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TipoGrupo } from '../models/grupo-estudio.models';

export interface RecomendacionGruposRequest {
  curso: string;
  metodoEstudio?: string;
  tipoGrupo?: TipoGrupo;
}

export interface GrupoRecomendado {
  idGrupo: number;
  nombre: string;
  descripcion: string;
  metodoEstudio: string;
  tipoGrupo: TipoGrupo;
  cuposDisponibles: number;
  motivo: string;
}

@Injectable({ providedIn: 'root' })
export class RecomendacionesIaService {
  private readonly http = inject(HttpClient);

  recomendar(filtros: RecomendacionGruposRequest) {
    return this.http.post<{ recomendaciones: GrupoRecomendado[] }>(
      environment.apiUrl + '/ia/grupos/recomendar',
      filtros,
    );
  }
}