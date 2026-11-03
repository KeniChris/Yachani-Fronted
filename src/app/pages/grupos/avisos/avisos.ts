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
  styleUrls: ['../grupos.css', './avisos.css'],
})
export class Avisos {
  // Variante visual mediante ?rol=tutor y estados de Figma mediante ?avisos= (vacio, publicado).
  @Input() rol = 'estudiante';
  @Input() avisos = '';
  // Publicar (AV03) empieza vacío; editar (AV04) carga el aviso actual al abrir el diálogo.
  readonly form = new FormGroup({
    titulo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    mensaje: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });
  constructor(public readonly dialog: MatDialog) {}
}
