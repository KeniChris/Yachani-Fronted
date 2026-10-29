import { Component } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-mazo-detalle',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
  ],
  templateUrl: './mazo-detalle.html',
  styleUrls: ['../../../recursos/recursos.css', '../../flashcards.css', './mazo-detalle.css'],
})
export class MazoDetalle {
  readonly tarjetas = [
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
}
