import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';

@Component({
  selector: 'app-preguntas-frecuentes',
  standalone: true,
  imports: [MatExpansionModule],
  templateUrl: './preguntas-frecuentes.html',
  styleUrl: './preguntas-frecuentes.css'
})
export class PreguntasFrecuentes {
  readonly preguntas = [
    {
      titulo: '¿Qué puedo hacer en Yachani?',
      respuesta:
        'Puedes encontrar grupos de estudio, compartir materiales, conversar con tus compañeros y repasar con flashcards.'
    },
    {
      titulo: '¿Quién puede ser tutor?',
      respuesta:
        'Los estudiantes que desean compartir sus conocimientos y acompañar a otros pueden registrarse como estudiantes tutores y organizar grupos de estudio.'
    },
    {
      titulo: '¿Cómo puedo unirme a un grupo de estudio?',
      respuesta:
        'Regístrate, busca un grupo por curso o tema y revisa sus detalles. Si tiene cupos disponibles, podrás unirte directamente o enviar una solicitud, según su configuración.'
    },
    {
  titulo: '¿Cómo funciona la recomendación con IA?',
  respuesta:
    'Yachani considera tus preferencias, temas de interés y método de estudio para recomendarte grupos que se adapten mejor a tu perfil.'
},
{
  titulo: '¿Qué formatos de archivo puedo subir?',
  respuesta:
    'Puedes compartir materiales y resúmenes en formatos permitidos por la plataforma, como PDF, DOCX, PNG y JPG.'
}
  ];
}