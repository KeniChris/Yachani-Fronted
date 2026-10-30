import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-publico-objetivo',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './publico-objetivo.html',
  styleUrl: './publico-objetivo.css'
})
export class PublicoObjetivo {
  readonly publicos = [
    {
      icono: 'groups',
      titulo: 'Estudiantes de pregrado',
      descripcion:
        'Que buscan compañeros de su mismo curso para repasar diversos temas.'
    },
    {
      icono: 'style',
      titulo: 'Estudiantes que repasan',
      descripcion:
        'Que quieren organizar materiales y flashcards en un solo lugar.'
    },
    {
      icono: 'chat',
      titulo: 'Tutores y alumnos destacados',
      descripcion:
        'Que desean guiar grupos, compartir conocimientos y resolver dudas.'
    }
  ];

  readonly testimonios = [
  {
    nombre: 'Nombre Apellido',
    iniciales: 'NA',
    detalle: 'Estudiante · Ing. de Sistemas, UPC',
    comentario:
      'Antes coordinábamos todo por WhatsApp y se perdían los archivos. Con Yachani encontré un grupo de Cálculo y aprobé con 16.'
  },
  {
    nombre: 'Nombre Apellido',
    iniciales: 'NA',
    detalle: 'Estudiante · Ing. de Software, UPC',
    comentario:
      'Las flashcards del grupo me salvaron en los parciales. Repasamos juntos todas las noches antes del examen.'
  },
  {
    nombre: 'Nombre Apellido',
    iniciales: 'NA',
    detalle: 'Tutora · Física I, UPC',
    comentario:
      'Como tutora puedo organizar mis sesiones, compartir guías y ver cómo avanza cada estudiante.'
  }
];
}