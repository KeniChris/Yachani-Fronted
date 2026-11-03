import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-descubrimiento',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './descubrimiento.html',
  styleUrl: './descubrimiento.css',
})
export class Descubrimiento {
  // Estado de la pantalla: explorar (D01), filtrados (D03), vacio (D04) o error (D09).
  @Input() estado = 'explorar';
  readonly metodos = ['Resolución de ejercicios', 'Práctico'];
  readonly tipos = ['Con tutor', 'Entre estudiantes'];
  readonly grupos = [
    {
      id: 'dominando-calculo',
      nombre: 'Dominando Cálculo',
      descripcion: 'Repasemos límites, derivadas y aplicaciones con ejercicios.',
      tipo: 'Con tutor',
      responsable: 'Carlos Ríos',
      metodo: 'Resolución de ejercicios',
      integrantes: '8 de 12 integrantes',
    },
    {
      id: 'introduccion-ia',
      nombre: 'Introducción a la inteligencia artificial',
      descripcion: 'Repasamos conceptos y resolvemos prácticas paso a paso.',
      tipo: 'Entre estudiantes',
      responsable: 'Lucía Paredes',
      metodo: 'Práctico',
      integrantes: '5 de 8 integrantes',
    },
    {
      id: 'ingenieria-software',
      nombre: 'Ingeniería de Software: repasos',
      descripcion: 'Casos de uso, modelos y preparación para el examen.',
      tipo: 'Entre estudiantes',
      responsable: 'Leicy Cahuana',
      metodo: 'Resolución de ejercicios',
      integrantes: '4 de 8 integrantes',
    },
    {
      id: 'modelos-entrenamiento',
      nombre: 'Modelos de entrenamiento',
      descripcion: 'Compartimos apuntes y ejercicios sobre modelos de IA.',
      tipo: 'Con tutor',
      responsable: 'Carlos Ríos',
      metodo: 'Práctico',
      integrantes: '6 de 10 integrantes',
    },
  ];
  readonly filtrados = [this.grupos[0]];
  readonly buscarForm = new FormGroup({
    busqueda: new FormControl('', { nonNullable: true }),
  });
  readonly filtrosForm = new FormGroup({
    curso: new FormControl('Cálculo', { nonNullable: true }),
    metodo: new FormControl('Resolución de ejercicios', { nonNullable: true }),
    tipo: new FormControl('Con tutor', { nonNullable: true }),
    integrantes: new FormControl('8', { nonNullable: true }),
  });
  constructor(public readonly dialog: MatDialog) {}
}
