import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-temas',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './temas.html',
  styleUrl: './temas.css',
})
export class Temas {
  @Input() rol = 'estudiante';
  @Input() contexto = 'tutor';
  @Input() permiso = 'integrante';
  readonly temas = [
    { nombre: 'Límites y continuidad', descripcion: 'Propiedades de los límites y continuidad de funciones.' },
    { nombre: 'Reglas de derivación', descripcion: 'Regla de la potencia, del producto y de la cadena.' },
    { nombre: 'Aplicaciones de la derivada', descripcion: 'Optimización, máximos y mínimos con ejercicios.' },
  ];
  readonly temasEstudiantes = [
    { nombre: 'Casos de uso', descripcion: 'Actores, escenarios y relaciones entre casos de uso.' },
    { nombre: 'Diagramas UML', descripcion: 'Clases, componentes y relaciones del sistema.' },
    { nombre: 'Pruebas de software', descripcion: 'Casos de prueba y criterios de aceptación.' },
  ];
  readonly crearForm = new FormGroup({
    nombre: new FormControl('Integrales definidas', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    descripcion: new FormControl('Técnicas básicas, propiedades y ejercicios de integración.', { nonNullable: true, validators: Validators.maxLength(300) }),
  });
  readonly editarForm = new FormGroup({
    nombre: new FormControl('Reglas de derivación', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    descripcion: new FormControl('Regla de la potencia, del producto y de la cadena.', { nonNullable: true, validators: Validators.maxLength(300) }),
  });
  constructor(public readonly dialog: MatDialog) {}
}
