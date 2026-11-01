import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-iniciar-sesion',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './iniciar-sesion.html',
  styleUrl: './iniciar-sesion.css',
})
export class IniciarSesion {
  // Previsualización manual; el botón no cambia este estado.
  estado: 'formulario' | 'error' | 'exito' = 'formulario';
  mostrarContrasena = false;

  readonly form = new FormGroup({
    correo: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^@]+@upc\.edu\.pe$/),
      ],
    }),
    contrasena: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  iniciarSesion(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    // Pendiente de la integración con el backend.
  }
}
