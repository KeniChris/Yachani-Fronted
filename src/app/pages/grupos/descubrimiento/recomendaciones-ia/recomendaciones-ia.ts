import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-recomendaciones-ia',
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
  templateUrl: './recomendaciones-ia.html',
  styleUrl: './recomendaciones-ia.css',
})
export class RecomendacionesIa {
  // Estado de la pantalla: formulario (A01), buscando (A02), resultados (A03),
  // vacio (A04) o error (A07).
  @Input() estado = 'formulario';
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
      id: 'calculo-resolvemos-juntos',
      nombre: 'Cálculo: resolvemos juntos',
      descripcion: 'Ejercicios de derivadas para practicar paso a paso.',
      tipo: 'Entre estudiantes',
      responsable: 'Lucía Paredes',
      metodo: 'Resolución de ejercicios',
      integrantes: '4 de 8 integrantes',
    },
  ];
  readonly form = new FormGroup({
    curso: new FormControl('Cálculo I', { nonNullable: true, validators: Validators.required }),
    metodo: new FormControl('Resolución de ejercicios', { nonNullable: true }),
    tipo: new FormControl('Con tutor', { nonNullable: true }),
  });
}
