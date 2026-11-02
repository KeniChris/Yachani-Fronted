import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-datos-mazo',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './datos-mazo.html',
  styleUrls: ['../flashcards.css', './datos-mazo.css'],
})
export class DatosMazo {
  private id = '';
  // Configura el mismo formulario con los ejemplos del mazo seleccionado.
  @Input() set mazoId(value: string) {
    this.id = value || '';
    this.form.reset(
      value === 'integrales'
        ? {
            titulo: 'Repaso de integrales',
            descripcion: 'Continúa agregando preguntas a tu borrador.',
          }
        : value === 'limites'
          ? {
              titulo: 'Límites laterales',
              descripcion: 'Repasa propiedades y límites de funciones.',
            }
          : value === 'uml'
            ? {
                titulo: 'Conceptos de UML',
                descripcion: 'Reglas y ejemplos para tu próximo repaso.',
              }
            : {
                titulo: 'Fórmulas de derivadas',
                descripcion: 'Reglas y ejemplos para tu próximo repaso.',
              },
    );
  }
  get mazoId(): string {
    return this.id;
  }
  readonly form = new FormGroup({
    titulo: new FormControl('Fórmulas de derivadas', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    descripcion: new FormControl('Reglas y ejemplos para tu próximo repaso.', {
      nonNullable: true,
      validators: Validators.maxLength(500),
    }),
  });
}
