import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-temas',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './temas.html',
  styleUrls: ['../../recursos.css', './temas.css'],
})
export class Temas {
  readonly temas = [
    {
      idTema: 1,
      nombre: 'Límites y continuidad',
      descripcion: 'Propiedades de los límites y continuidad de funciones.',
      editar: '/app/grupos/1/temas/1/editar',
      materiales: '/app/grupos/1/temas/1/materiales',
    },
    {
      idTema: 2,
      nombre: 'Reglas de derivación',
      descripcion: 'Regla de la potencia, del producto y de la cadena.',
      editar: '/app/grupos/1/temas/2/editar',
      materiales: '/app/grupos/1/temas/2/materiales',
    },
    {
      idTema: 3,
      nombre: 'Aplicaciones de la derivada',
      descripcion: 'Optimización, máximos y mínimos con ejercicios.',
      editar: '/app/grupos/1/temas/3/editar',
      materiales: '/app/grupos/1/temas/3/materiales',
    },
  ];
}
