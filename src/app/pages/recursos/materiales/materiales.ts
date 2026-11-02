import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-materiales',
  standalone: true,
  providers: [{ provide: MatPaginatorIntl, useValue: Object.assign(new MatPaginatorIntl(), {
    nextPageLabel: 'Página siguiente', previousPageLabel: 'Página anterior',
    getRangeLabel: () => '1–3 de 3',
  }) }],
  imports: [RouterLink, ReactiveFormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatSelectModule, MatIconModule, MatMenuModule, MatPaginatorModule],
  templateUrl: './materiales.html',
  styleUrl: './materiales.css',
})
export class Materiales {
  @Input() rol = 'estudiante';
  @Input() contexto = 'tutor';
  @Input() permiso = 'integrante';
  @Input() publicaciones = 'todos';
  @Input() tema = '';
  readonly temas = ['Límites y continuidad', 'Reglas de derivación', 'Aplicaciones de la derivada'];
  readonly temasEstudiantes = ['Casos de uso', 'Diagramas UML', 'Pruebas de software'];
  readonly materiales = [
    { nombre: 'Guía de derivadas.pdf', autor: 'Leicy Cahuana', formato: 'PDF', tamano: '1,1 MB', fecha: '28 oct 2026', icono: 'picture_as_pdf' },
    { nombre: 'Ejercicios resueltos.docx', autor: 'Carlos Ríos', formato: 'DOCX', tamano: '840 KB', fecha: '28 oct 2026', icono: 'description' },
    { nombre: 'Mapa de conceptos.png', autor: 'Lucía Paredes', formato: 'PNG', tamano: '350 KB', fecha: '27 oct 2026', icono: 'image' },
  ];
  readonly materialesEstudiantes = [
    { nombre: 'Guía de casos de uso.pdf', autor: 'Lucía Paredes', formato: 'PDF', tamano: '1,1 MB', fecha: '28 oct 2026', icono: 'picture_as_pdf' },
    { nombre: 'Diagramas del proyecto.docx', autor: 'Leicy Cahuana', formato: 'DOCX', tamano: '840 KB', fecha: '28 oct 2026', icono: 'description' },
    { nombre: 'Plan de pruebas.png', autor: 'Diego Torres', formato: 'PNG', tamano: '350 KB', fecha: '27 oct 2026', icono: 'image' },
  ];
  readonly filtroForm = new FormGroup({ tema: new FormControl('Todos los temas', {nonNullable: true}) });
  readonly subirForm = new FormGroup({ tema: new FormControl('Reglas de derivación', {nonNullable: true}), archivos: new FormControl('') });
  readonly cambiarForm = new FormGroup({ tema: new FormControl('Aplicaciones de la derivada', {nonNullable: true}) });
  constructor(public readonly dialog: MatDialog) {}
}
