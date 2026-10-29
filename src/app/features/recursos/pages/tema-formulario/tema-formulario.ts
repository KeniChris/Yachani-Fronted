import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-tema-formulario',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './tema-formulario.html',
  styleUrls: ['../../recursos.css', './tema-formulario.css'],
})
export class TemaFormulario {
  readonly editando;
  readonly formulario;
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
    const tema = this.temas?.[route.snapshot.params['idTema'] as keyof typeof this.temas];
    this.editando = !!tema;
    this.formulario = new FormGroup({
      nombre: new FormControl(tema?.nombre ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(100)],
      }),
      descripcion: new FormControl(tema?.descripcion ?? '', {
        nonNullable: true,
        validators: Validators.maxLength(300),
      }),
    });
  }
}
