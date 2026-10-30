export type RolGrupo = 'tutor' | 'estudiante';

export type DiaSemana = 'lunes' | 'martes' | 'miercoles' | 'jueves' | 'viernes' | 'sabado' | 'domingo';
export interface HorarioGrupo { dias: DiaSemana[]; inicio: string; fin: string; }

export interface GrupoEstudio {
  id: string; nombre: string; curso: string; tema: string; metodo: string; icono: string;
  // Pendiente de confirmar con backend: `modalidad`, `descripcion` y `horario` no están documentados en GrupoEstudio.
  modalidad: string; descripcion: string; horario: HorarioGrupo | null;
  capacidadMaxima: number; tutorId: string;
}
export type DatosGrupo = Pick<GrupoEstudio, 'nombre' | 'curso' | 'tema' | 'descripcion' | 'metodo' | 'modalidad' | 'capacidadMaxima' | 'icono' | 'horario'>;
// Datos para precargar el formulario de creación, por ejemplo desde la propuesta de la IA.
export interface BorradorGrupo { datos: DatosGrupo; temas: string[]; origen: 'ia'; }

// Membresía: `ciclo` y `fechaIngreso` deben confirmarse con backend (Perfil académico y Membresía).
export interface IntegranteGrupo {
  grupoId: string; usuarioId: string; nombre: string; carrera: string;
  ciclo: string | null; rol: RolGrupo; fechaIngreso: Date | null;
}

// Los temas pertenecen a "Temas y materiales"; aquí solo se leen para asociar sesiones y adjuntos.
export interface TemaGrupo { id: string; grupoId: string; nombre: string; }

export interface AdjuntoMensaje { nombre: string; tamanoBytes: number; extension: string; temaId: string | null; }
export interface MensajeChat {
  id: string; grupoId: string; autorId: string; contenido: string;
  adjunto: AdjuntoMensaje | null; fechaEnvio: Date; eliminado: boolean;
}

export type EstadoSesion = 'programada' | 'modificada' | 'cancelada';
export type ModalidadSesion = 'virtual' | 'presencial';
// Backend solo documenta fecha, hora y tema: fin, modalidad, enlace y descripción están por confirmar.
export interface SesionEstudio {
  id: string; grupoId: string; titulo: string; temaId: string | null;
  inicio: Date; fin: Date; modalidad: ModalidadSesion; enlaceLugar: string; descripcion: string;
  estado: EstadoSesion; anterior: { inicio: Date; fin: Date } | null; recordatorioMinutos: number;
}
export type DatosSesion = Pick<SesionEstudio, 'titulo' | 'temaId' | 'inicio' | 'fin' | 'modalidad' | 'enlaceLugar' | 'descripcion'>;

// Entidad sin implementación en backend (US16). Prioridad y fijado están por confirmar.
export type PrioridadAviso = 'normal' | 'importante';
export interface AvisoGrupo {
  id: string; grupoId: string; autorId: string; titulo: string; contenido: string;
  prioridad: PrioridadAviso; fijado: boolean; fechaEnvio: Date; editado: boolean;
}
export type DatosAviso = Pick<AvisoGrupo, 'titulo' | 'contenido' | 'prioridad' | 'fijado'>;

export type EstadoSolicitud = 'pendiente' | 'aceptada' | 'rechazada';
// `mensaje` y el estado `aceptada` deben agregarse a SolicitudUnión en backend.
export interface SolicitudUnion {
  id: string; grupoId: string; estudianteId: string; nombre: string; carrera: string; ciclo: string | null;
  estado: EstadoSolicitud; fechaSolicitud: Date; fechaRespuesta: Date | null; mensaje: string | null;
}

export type TipoNotificacion = 'recordatorio' | 'cambio_sesion' | 'cancelacion';
export interface NotificacionUsuario {
  id: string; tipo: TipoNotificacion; sesionId: string; texto: string; fecha: Date; leida: boolean;
}

export interface DatosGrupos {
  grupos: GrupoEstudio[];
  integrantes: IntegranteGrupo[];
  temas: TemaGrupo[];
  mensajes: MensajeChat[];
  sesiones: SesionEstudio[];
  avisos: AvisoGrupo[];
  solicitudes: SolicitudUnion[];
  notificaciones: NotificacionUsuario[];
}

export function crearDatosGruposVacios(): DatosGrupos {
  return { grupos: [], integrantes: [], temas: [], mensajes: [], sesiones: [], avisos: [], solicitudes: [], notificaciones: [] };
}
