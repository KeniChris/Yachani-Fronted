import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CompartirMazo } from '../compartir-mazo/compartir-mazo';

@Component({
  selector: 'app-tarjetas',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './tarjetas.html',
  styleUrls: ['../flashcards.css', './tarjetas.css'],
})
export class Tarjetas {
  @Input() mazoId = 'formulas';
  @Input() editor = '';
  @Input() rol = 'estudiante';
  @Input() contexto = 'tutor';
  readonly compartirMazo = CompartirMazo;
  readonly mazos = {
    formulas: {
      titulo: 'Fórmulas de derivadas',
      descripcion: 'Reglas y ejemplos para preparar tu próximo repaso.',
    },
    limites: {
      titulo: 'Límites laterales',
      descripcion: 'Repasa propiedades y límites de funciones.',
    },
    integrales: {
      titulo: 'Repaso de integrales',
      descripcion: 'Un borrador personal que puedes seguir completando.',
    },
    uml: { titulo: 'Conceptos de UML', descripcion: 'Reglas y ejemplos para tu próximo repaso.' },
  };
  readonly tarjetas = [
    { numero: 1, pregunta: '¿Cuál es la derivada de x²?', respuesta: '2x' },
    { numero: 2, pregunta: '¿Cómo se deriva xⁿ?', respuesta: 'n · xⁿ⁻¹' },
    { numero: 3, pregunta: '¿Cuál es la derivada de sen(x)?', respuesta: 'cos(x)' },
    {
      numero: 4,
      pregunta: '¿Cómo se aplica la regla de la cadena?',
      respuesta: "(f ∘ g)'(x) = f'(g(x)) · g'(x)",
    },
  ];
  readonly form = new FormGroup({
    tarjeta: new FormControl<number | null>(null),
    pregunta: new FormControl('¿Cuál es la derivada de x²?', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(1000)],
    }),
    respuesta: new FormControl('2x', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(1000)],
    }),
  });
  constructor(public readonly dialog: MatDialog) {}
}
