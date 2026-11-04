import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  DescargaResponse,
  EnvioResponse,
  GrupoRecursos,
  IntegranteGrupo,
  MaterialResponse,
  PaginaGrupos,
  PaginaMateriales,
  TemaRequest,
  TemaResponse,
} from '../models/recursos.models';
import { todasLasPaginas } from './paginas-api';
@Injectable({ providedIn: 'root' })
export class RecursosApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;
  grupos() {
    return todasLasPaginas<GrupoRecursos>((page) =>
      this.http.get<PaginaGrupos<GrupoRecursos>>(`${this.base}/grupos/mis-grupos`, {
        params: { page, size: 100 },
      }),
    );
  }
  grupo(id: number) {
    return this.http.get<GrupoRecursos>(`${this.base}/grupos/${id}`);
  }
  integrantes(id: number) {
    return this.http.get<IntegranteGrupo[]>(`${this.base}/grupos/${id}/integrantes`);
  }
  temas(id: number) {
    return this.http.get<TemaResponse[]>(`${this.base}/grupos/${id}/temas`);
  }
  crearTema(id: number, body: TemaRequest) {
    return this.http.post<TemaResponse>(`${this.base}/grupos/${id}/temas`, body);
  }
  editarTema(id: number, tema: number, body: TemaRequest) {
    return this.http.patch<TemaResponse>(`${this.base}/grupos/${id}/temas/${tema}`, body);
  }
  materiales(id: number, page = 0, size = 10, idTema: number | null = null) {
    const params: Record<string, number> = { page, size };
    if (idTema !== null) params['idTema'] = idTema;
    return this.http.get<PaginaMateriales<MaterialResponse>>(
      `${this.base}/grupos/${id}/materiales`,
      { params },
    );
  }
  subir(id: number, archivos: readonly File[], tema: number | null) {
    const form = new FormData();
    archivos.forEach((a) => form.append('archivos', a));
    if (tema !== null) form.append('idTema', String(tema));
    return this.http.post<EnvioResponse>(`${this.base}/grupos/${id}/materiales`, form);
  }
  cambiarTema(id: number, material: number, idTema: number | null) {
    return this.http.patch<MaterialResponse>(
      `${this.base}/grupos/${id}/materiales/${material}/tema`,
      { idTema },
    );
  }
  descarga(id: number, material: number) {
    return this.http.get<DescargaResponse>(
      `${this.base}/grupos/${id}/materiales/${material}/descarga`,
    );
  }
  eliminar(id: number, material: number) {
    return this.http.delete<void>(`${this.base}/grupos/${id}/materiales/${material}`);
  }
}
