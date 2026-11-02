import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './notificaciones.html',
  styleUrl: './notificaciones.css',
})
export class Notificaciones {
  // Variante visual mediante ?rol=tutor. Recordatorio (N06) mediante ?vista=recordatorio
  // y estados de Figma mediante ?estado= (leida, vacio).
  @Input() rol = 'estudiante';
  @Input() vista = '';
  @Input() estado = '';
  // Datos de ejemplo de N01 (estudiante) y N02 (tutor).
  readonly notificaciones = {
    estudiante: [
      {
        titulo: 'Solicitud aceptada',
        texto: 'Tu solicitud a Dominando Cálculo fue aceptada.',
        fecha: '29 oct 2026 · 13:40',
        accion: 'Ver grupo',
        enlace: '/grupos/dominando-calculo',
        vista: null,
        leida: false,
      },
      {
        titulo: 'Solicitud rechazada',
        texto: 'Tu solicitud a Introducción a la IA fue rechazada.',
        fecha: '29 oct 2026 · 12:30',
        accion: 'Explorar',
        enlace: '/grupos/descubrimiento',
        vista: null,
        leida: false,
      },
      {
        titulo: 'Tu sesión empieza pronto',
        texto: 'Repaso de derivadas comienza a las 19:00.',
        fecha: '30 oct 2026 · 18:00',
        accion: 'Ver sesión',
        enlace: '/notificaciones',
        vista: 'recordatorio',
        leida: true,
      },
    ],
    tutor: [
      {
        titulo: 'Nueva solicitud de ingreso',
        texto: 'Irene Castro solicitó unirse a Dominando Cálculo.',
        fecha: '29 oct 2026 · 13:40',
        accion: 'Ver grupo',
        enlace: '/grupos/dominando-calculo/solicitudes',
        vista: null,
        leida: false,
      },
      {
        titulo: 'Nueva solicitud de ingreso',
        texto: 'Pedro Díaz solicitó unirse a Dominando Cálculo.',
        fecha: '29 oct 2026 · 13:30',
        accion: 'Ver grupo',
        enlace: '/grupos/dominando-calculo/solicitudes',
        vista: null,
        leida: false,
      },
    ],
  };
}
