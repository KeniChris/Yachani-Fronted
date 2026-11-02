import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-mis-mazos',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatProgressBarModule],
  templateUrl: './mis-mazos.html',
  styleUrls: ['../flashcards.css', './mis-mazos.css'],
})
export class MisMazos {
  @Input() rol = 'estudiante';
  readonly mazos = [
    {
      id: 'formulas',
      titulo: 'Fórmulas de derivadas',
      descripcion: 'Reglas y ejemplos para tu próximo repaso.',
      tarjetas: 4,
      avance: '3 de 4 revisadas · 75 %',
      progreso: 75,
      estado: 'Publicado',
    },
    {
      id: 'limites',
      titulo: 'Límites laterales',
      descripcion: 'Repasa propiedades y límites de funciones.',
      tarjetas: 12,
      avance: '8 de 12 revisadas · 67 %',
      progreso: 67,
      estado: 'Publicado',
    },
    {
      id: 'integrales',
      titulo: 'Repaso de integrales',
      descripcion: 'Continúa agregando preguntas a tu borrador.',
      tarjetas: 0,
      avance: 'Todavía no hay tarjetas',
      progreso: 0,
      estado: 'Borrador',
    },
  ];
}
