import { Component, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-compartir-mazo',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatStepperModule,
    MatProgressBarModule,
  ],
  templateUrl: './compartir-mazo.html',
  styleUrls: ['../flashcards.css', './compartir-mazo.css'],
})
export class CompartirMazo {
  readonly form = new FormGroup({
    grupo: new FormControl('demo', { nonNullable: true, validators: Validators.required }),
    tema: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
  readonly temas = ['Límites y continuidad', 'Reglas de derivación', 'Aplicaciones de la derivada'];
  readonly temasEstudiantes = ['Casos de uso', 'Diagramas UML', 'Pruebas de software'];
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public readonly data: { elegir?: boolean; contexto?: string; rol?: string; titulo?: string },
  ) {}
}
