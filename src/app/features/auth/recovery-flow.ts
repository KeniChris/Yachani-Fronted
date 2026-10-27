import { Injectable, signal } from '@angular/core';

export type EstadoRecuperacion = 'formulario' | 'cargando' | 'error' | 'exito';

@Injectable({ providedIn: 'root' })
export class RecoveryFlow {
  // Activar solo para recorrer las vistas localmente, sin operaciones reales.
  readonly modoPrevisualizacion = false;
  // Se conserva exclusivamente en memoria; nunca se persiste en URL o storage.
  readonly correo = signal('');
  envioConfirmado = false;
  codigoVerificado = false;

  reiniciar(): void {
    this.correo.set('');
    this.envioConfirmado = false;
    this.codigoVerificado = false;
  }
}
