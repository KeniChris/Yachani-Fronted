import { Component } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-mis-mazos',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
  ],
  templateUrl: './mis-mazos.html',
  styleUrls: ['../../../recursos/recursos.css', '../../flashcards.css', './mis-mazos.css'],
})
export class MisMazos {
  readonly mazos = [
    {
      idMazo: 1,
      titulo: 'Fórmulas de derivadas',
      descripcion: 'Reglas y ejemplos para tu próximo repaso.',
      estado: 'Publicado',
      cantidad: '4 tarjetas',
      progreso: '3 de 4 revisadas · 75 %',
      porcentaje: 75,
      disponible: true,
    },
    {
      idMazo: 2,
      titulo: 'Límites laterales',
      descripcion: 'Repasa propiedades y límites de funciones.',
      estado: 'Publicado',
      cantidad: '12 tarjetas',
      progreso: '8 de 12 revisadas · 67 %',
      porcentaje: 67,
      disponible: false,
    },
    {
      idMazo: 3,
      titulo: 'Repaso de integrales',
      descripcion: 'Continúa agregando preguntas a tu borrador.',
      estado: 'Borrador',
      cantidad: '0 tarjetas',
      progreso: 'Todavía no hay tarjetas',
      porcentaje: 0,
      disponible: false,
    },
  ];
}
