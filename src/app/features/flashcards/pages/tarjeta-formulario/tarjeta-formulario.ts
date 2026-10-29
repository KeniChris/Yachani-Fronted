import { Component } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-tarjeta-formulario',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './tarjeta-formulario.html',
  styleUrls: ['../../../recursos/recursos.css', '../../flashcards.css', './tarjeta-formulario.css'],
})
export class TarjetaFormulario {
  readonly listaTarjetas = [
    {
      idTarjeta: 1,
      etiqueta: 'Tarjeta 1',
      pregunta: '¿Cuál es la derivada de x²?',
      respuesta: '2x',
      editar: '/app/flashcards/1/tarjetas/1/editar',
      eliminar: '/app/flashcards/1/tarjetas/1/eliminar',
    },
    {
      idTarjeta: 2,
      etiqueta: 'Tarjeta 2',
      pregunta: '¿Cómo se deriva xⁿ?',
      respuesta: 'n · xⁿ⁻¹',
      editar: '/app/flashcards/1/tarjetas/2/editar',
      eliminar: '/app/flashcards/1/tarjetas/2/eliminar',
    },
    {
      idTarjeta: 3,
      etiqueta: 'Tarjeta 3',
      pregunta: '¿Cuál es la derivada de sen(x)?',
      respuesta: 'cos(x)',
      editar: '/app/flashcards/1/tarjetas/3/editar',
      eliminar: '/app/flashcards/1/tarjetas/3/eliminar',
    },
    {
      idTarjeta: 4,
      etiqueta: 'Tarjeta 4',
      pregunta: '¿Cómo se aplica la regla de la cadena?',
      respuesta: "(f ∘ g)'(x) = f'(g(x)) · g'(x)",
      editar: '/app/flashcards/1/tarjetas/4/editar',
      eliminar: '/app/flashcards/1/tarjetas/4/eliminar',
    },
  ];

  readonly tarjetas = {
    '1': { pregunta: '¿Cuál es la derivada de x²?', respuesta: '2x' },
    '2': { pregunta: '¿Cómo se deriva xⁿ?', respuesta: 'n · xⁿ⁻¹' },
    '3': { pregunta: '¿Cuál es la derivada de sen(x)?', respuesta: 'cos(x)' },
    '4': {
      pregunta: '¿Cómo se aplica la regla de la cadena?',
      respuesta: "(f ∘ g)'(x) = f'(g(x)) · g'(x)",
    },
  };
  readonly editando: boolean;
  readonly formulario;
  constructor(route: ActivatedRoute) {
    this.editando = route.snapshot.data['editando'] === true;
    const tarjeta = this.tarjetas[route.snapshot.params['idTarjeta'] as keyof typeof this.tarjetas];
    this.formulario = new FormGroup({
      pregunta: new FormControl(this.editando ? (tarjeta?.pregunta ?? '') : '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(1000)],
      }),
      respuesta: new FormControl(this.editando ? (tarjeta?.respuesta ?? '') : '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(1000)],
      }),
    });
  }
}
