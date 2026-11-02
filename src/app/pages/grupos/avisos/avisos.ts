import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-avisos',
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
  templateUrl: './avisos.html',
  styleUrl: './avisos.css',
})
export class Avisos {
  // Variante visual mediante ?rol=tutor y estados de Figma mediante ?estado= (vacio, publicado).
  @Input() rol = 'estudiante';
  @Input() estado = '';
  readonly form = new FormGroup({
    titulo: new FormControl('Material para la próxima sesión', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    mensaje: new FormControl('Revisen la guía de derivadas disponible en Temas y materiales.', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });
  constructor(public readonly dialog: MatDialog) {}
}
