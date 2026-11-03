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
  styleUrls: ['../grupos.css', './crear-grupo.css'],
})
export class CrearGrupo {
  esTutor = false;
  // Variante visual mediante ?rol=tutor: G04 (tutor) y G05 (estudiante).
  @Input() set rol(valor: string) {
    this.esTutor = valor === 'tutor';
  }
  // Límite de grupos alcanzado (G08 tutor, G14 estudiante) mediante ?crear=limite.
  @Input() crear = '';
  // Mismos métodos que la configuración inicial del tutor.
  readonly metodos = [
    'Visual',
    'Práctico',
    'Teórico',
    'Participativo',
    'Resolución de ejercicios',
    'Debate',
  ];
  // Formulario de creación: empieza vacío y los ejemplos de Figma van como placeholder.
  readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: Validators.required }),
    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
    metodo: new FormControl('', { nonNullable: true, validators: Validators.required }),
    capacidad: new FormControl<number | null>(null, [Validators.required, Validators.min(2)]),
  });
}
