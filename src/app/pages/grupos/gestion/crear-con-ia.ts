import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-crear-con-ia',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './crear-con-ia.html',
  styleUrl: './crear-con-ia.css',
})
export class CrearConIa {
  // Pasos de Figma mediante ?paso=: describir (A05), mazos (A08), organizar (A09) y revision (A06).
  @Input() paso = 'describir';
  // Mismos métodos que la configuración inicial del tutor.
  readonly metodos = [
    'Visual',
    'Práctico',
    'Teórico',
    'Participativo',
    'Resolución de ejercicios',
    'Debate',
  ];
  readonly temas = ['Límites y continuidad', 'Reglas de derivación', 'Aplicaciones de la derivada'];
  readonly mazos = [
    {
      titulo: 'Límites laterales',
      detalle: 'Carlos Ríos · 12 tarjetas · Publicado',
      disponible: true,
    },
    {
      titulo: 'Fórmulas de derivadas',
      detalle: 'Carlos Ríos · 4 tarjetas · Publicado',
      disponible: true,
    },
    { titulo: 'Repaso de integrales', detalle: 'Carlos Ríos · Borrador sin tarjetas', disponible: false },
  ];
  // Paso 1 (creación): empieza vacío; el ejemplo de Figma va como placeholder.
  readonly descripcionForm = new FormGroup({
    descripcion: new FormControl('', { nonNullable: true, validators: Validators.required }),
    metodo: new FormControl('', { nonNullable: true, validators: Validators.required }),
    capacidad: new FormControl<number | null>(null, [Validators.required, Validators.min(2)]),
  });
  // A09 y A06 muestran la propuesta generada, por eso traen sus datos como una edición.
  readonly organizarForm = new FormGroup({
    limites: new FormControl('Límites y continuidad', {
      nonNullable: true,
      validators: Validators.required,
    }),
    derivadas: new FormControl('Reglas de derivación', {
      nonNullable: true,
      validators: Validators.required,
    }),
  });
  readonly propuestaForm = new FormGroup({
    nombre: new FormControl('Dominando Cálculo', {
      nonNullable: true,
      validators: Validators.required,
    }),
    descripcion: new FormControl(
      'Repasamos límites, derivadas y aplicaciones con ejercicios y mazos de práctica.',
      { nonNullable: true, validators: [Validators.required, Validators.maxLength(500)] },
    ),
    metodo: new FormControl('Resolución de ejercicios', {
      nonNullable: true,
      validators: Validators.required,
    }),
    capacidad: new FormControl<number | null>(12, [Validators.required, Validators.min(2)]),
    tema1: new FormControl('Límites y continuidad', {
      nonNullable: true,
      validators: Validators.required,
    }),
    tema2: new FormControl('Reglas de derivación', {
      nonNullable: true,
      validators: Validators.required,
    }),
    tema3: new FormControl('Aplicaciones de la derivada', {
      nonNullable: true,
      validators: Validators.required,
    }),
  });
}
