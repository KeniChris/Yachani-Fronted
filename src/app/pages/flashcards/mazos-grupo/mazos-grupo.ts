import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialog } from '@angular/material/dialog';
import { CompartirMazo } from '../compartir-mazo/compartir-mazo';

@Component({
  selector: 'app-mazos-grupo',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressBarModule,
  ],
  templateUrl: './mazos-grupo.html',
  styleUrls: ['../flashcards.css', './mazos-grupo.css'],
})
export class MazosGrupo {
  @Input() rol = 'estudiante';
  @Input() contexto = 'tutor';
  @Input() publicaciones = 'todos';
  readonly compartirMazo = CompartirMazo;
  readonly form = new FormGroup({
    tema: new FormControl('Todos los temas', { nonNullable: true }),
  });
  readonly temas = ['Límites y continuidad', 'Reglas de derivación', 'Aplicaciones de la derivada'];
  readonly temasEstudiantes = ['Casos de uso', 'Diagramas UML', 'Pruebas de software'];
  readonly mazos = [
    {
      id: 'formulas',
      titulo: 'Fórmulas de derivadas',
      descripcion: 'Reglas y ejemplos para tu próximo repaso.',
      autor: 'Leicy Cahuana',
      tema: 'Reglas de derivación',
      tarjetas: 4,
      avance: '3 de 4 revisadas · 75 %',
      progreso: 75,
    },
    {
      id: 'limites',
      titulo: 'Límites laterales',
      descripcion: 'Repasa propiedades y límites de funciones.',
      autor: 'Lucía Paredes',
      tema: 'Límites y continuidad',
      tarjetas: 12,
      avance: '8 de 12 revisadas · 67 %',
      progreso: 67,
    },
  ];
  readonly mazosEstudiantes = [
    {
      id: 'uml',
      titulo: 'Conceptos de UML',
      descripcion: 'Reglas y ejemplos para tu próximo repaso.',
      autor: 'Leicy Cahuana',
      tema: 'Diagramas UML',
      tarjetas: 4,
      avance: '3 de 4 revisadas · 75 %',
      progreso: 75,
    },
    {
      id: 'casos-de-uso',
      titulo: 'Preguntas de casos de uso',
      descripcion: 'Repasa propiedades y límites de funciones.',
      autor: 'Lucía Paredes',
      tema: 'Casos de uso',
      tarjetas: 12,
      avance: '8 de 12 revisadas · 67 %',
      progreso: 67,
    },
  ];
  constructor(public readonly dialog: MatDialog) {}
}
