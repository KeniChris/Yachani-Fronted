import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AvisoRequest, AvisoResponse } from '../models/aviso.models';

@Injectable({
  providedIn: 'root',
})
export class AvisoService {
  private readonly http = inject(HttpClient);
  private readonly gruposUrl = `${environment.apiUrl}/grupos`;

  listarAvisos(idGrupo: number) {
    return this.http.get<AvisoResponse[]>(`${this.gruposUrl}/${idGrupo}/avisos`);
  }

  publicarAviso(idGrupo: number, datos: AvisoRequest) {
    return this.http.post<AvisoResponse>(`${this.gruposUrl}/${idGrupo}/avisos`, datos);
  }

  editarAviso(idGrupo: number, idAviso: number, datos: AvisoRequest) {
    return this.http.put<AvisoResponse>(`${this.gruposUrl}/${idGrupo}/avisos/${idAviso}`, datos);
  }
}
