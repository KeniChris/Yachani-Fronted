import { Component, DestroyRef, afterNextRender, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppLayout } from '../../../../layouts/app-layout/app-layout';
import { DatosInicioEstudiante, FlashcardsInicio } from './inicio-estudiante.models';
import { crearDatosDemostracion, USUARIO_DEMOSTRACION } from './inicio-estudiante.demo';

@Component({
  imports: [NgTemplateOutlet, RouterLink, MatButtonModule, MatIconModule, MatProgressBarModule],
  selector: 'app-inicio-estudiante',
  styleUrl: './inicio-estudiante.css',
  templateUrl: './inicio-estudiante.html',
})
export class InicioEstudiante {
  private readonly layout = inject(AppLayout);
  // Activar únicamente para revisar el diseño con los datos del archivo .demo.ts.
  readonly modoPrevisualizacion = false;
  // Pendiente: reemplazar cada sección de forma independiente con el backend.
  datos: DatosInicioEstudiante = this.modoPrevisualizacion ? crearDatosDemostracion() : {
    sesion: { estado: 'vacio', datos: null },
    grupos: { estado: 'vacio', datos: [] },
    recomendaciones: { estado: 'vacio', datos: [] },
    avisos: { estado: 'vacio', datos: [] },
    flashcards: { estado: 'vacio', datos: [] },
  };

  constructor() {
    // La previsualización no sobrescribe el nombre ni el rol de autenticación.
    if (this.modoPrevisualizacion) {
      afterNextRender(() => this.layout.nombrePrevisualizacion.set(USUARIO_DEMOSTRACION.nombre));
      inject(DestroyRef).onDestroy(() => this.layout.nombrePrevisualizacion.set(''));
    }
  }

  get saludo(): string {
    const nombre = (this.layout.userName || (this.modoPrevisualizacion ? USUARIO_DEMOSTRACION.nombre : '')).trim();
    return nombre ? `Hola, ${nombre.split(/\s+/)[0]}` : 'Hola';
  }

  porcentaje(item: FlashcardsInicio): number | null {
    if (item.completadas === null || item.total === null || item.total <= 0 ||
        item.completadas < 0 || item.completadas > item.total) return null;
    return Math.round(item.completadas / item.total * 100);
  }
}
