import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './how-it-works.html',
  styleUrl: './how-it-works.css'
})
export class HowItWorks {
  readonly steps = [
    {
      number: 1,
      icon: 'person_add',
      title: 'Regístrate',
      description:
        'Crea tu cuenta y completa tu perfil con tus cursos y preferencias de estudio.'
    },
    {
      number: 2,
      icon: 'search',
      title: 'Busca un grupo',
      description:
        'Explora grupos por curso o tema y encuentra una forma de estudiar compatible contigo.'
    },
    {
      number: 3,
      icon: 'check',
      title: 'Únete y aprende',
      description:
        'Únete directamente o envía una solicitud, según el grupo. Comparte materiales y aprende en equipo.'
    }
  ];

  readonly audiences = [
    {
      title: 'Para estudiantes',
      items: [
        'Encuentra compañeros de tu mismo curso.',
        'Accede a materiales y flashcards del grupo.',
        'Resuelve dudas en el chat antes del examen.'
      ]
    },
    {
      title: 'Para tutores',
      items: [
        'Crea grupos y define sus cupos y método de estudio.',
        'Comparte guías y ejercicios con tu grupo.',
        'Organiza sesiones y acompaña a otros estudiantes.'
      ]
    }
  ];
}