import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-mis-grupos',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './mis-grupos.html',
  styleUrl: './mis-grupos.css',
})
export class MisGrupos {
  // Variante visual mediante ?rol=tutor y estados de Figma mediante ?estado=vacio.
  @Input() rol = 'estudiante';
  @Input() estado = '';
  // Datos de ejemplo de los frames G01 y G02.
  readonly grupos = {
    estudiante: [
      {
        id: 'dominando-calculo',
        nombre: 'Dominando Cálculo',
        descripcion: 'Repasemos límites, derivadas y aplicaciones con ejercicios.',
        responsable: 'Con tutor · Carlos Ríos',
        detalle: 'Resolución de ejercicios · 8 de 12 integrantes',
      },
      {
        id: 'ingenieria-software',
        nombre: 'Ingeniería de Software: repasos',
        descripcion: 'Modelos, casos de uso y ejercicios para preparar el examen.',
        responsable: 'Entre estudiantes · Leicy Cahuana',
        detalle: 'Resolución de ejercicios · 4 de 8 integrantes',
      },
    ],
    tutor: [
      {
        id: 'dominando-calculo',
        nombre: 'Dominando Cálculo',
        descripcion: 'Repasemos límites, derivadas y aplicaciones con ejercicios.',
        responsable: 'Con tutor · Carlos Ríos',
        detalle: 'Resolución de ejercicios · 8 de 12 integrantes',
      },
      {
        id: 'ingenieria-software',
        nombre: 'Ingeniería de Software: repasos',
        descripcion: 'Modelos, casos de uso y ejercicios para preparar el examen.',
        responsable: 'Con tutor · Carlos Ríos',
        detalle: 'Resolución de ejercicios · 4 de 8 integrantes',
      },
    ],
  };
  // Grupo recién creado de G07 (tutor) y G16 (estudiante) para ?estado=creado.
  readonly grupoCreado = {
    estudiante: {
      id: 'ingenieria-software',
      nombre: 'Ingeniería de Software: repasos',
      descripcion: 'Repasamos modelos, casos de uso y ejercicios de Ingeniería de Software.',
      responsable: 'Entre estudiantes · Leicy Cahuana',
      detalle: 'Resolución de ejercicios · 0 de 12 integrantes',
    },
    tutor: {
      id: 'dominando-calculo',
      nombre: 'Dominando Cálculo',
      descripcion: 'Repasemos límites, derivadas y aplicaciones con ejercicios.',
      responsable: 'Con tutor · Carlos Ríos',
      detalle: 'Resolución de ejercicios · 0 de 12 integrantes',
    },
  };
  readonly solicitudes = [
    {
      grupo: 'Introducción a la inteligencia artificial',
      fecha: 'Solicitud enviada el 29 oct 2026',
      estado: 'Pendiente',
    },
  ];
}
