import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatRadioModule,
  ],
  templateUrl: './configuracion.html',
  styleUrls: ['../grupos.css', './configuracion.css'],
})
export class Configuracion {
  // Variante visual mediante ?rol=tutor y grupo entre estudiantes (G21) mediante ?admin=si.
  @Input() rol = 'estudiante';
  @Input() admin = '';
  // Estados de Figma mediante ?configuracion=: editar (G22/G23) y actualizado (G24/G25).
  @Input() configuracion = '';
  get nombreGrupo() {
    return this.admin === 'si' ? 'Ingeniería de Software: repasos' : 'Dominando Cálculo';
  }
  // Publicaciones abiertas (G19) o restringidas (G20): interacción nativa del radio, sin estado propio.
  readonly publicacionesForm = new FormGroup({
    publicaciones: new FormControl('abiertas', { nonNullable: true }),
  });
  // Editar nombre (G22/G23): el formulario de edición muestra el nombre actual del grupo.
  readonly nombreForm = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
}
