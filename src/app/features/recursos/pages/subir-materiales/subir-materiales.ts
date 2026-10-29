import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-subir-materiales',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './subir-materiales.html',
  styleUrls: ['../../recursos.css', './subir-materiales.css'],
})
export class SubirMateriales {
  readonly formulario = new FormGroup({ idTema: new FormControl('2', { nonNullable: true }) });
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
