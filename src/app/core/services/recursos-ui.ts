import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl } from '@angular/forms';
export const textoRequerido = (c: AbstractControl) =>
  typeof c.value === 'string' && c.value.trim() ? null : { required: true };
export function idPositivo(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}
export function errorApi(error: unknown): string {
  if (!(error instanceof HttpErrorResponse))
    return 'No se pudo completar la operación. Inténtalo nuevamente.';
  if (error.status === 0)
    return 'No pudimos conectar con el servidor. Comprueba tu conexión e inténtalo nuevamente.';
  if (error.status === 401)
    return 'Tu sesión no está disponible o venció. Inicia sesión para continuar.';
  if (error.status === 403) return 'No tienes permiso para realizar esta acción en el grupo.';
  if (error.status === 404) return 'El contenido ya no está disponible o no tienes acceso a él.';
  if (error.status >= 500)
    return 'El servidor no pudo completar la operación. Inténtalo nuevamente.';
  return typeof error.error?.mensaje === 'string'
    ? error.error.mensaje
    : 'Revisa los datos e inténtalo nuevamente.';
}
export function tamanoArchivo(bytes: number): string {
  return bytes >= 1048576
    ? `${(bytes / 1048576).toLocaleString('es-PE', { maximumFractionDigits: 1 })} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}
export function iconoArchivo(nombre: string): string {
  return /\.pdf$/i.test(nombre)
    ? 'picture_as_pdf'
    : /\.(png|jpe?g)$/i.test(nombre)
      ? 'image'
      : 'description';
}
export function validarArchivos(archivos: readonly File[]): string | null {
  if (!archivos.length) return 'Selecciona al menos un archivo.';
  if (archivos.length > 5) return 'Puedes compartir hasta 5 archivos por envío.';
  for (const a of archivos) {
    if (!/\.(pdf|docx|pptx|xlsx|png|jpe?g)$/i.test(a.name))
      return `El formato de ${a.name} no está permitido.`;
    if (!a.size) return `${a.name} está vacío.`;
    if (a.size > 10 * 1048576) return `${a.name} supera el máximo de 10 MB.`;
  }
  return null;
}
