import { HorarioGrupo, RolGrupo, TipoNotificacion } from './grupos.models';
import { DIAS_SEMANA } from './grupos.opciones';

const LOCALE = 'es-PE';
const MINUTO = 60_000;
const hora = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit', hour12: true });
const diaMes = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });
const diaSemana = new Intl.DateTimeFormat(LOCALE, { weekday: 'short' });
const fechaLarga = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' });

const sinPunto = (texto: string) => texto.replace('.', '');
const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

export const formatearHora = (fecha: Date) => hora.format(fecha);
export const formatearDiaMes = (fecha: Date) => sinPunto(diaMes.format(fecha));
export const formatearDiaSemana = (fecha: Date) => capitalizar(sinPunto(diaSemana.format(fecha)));
export const formatearFechaLarga = (fecha: Date) => capitalizar(fechaLarga.format(fecha));
export const formatearRangoHora = (inicio: Date, fin: Date) => `${formatearHora(inicio)} – ${formatearHora(fin)}`;

export function mismoDia(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function diferenciaDias(fecha: Date, ahora: Date): number {
  const inicioDia = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((inicioDia(fecha) - inicioDia(ahora)) / 86_400_000);
}

// "Hoy", "Mañana", "Ayer" o "Vie 23 oct".
export function etiquetaDia(fecha: Date, ahora: Date): string {
  const dias = diferenciaDias(fecha, ahora);
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Mañana';
  if (dias === -1) return 'Ayer';
  return `${formatearDiaSemana(fecha)} ${formatearDiaMes(fecha)}`;
}

export function haceTiempo(fecha: Date, ahora: Date): string {
  const minutos = Math.max(0, Math.floor((ahora.getTime() - fecha.getTime()) / MINUTO));
  if (minutos < 1) return 'Hace un momento';
  if (minutos < 60) return `Hace ${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24 && mismoDia(fecha, ahora)) return horas === 1 ? 'Hace 1 hora' : `Hace ${horas} horas`;
  return diferenciaDias(fecha, ahora) === -1 ? 'Ayer' : formatearDiaMes(fecha);
}

export function minutosHasta(fecha: Date, ahora: Date): number {
  return Math.ceil((fecha.getTime() - ahora.getTime()) / MINUTO);
}

export function iniciales(nombre: string): string {
  return nombre.trim().split(/\s+/).slice(0, 2).map(parte => parte.charAt(0)).join('').toUpperCase();
}

export function formatearTamano(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function rutaGrupo(rol: RolGrupo, grupoId: string, pestana?: string): string {
  return `/app/${rol}/grupos/${grupoId}${pestana ? `/${pestana}` : ''}`;
}

export function textoCambioSesion(grupo: string, inicio: Date, ahora: Date): string {
  return `${grupo}: la sesión cambió a ${etiquetaDia(inicio, ahora).toLowerCase()}, ${formatearHora(inicio)}`;
}

export const ICONOS_NOTIFICACION: Record<TipoNotificacion, string> = { recordatorio: 'schedule', cambio_sesion: 'sync', cancelacion: 'block' };

export function unirLista(items: string[]): string {
  return items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

// "Lunes y miércoles · 18:00 a 20:00"
export function formatearHorario(horario: HorarioGrupo | null): string {
  if (!horario?.dias.length) return 'Por definir';
  const dias = DIAS_SEMANA.filter(dia => horario.dias.includes(dia.valor)).map((dia, i) => i ? dia.etiqueta.toLowerCase() : dia.etiqueta);
  return `${unirLista(dias)} · ${horario.inicio} a ${horario.fin}`;
}
