import { Component } from '@angular/core';
import { rutaGrupoActual } from '../../../grupos/ruta-grupo-actual';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-cambiar-tema',
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
  templateUrl: './cambiar-tema.html',
  styleUrls: ['../../recursos.css', './cambiar-tema.css'],
})
export class CambiarTema {
  readonly grupo = rutaGrupoActual();
  readonly material;
  readonly materiales = {
    '1': {
      idMaterial: 1,
      nombre: 'Guía de derivadas.pdf',
      autor: 'Leicy Cahuana',
      formato: 'PDF',
      tamano: '1,1 MB',
      fecha: '28 oct 2026',
      puedeEliminar: true,
      detalle: this.grupo + '/materiales/1',
      cambiar: this.grupo + '/materiales/1/cambiar-tema',
    },
    '2': {
      idMaterial: 2,
      nombre: 'Ejercicios resueltos.docx',
      autor: 'Carlos Ríos',
      formato: 'DOCX',
      tamano: '840 KB',
      fecha: '28 oct 2026',
      puedeEliminar: false,
      detalle: this.grupo + '/materiales/2',
      cambiar: this.grupo + '/materiales/2/cambiar-tema',
    },
    '3': {
      idMaterial: 3,
      nombre: 'Mapa de conceptos.png',
      autor: 'Lucía Paredes',
      formato: 'PNG',
      tamano: '350 KB',
      fecha: '27 oct 2026',
      puedeEliminar: false,
      detalle: this.grupo + '/materiales/3',
      cambiar: this.grupo + '/materiales/3/cambiar-tema',
    },
  };
  constructor(route: ActivatedRoute) {
    this.material = this.materiales[route.snapshot.params['idMaterial'] as keyof typeof this.materiales];
  }
  readonly formulario = new FormGroup({
    idTema: new FormControl('3', { nonNullable: true, validators: Validators.required }),
  });
}
