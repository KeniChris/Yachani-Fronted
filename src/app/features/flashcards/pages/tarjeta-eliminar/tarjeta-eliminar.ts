import { Component } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-tarjeta-eliminar',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './tarjeta-eliminar.html',
  styleUrls: ['../../../recursos/recursos.css', '../../flashcards.css', './tarjeta-eliminar.css'],
})
export class TarjetaEliminar {
  readonly tarjetas = {
    '1': { pregunta: '¿Cuál es la derivada de x²?', respuesta: '2x' },
    '2': { pregunta: '¿Cómo se deriva xⁿ?', respuesta: 'n · xⁿ⁻¹' },
    '3': { pregunta: '¿Cuál es la derivada de sen(x)?', respuesta: 'cos(x)' },
    '4': {
      pregunta: '¿Cómo se aplica la regla de la cadena?',
      respuesta: "(f ∘ g)'(x) = f'(g(x)) · g'(x)",
    },
  };
  readonly tarjeta;
  constructor(route: ActivatedRoute) {
    this.tarjeta = this.tarjetas[route.snapshot.params['idTarjeta'] as keyof typeof this.tarjetas];
  }
}
