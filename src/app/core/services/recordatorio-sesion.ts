import { SesionEstudioResponse } from '../models/sesion-estudio.models';

// El backend envía la notificación de recordatorio 60 minutos antes del inicio
// (yachani.recordatorio.minutos-antes). La UI usa la misma ventana para que el aviso
// dentro de la plataforma aparezca junto con la notificación, no antes ni después.
export const MINUTOS_RECORDATORIO = 60;

export interface RecordatorioSesion {
  sesion: SesionEstudioResponse;
  // Minutos que faltan para empezar; 0 cuando ya está en curso.
  minutosRestantes: number;
  enCurso: boolean;
  texto: string;
}

// Un recordatorio no necesita tabla ni endpoint propio: se deduce de la hora de inicio
// de las sesiones PROGRAMADAS que ya devuelve GET /grupos/{idGrupo}/sesiones.
export function recordatoriosDeSesiones(
  sesiones: readonly SesionEstudioResponse[],
  ahora: number,
): RecordatorioSesion[] {
  const ventana = MINUTOS_RECORDATORIO * 60000;
  return sesiones
    .filter((sesion) => sesion.estado === 'PROGRAMADA')
    .map((sesion) => {
      const inicio = new Date(sesion.fechaHoraInicio).getTime();
      const fin = inicio + sesion.duracionMinutos * 60000;
      return { sesion, inicio, fin };
    })
    // Se descartan las fechas que no se pueden leer, para no mostrar "NaN minutos".
    .filter(({ inicio }) => Number.isFinite(inicio))
    .filter(({ inicio, fin }) => ahora <= fin && inicio - ahora <= ventana)
    .sort((a, b) => a.inicio - b.inicio)
    .map(({ sesion, inicio }) => {
      const faltan = inicio - ahora;
      const enCurso = faltan <= 0;
      const minutosRestantes = enCurso ? 0 : Math.ceil(faltan / 60000);
      return { sesion, minutosRestantes, enCurso, texto: texto(enCurso, minutosRestantes) };
    });
}

function texto(enCurso: boolean, minutos: number): string {
  if (enCurso) return 'Está en curso';
  if (minutos <= 1) return 'Empieza en menos de un minuto';
  return `Empieza en ${minutos} minutos`;
}
