import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-crear-grupo',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './crear-grupo.html',
  styleUrl: './crear-grupo.css',
})
export class CrearGrupo {
  esTutor = false;
  // Variante visual mediante ?rol=tutor con los ejemplos de G04 (tutor) y G05 (estudiante).
  @Input() set rol(valor: string) {
    this.esTutor = valor === 'tutor';
    this.form.controls.nombre.setValue(
      this.esTutor ? 'Dominando Cálculo' : 'Ingeniería de Software: repasos',
    );
  }
  // Mismos métodos que la configuración inicial del tutor.
  readonly metodos = [
    'Visual',
    'Práctico',
    'Teórico',
    'Participativo',
    'Resolución de ejercicios',
    'Debate',
  ];
  readonly form = new FormGroup({
    nombre: new FormControl('Ingeniería de Software: repasos', {
      nonNullable: true,
      validators: Validators.required,
    }),
    descripcion: new FormControl(
      'Un espacio para repasar conceptos, compartir recursos y resolver ejercicios.',
      { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] },
    ),
    metodo: new FormControl('Resolución de ejercicios', {
      nonNullable: true,
      validators: Validators.required,
    }),
    capacidad: new FormControl<number | null>(12, [Validators.required, Validators.min(2)]),
  });
}
