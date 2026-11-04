import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { SesionEstudioRequest, SesionEstudioResponse } from '../models/sesion-estudio.models';

@Injectable({
  providedIn: 'root',
})
export class SesionEstudioService {
  private readonly http = inject(HttpClient);
  private readonly gruposUrl = `${environment.apiUrl}/grupos`;

  listarSesiones(idGrupo: number) {
    return this.http.get<SesionEstudioResponse[]>(`${this.gruposUrl}/${idGrupo}/sesiones`);
  }

  crearSesion(idGrupo: number, datos: SesionEstudioRequest) {
    return this.http.post<SesionEstudioResponse>(`${this.gruposUrl}/${idGrupo}/sesiones`, datos);
  }

  modificarSesion(idGrupo: number, idSesion: number, datos: SesionEstudioRequest) {
    return this.http.put<SesionEstudioResponse>(
      `${this.gruposUrl}/${idGrupo}/sesiones/${idSesion}`,
      datos,
    );
  }

  cancelarSesion(idGrupo: number, idSesion: number, idTutor: number) {
    return this.http.patch<SesionEstudioResponse>(
      `${this.gruposUrl}/${idGrupo}/sesiones/${idSesion}/cancelar`,
      {},
      { params: { idTutor } },
    );
  }
}
