import { Component } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormGroup, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-mazo-formulario',
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
  templateUrl: './mazo-formulario.html',
  styleUrls: ['../../../recursos/recursos.css', '../../flashcards.css', './mazo-formulario.css'],
})
export class MazoFormulario {
  readonly editando: boolean;
  readonly formulario;
  constructor(route: ActivatedRoute) {
    this.editando = route.snapshot.data['editando'] === true;
    this.formulario = new FormGroup({
      titulo: new FormControl(this.editando ? 'Fórmulas de derivadas' : '', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(120)],
      }),
      descripcion: new FormControl(
        this.editando ? 'Reglas y ejemplos para preparar tu próximo repaso.' : '',
        { nonNullable: true, validators: Validators.maxLength(500) },
      ),
    });
  }
}
