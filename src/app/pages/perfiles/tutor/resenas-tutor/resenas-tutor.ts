import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-resenas-tutor',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './resenas-tutor.html',
  styleUrls: ['../../perfiles.css', './resenas-tutor.css'],
})
export class ResenasTutor {
  @Input() estado = 'lista';
  readonly estrellas = [1, 2, 3, 4, 5];
  readonly resenas = [
    {
      iniciales: 'LP',
      autor: 'Lucía Paredes',
      fecha: '28 oct 2026',
      comentario: 'Explica con claridad y propone ejercicios que ayudan a comprender.',
    },
    {
      iniciales: 'MS',
      autor: 'María Salas',
      fecha: '28 oct 2026',
      comentario:
        'Las explicaciones y los ejemplos me ayudaron a practicar con más confianza.',
    },
  ];
  readonly resenaForm = new FormGroup({
    calificacion: new FormControl(5, { nonNullable: true, validators: [Validators.required] }),
    comentario: new FormControl('Explica con claridad y resuelve mis dudas.', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });
  constructor(public readonly dialog: MatDialog) {}
}
