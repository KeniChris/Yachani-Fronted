import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {
  ConfiguracionEstudianteRequest,
  ConocimientoAcademicoRequest,
  ConocimientoAcademicoResponse,
  PerfilAcademicoRequest,
  PerfilAcademicoResponse,
  PreferenciasEstudioRequest,
} from '../models/perfil-estudiante.models';



@Injectable({
  providedIn: 'root',
})
export class PerfilEstudianteService {
  private readonly http = inject(HttpClient);

  private perfilUrl(idUsuario: number): string {
    return `${environment.apiUrl}/estudiantes/${idUsuario}/perfil`;
  }

  consultarPerfil(idUsuario: number) {
    return this.http.get<PerfilAcademicoResponse>(
      this.perfilUrl(idUsuario),
    );
  }

  guardarAcademico(
    idUsuario: number,
    datos: PerfilAcademicoRequest,
  ) {
    return this.http.put<PerfilAcademicoResponse>(
      `${this.perfilUrl(idUsuario)}/academico`,
      datos,
    );
  }

  guardarPreferencias(
    idUsuario: number,
    datos: PreferenciasEstudioRequest,
  ) {
    return this.http.put<PerfilAcademicoResponse>(
      `${this.perfilUrl(idUsuario)}/preferencias`,
      datos,
    );
  }

  registrarCurso(
    idUsuario: number,
    datos: ConocimientoAcademicoRequest,
  ) {
    return this.http.post<ConocimientoAcademicoResponse>(
      `${this.perfilUrl(idUsuario)}/conocimientos`,
      datos,
    );
  }

  actualizarCurso(
    idUsuario: number,
    idConocimiento: number,
    datos: ConocimientoAcademicoRequest,
  ) {
    return this.http.put<ConocimientoAcademicoResponse>(
      `${this.perfilUrl(idUsuario)}/conocimientos/${idConocimiento}`,
      datos,
    );
  }

  guardarConfiguracion(datos: ConfiguracionEstudianteRequest) {
  return this.http.put<PerfilAcademicoResponse>(
    `${environment.apiUrl}/usuarios/me/configuracion/estudiante`,
    datos,
  );
}
}