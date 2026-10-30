import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-benefits',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './benefits.html',
  styleUrl: './benefits.css'
})
export class Benefits {
  readonly benefits = [
    {
      icon: 'groups',
      title: 'Encuentra grupos',
      description:
        'Encuentra compañeros por curso o tema y filtra según tu método de estudio y la cantidad de integrantes.'
    },
    {
      icon: 'description',
      title: 'Comparte materiales',
      description:
        'Reúne apuntes, resúmenes y ejercicios en un espacio organizado para todo el grupo.'
    },
    {
      icon: 'chat',
      title: 'Chat grupal',
      description:
        'Coordina sesiones, comparte ideas y resuelve dudas con los integrantes de tu grupo.'
    },
    {
      icon: 'style',
      title: 'Flashcards',
      description:
        'Crea tarjetas de repaso y practica los conceptos de tus cursos antes de cada examen.'
    }
  ];
}