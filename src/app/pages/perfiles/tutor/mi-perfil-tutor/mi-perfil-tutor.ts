import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-mi-perfil-tutor',
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
    MatSelectModule,
    MatTabsModule,
  ],
  templateUrl: './mi-perfil-tutor.html',
  styleUrls: ['../../perfiles.css', './mi-perfil-tutor.css'],
})
export class MiPerfilTutor {
  readonly metodos = [
    'Visual',
    'Práctico',
    'Teórico',
    'Participativo',
    'Resolución de ejercicios',
    'Debate',
  ];
  readonly presentacionForm = new FormGroup({
    presentacion: new FormControl(
      'Me gusta explicar los conceptos de cálculo con ejemplos cotidianos y resolver dudas paso a paso.',
      { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] },
    ),
    metodo: new FormControl('Resolución de ejercicios', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  constructor(public readonly dialog: MatDialog) {}
}
