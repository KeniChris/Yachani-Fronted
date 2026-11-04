import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PaginaGrupos, TAMANO_PAGINA_MAXIMO } from '../models/pagina.models';
import { todasLasPaginas } from './paginas-api';
import { environment } from '../../../environments/environment';
import {
  CrearGrupoRequest,
  FiltrarGruposParams,
  GrupoEstudioResponse,
  IntegranteResponse,
  MiSolicitudResponse,
  SolicitudPendienteResponse,
  SolicitudResponse,
} from '../models/grupo-estudio.models';

// idGrupo=1 ("Dominando Cálculo") es el grupo sembrado en la base de ejemplo.
export const ID_GRUPO_DEMO = 1;

// Algunos enlaces heredados todavía usan el slug 'dominando-calculo' en vez del idGrupo
// real. Mis grupos y Descubrimiento ya generan sus enlaces con el id numérico, así que
// las pantallas aceptan ambas formas.
const SLUGS_GRUPOS: Record<string, number> = {
  'dominando-calculo': ID_GRUPO_DEMO,
};

export function idGrupoDesdeSlug(slug: string): number | null {
  if (slug in SLUGS_GRUPOS) return SLUGS_GRUPOS[slug];
  const numero = Number(slug);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

@Injectable({
  providedIn: 'root',
})
export class GrupoEstudioService {
  private readonly http = inject(HttpClient);
  private readonly gruposUrl = `${environment.apiUrl}/grupos`;

  crearGrupo(datos: CrearGrupoRequest) {
    return this.http.post<GrupoEstudioResponse>(this.gruposUrl, datos);
  }

  listarMisGrupos(idUsuario: number) {
    return todasLasPaginas<GrupoEstudioResponse>((page) =>
      this.http.get<PaginaGrupos<GrupoEstudioResponse>>(`${this.gruposUrl}/mis-grupos`, {
        params: { page, size: TAMANO_PAGINA_MAXIMO },
      }),
    );
  }

  obtenerGrupo(idGrupo: number) {
    return this.http.get<GrupoEstudioResponse>(`${this.gruposUrl}/${idGrupo}`);
  }

  buscarGrupos(query: string) {
    return todasLasPaginas<GrupoEstudioResponse>((page) =>
      this.http.get<PaginaGrupos<GrupoEstudioResponse>>(`${this.gruposUrl}/buscar`, {
        params: { query, page, size: TAMANO_PAGINA_MAXIMO },
      }),
    );
  }

  filtrarGrupos(filtros: FiltrarGruposParams) {
    const params: Record<string, string> = {
      curso: filtros.curso ?? '',
      metodoEstudio: filtros.metodoEstudio ?? '',
    };

    if (filtros.cantidadIntegrantes !== undefined) {
      params['cantidadIntegrantes'] = String(filtros.cantidadIntegrantes);
    }

    if (filtros.tipoGrupo) {
      params['tipoGrupo'] = filtros.tipoGrupo;
    }

    return todasLasPaginas<GrupoEstudioResponse>((page) =>
      this.http.get<PaginaGrupos<GrupoEstudioResponse>>(`${this.gruposUrl}/filtrar`, {
        params: { ...params, page, size: TAMANO_PAGINA_MAXIMO },
      }),
    );
  }

  actualizarCapacidad(idGrupo: number, nuevaCapacidad: number) {
    return this.http.patch<GrupoEstudioResponse>(`${this.gruposUrl}/${idGrupo}/capacidad`, {
      nuevaCapacidad,
    });
  }

  editarNombre(idGrupo: number, nombre: string) {
    return this.http.patch<GrupoEstudioResponse>(`${this.gruposUrl}/${idGrupo}/nombre`, {
      nombre,
    });
  }

  cambiarPublicaciones(idGrupo: number, permitirPublicaciones: boolean) {
    return this.http.patch<GrupoEstudioResponse>(`${this.gruposUrl}/${idGrupo}/publicaciones`, {
      permitirPublicaciones,
    });
  }

  listarIntegrantes(idGrupo: number) {
    return this.http.get<IntegranteResponse[]>(`${this.gruposUrl}/${idGrupo}/integrantes`);
  }

  eliminarIntegrante(idGrupo: number, idUsuario: number) {
    return this.http.delete<void>(`${this.gruposUrl}/${idGrupo}/integrantes/${idUsuario}`);
  }

  listarSolicitudes(idGrupo: number) {
    return todasLasPaginas<SolicitudPendienteResponse>((page) =>
      this.http.get<PaginaGrupos<SolicitudPendienteResponse>>(
        `${this.gruposUrl}/${idGrupo}/solicitudes`,
        { params: { page, size: TAMANO_PAGINA_MAXIMO } },
      ),
    );
  }

  // Solicitudes que envió el estudiante, para la sección "Mis solicitudes".
  listarMisSolicitudes(idEstudiante: number) {
    return todasLasPaginas<MiSolicitudResponse>((page) =>
      this.http.get<PaginaGrupos<MiSolicitudResponse>>(`${this.gruposUrl}/solicitudes`, {
        params: { page, size: TAMANO_PAGINA_MAXIMO },
      }),
    );
  }

  solicitarUnirse(idGrupo: number, idEstudiante: number) {
    return this.http.post<SolicitudResponse>(`${this.gruposUrl}/${idGrupo}/solicitudes`, {
      idEstudiante,
    });
  }

  aceptarSolicitud(idSolicitud: number) {
    return this.http.put<SolicitudResponse>(
      `${this.gruposUrl}/solicitudes/${idSolicitud}/aceptar`,
      {},
    );
  }

  rechazarSolicitud(idSolicitud: number) {
    return this.http.put<SolicitudResponse>(
      `${this.gruposUrl}/solicitudes/${idSolicitud}/rechazar`,
      {},
    );
  }
}
