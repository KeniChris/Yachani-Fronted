import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './chat.html',
  styleUrls: ['../grupos.css', './chat.css'],
})
export class Chat {
  // Variante visual mediante ?rol=tutor (CH08) y conversación vacía mediante ?chat=vacio (CH02).
  // Estados adicionales mediante ?chat=: enviado (CH12/CH13), eliminado (CH05/CH10),
  // plazo (CH06/CH11) y error (CH07).
  @Input() rol = 'estudiante';
  @Input() chat = '';
  readonly mensajes = [
    {
      id: 1,
      autor: { estudiante: 'Carlos Ríos', tutor: 'Leicy Cahuana' },
      texto: 'Hola, ¿repasamos la regla de la cadena mañana?',
      hora: '13:44',
      propio: false,
    },
    {
      id: 2,
      autor: { estudiante: 'Tú', tutor: 'Tú' },
      texto: '¡Gracias! Revisaré el material antes de la sesión.',
      hora: '13:45',
      propio: true,
    },
    {
      id: 3,
      autor: { estudiante: 'Lucía Paredes', tutor: 'Lucía Paredes' },
      texto: 'Sí, la guía de derivadas ya está en los materiales del grupo.',
      hora: '13:46',
      propio: false,
    },
  ];
  // El mensaje empieza vacío con el placeholder de Figma (CH12).
  readonly form = new FormGroup({
    mensaje: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(1000)],
    }),
  });
  constructor(public readonly dialog: MatDialog) {}
}
