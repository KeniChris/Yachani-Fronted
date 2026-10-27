import { EstadoSeccion, Seccion } from '../inicio-estudiante/inicio-estudiante.models';

export interface EstadisticaTutor {
  clave: 'grupos' | 'estudiantes' | 'solicitudes' | 'calificacion';
  titulo: string;
  icono: string;
  estado: EstadoSeccion;
  valor: number | null;
}
export interface SesionTutor {
  id: string; titulo: string; grupo: string; mes: string; dia: string; horario: string; modalidad: string;
}
export interface SolicitudTutor { id: string; nombre: string; grupo: string; }
export interface GrupoTutor {
  id: string; titulo: string; tema: string; icono: string; miembros: string[];
  estudiantes: number | null; cupo: number | null; activo: boolean | null;
}
export interface DatosInicioTutor {
  estadisticas: EstadisticaTutor[];
  sesiones: Seccion<SesionTutor[]>;
  solicitudes: Seccion<SolicitudTutor[]>;
  grupos: Seccion<GrupoTutor[]>;
}

export function crearInicioTutorVacio(): DatosInicioTutor {
  return {
    estadisticas: [
      { clave: 'grupos', titulo: 'Grupos activos', icono: 'groups', estado: 'vacio', valor: null },
      { clave: 'estudiantes', titulo: 'Estudiantes en total', icono: 'person', estado: 'vacio', valor: null },
      { clave: 'solicitudes', titulo: 'Solicitudes pendientes', icono: 'format_list_bulleted', estado: 'vacio', valor: null },
      { clave: 'calificacion', titulo: 'Calificación promedio', icono: 'star', estado: 'vacio', valor: null },
    ],
    sesiones: { estado: 'vacio', datos: [] },
    solicitudes: { estado: 'vacio', datos: [] },
    grupos: { estado: 'vacio', datos: [] },
  };
}
