import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-materiales',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatPaginatorModule,
  ],
  templateUrl: './materiales.html',
  styleUrls: ['../../recursos.css', './materiales.css'],
})
export class Materiales {
  readonly tema: string | undefined;
  readonly temas = {
    '1': {
      editar: true,
      nombre: 'Límites y continuidad',
      descripcion: 'Propiedades de los límites y continuidad de funciones.',
    },
    '2': {
      editar: true,
      nombre: 'Reglas de derivación',
      descripcion: 'Regla de la potencia, del producto y de la cadena.',
    },
    '3': {
      editar: true,
      nombre: 'Aplicaciones de la derivada',
      descripcion: 'Optimización, máximos y mínimos con ejercicios.',
    },
  };
  constructor(route: ActivatedRoute) {
    this.tema = this.temas?.[route.snapshot.params['idTema'] as keyof typeof this.temas]?.nombre;
  }
  readonly filtros = new FormGroup({ idTema: new FormControl('todos', { nonNullable: true }) });
  readonly materiales = [
    {
      idMaterial: 1,
      nombre: 'Guía de derivadas.pdf',
      autor: 'Leicy Cahuana',
      formato: 'PDF',
      tamano: '1,1 MB',
      fecha: '28 oct 2026',
      icono: 'picture_as_pdf',
      detalle: '/app/grupos/1/materiales/1',
    },
    {
      idMaterial: 2,
      nombre: 'Ejercicios resueltos.docx',
      autor: 'Carlos Ríos',
      formato: 'DOCX',
      tamano: '840 KB',
      fecha: '28 oct 2026',
      icono: 'description',
      detalle: '/app/grupos/1/materiales/2',
    },
    {
      idMaterial: 3,
      nombre: 'Mapa de conceptos.png',
      autor: 'Lucía Paredes',
      formato: 'PNG',
      tamano: '350 KB',
      fecha: '27 oct 2026',
      icono: 'image',
      detalle: '/app/grupos/1/materiales/3',
    },
  ];
}
