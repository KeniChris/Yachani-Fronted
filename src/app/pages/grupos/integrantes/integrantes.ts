import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-integrantes',
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
  templateUrl: './integrantes.html',
  styleUrl: './integrantes.css',
})
export class Integrantes {
  // Variante visual mediante ?rol=tutor y capacidad guardada (G11) mediante ?integrantes=capacidad.
  @Input() rol = 'estudiante';
  @Input() integrantes = '';
  // Datos de ejemplo de G12 y G13; los tres últimos completan los 8 integrantes del frame.
  readonly estudiantes = [
    { iniciales: 'LC', nombre: 'Leicy Cahuana' },
    { iniciales: 'LP', nombre: 'Lucía Paredes' },
    { iniciales: 'MS', nombre: 'María Salas' },
    { iniciales: 'DT', nombre: 'Diego Torres' },
    { iniciales: 'AL', nombre: 'Andrea León' },
    { iniciales: 'JQ', nombre: 'Jorge Quispe' },
    { iniciales: 'SR', nombre: 'Sofía Ramos' },
    { iniciales: 'CM', nombre: 'Carla Mendoza' },
  ];
  readonly capacidadForm = new FormGroup({
    capacidad: new FormControl<number | null>(15, [Validators.required, Validators.min(8)]),
  });
  constructor(public readonly dialog: MatDialog) {}
}
