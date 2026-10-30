import { Component } from '@angular/core';
import { rutaFlashcardsGrupo } from '../../flashcards-grupo.routes';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-mazos-grupo',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressBarModule,
    MatChipsModule,
  ],
  templateUrl: './mazos-grupo.html',
  styleUrls: ['../../../recursos/recursos.css', '../../flashcards.css', './mazos-grupo.css'],
})
export class MazosGrupo {
  readonly flashcardsGrupo = rutaFlashcardsGrupo();
  readonly filtros = new FormGroup({ idTema: new FormControl('todos', { nonNullable: true }) });
  readonly mazos = [
    {
      idMazo: 1,
      titulo: 'Fórmulas de derivadas',
      descripcion: 'Reglas y ejemplos para tu próximo repaso.',
      autorTema: 'Leicy Cahuana · Reglas de derivación',
      cantidad: '4 tarjetas',
      progreso: '3 de 4 revisadas · 75 %',
      porcentaje: 75,
      disponible: true,
    },
    {
      idMazo: 2,
      titulo: 'Límites laterales',
      descripcion: 'Repasa propiedades y límites de funciones.',
      autorTema: 'Lucía Paredes · Límites y continuidad',
      cantidad: '12 tarjetas',
      progreso: '8 de 12 revisadas · 67 %',
      porcentaje: 67,
      disponible: false,
    },
  ];
}
