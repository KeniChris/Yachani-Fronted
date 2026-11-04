import { DestroyRef, inject, signal } from '@angular/core';

// Avisos de confirmación que se van solos: "Grupo creado", "Mensaje enviado", etc.
// Se muestran 3 segundos y los últimos 400 ms se desvanecen. Los mensajes de error
// NO usan esto: siguen visibles hasta que la usuaria vuelve a intentar la acción.
export const DURACION_AVISO_MS = 3000;
const DURACION_DESVANECIDO_MS = 400;

export class AvisoTemporal {
  // App zoneless: el estado que cambia desde un setTimeout tiene que ser signal(),
  // si no la vista no se refresca cuando el aviso se oculta.
  private readonly claveSignal = signal('');
  private readonly desvaneciendoSignal = signal(false);
  private temporizadores: ReturnType<typeof setTimeout>[] = [];

  // Qué aviso mostrar ('' = ninguno). La clave distingue variantes del mismo hueco,
  // por ejemplo 'programada' | 'actualizada' | 'cancelada' en sesiones.
  readonly clave = this.claveSignal.asReadonly();
  readonly desvaneciendo = this.desvaneciendoSignal.asReadonly();

  // Repetir la acción reinicia la cuenta, así el segundo aviso también dura 3 s.
  mostrar(clave = 'si') {
    this.limpiar();
    this.claveSignal.set(clave);
    this.desvaneciendoSignal.set(false);
    this.temporizadores.push(
      setTimeout(
        () => this.desvaneciendoSignal.set(true),
        DURACION_AVISO_MS - DURACION_DESVANECIDO_MS,
      ),
      setTimeout(() => this.ocultar(), DURACION_AVISO_MS),
    );
  }

  ocultar() {
    this.limpiar();
    this.claveSignal.set('');
    this.desvaneciendoSignal.set(false);
  }

  private limpiar() {
    this.temporizadores.forEach((t) => clearTimeout(t));
    this.temporizadores = [];
  }
}

// Se llama al inicializar el campo del componente: así engancha su DestroyRef y no
// quedan temporizadores vivos si se sale de la pantalla antes de los 3 segundos.
export function crearAvisoTemporal(): AvisoTemporal {
  const aviso = new AvisoTemporal();
  inject(DestroyRef).onDestroy(() => aviso.ocultar());
  return aviso;
}
