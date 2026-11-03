import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
  ],
  templateUrl: './mi-perfil.html',
  styleUrls: ['../../perfiles.css', './mi-perfil.css'],
})
export class MiPerfil {
  readonly academicoForm = new FormGroup({
    universidad: new FormControl('Universidad Peruana de Ciencias Aplicadas', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    carrera: new FormControl('Ingeniería de Software', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  readonly metodos = [
    'Visual',
    'Práctico',
    'Teórico',
    'Participativo',
    'Resolución de ejercicios',
    'Debate',
  ];
  readonly modalidades = ['Virtual', 'Presencial', 'Híbrida'];
  readonly preferenciasForm = new FormGroup({
    metodo: new FormControl('Resolución de ejercicios', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    modalidad: new FormControl('Virtual', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    temas: new FormControl('Cálculo, Ingeniería de Software, Inteligencia artificial', {
      nonNullable: true,
    }),
  });
  readonly niveles = ['Básico', 'Intermedio', 'Avanzado'];
  readonly agregarCursoForm = new FormGroup({
    curso: new FormControl('Inteligencia artificial', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    nivel: new FormControl('Básico', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly editarCursoForm = new FormGroup({
    curso: new FormControl('Cálculo I', { nonNullable: true, validators: [Validators.required] }),
    nivel: new FormControl('Intermedio', { nonNullable: true, validators: [Validators.required] }),
  });
  @Input() resumenes = 'lista';
  @Input() archivoResumen = 'valido';
  readonly misResumenes = [
    {
      titulo: 'Guía de límites',
      archivo: 'Guía de límites.pdf',
      detalle: 'PDF · 680 KB · 29 oct 2026',
    },
    {
      titulo: 'Repaso de ingeniería de software',
      archivo: 'Repaso de ingeniería de software.pdf',
      detalle: 'PDF · 680 KB · 29 oct 2026',
    },
  ];
  readonly resumenForm = new FormGroup({
    titulo: new FormControl('Guía de límites', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    archivo: new FormControl(''),
  });
  constructor(public readonly dialog: MatDialog) {}
}
