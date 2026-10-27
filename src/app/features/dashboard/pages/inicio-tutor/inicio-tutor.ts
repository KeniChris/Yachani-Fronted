import { Component, DestroyRef, afterNextRender, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppLayout } from '../../../../layouts/app-layout/app-layout';
import { crearInicioTutorVacio, DatosInicioTutor } from './inicio-tutor.models';
import { crearDatosTutorDemostracion, USUARIO_TUTOR_DEMOSTRACION } from './inicio-tutor.demo';

@Component({
  imports: [NgTemplateOutlet, MatButtonModule, MatIconModule, MatProgressBarModule],
  selector: 'app-inicio-tutor',
  styleUrls: ['../inicio-estudiante/inicio-estudiante.css', './inicio-tutor.css'],
  templateUrl: './inicio-tutor.html',
})
export class InicioTutor {
  private readonly layout = inject(AppLayout);
  // Activar solo para revisar datos del archivo .demo.ts, sin operaciones reales.
  readonly modoPrevisualizacion = false;
  datos: DatosInicioTutor = this.modoPrevisualizacion ? crearDatosTutorDemostracion() : crearInicioTutorVacio();
  mensajeSolicitudes = '';
  solicitudPendiente: { id: string; accion: 'aceptar' | 'rechazar' } | null = null;

  constructor() {
    if (this.modoPrevisualizacion) {
      afterNextRender(() => this.layout.nombrePrevisualizacion.set(USUARIO_TUTOR_DEMOSTRACION.nombre));
      inject(DestroyRef).onDestroy(() => this.layout.nombrePrevisualizacion.set(''));
    }
  }

  get saludo(): string {
    const nombre = (this.layout.userName || (this.modoPrevisualizacion ? USUARIO_TUTOR_DEMOSTRACION.nombre : '')).trim();
    return nombre ? `Hola, ${nombre.split(/\s+/)[0]}` : 'Hola';
  }

  iniciales(nombre: string): string {
    return nombre.trim().split(/\s+/).slice(0, 2).map(parte => parte.charAt(0)).join('').toUpperCase();
  }

  prepararRespuesta(id: string, accion: 'aceptar' | 'rechazar'): void {
    if (!this.datos.solicitudes.datos.some(solicitud => solicitud.id === id)) return;
    // Pendiente: enviar esta intención al backend con la sesión autenticada.
    // No modificar la lista ni las estadísticas hasta recibir confirmación real.
    this.solicitudPendiente = { id, accion };
    this.mensajeSolicitudes = 'Aceptar y rechazar solicitudes aún no está disponible. No se procesó ninguna solicitud.';
  }
}
