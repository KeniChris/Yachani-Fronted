import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class Contacto {
  private readonly fb = inject(FormBuilder);

  mensajeEstado = '';

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.pattern(/\S/)]],
    correo: ['', [Validators.required, Validators.email]],
    asunto: ['', [Validators.required, Validators.pattern(/\S/)]],
    mensaje: ['', [Validators.required, Validators.pattern(/\S/)]]
  });

  tieneError(campo: 'nombre' | 'correo' | 'asunto' | 'mensaje'): boolean {
    const control = this.formulario.controls[campo];
    return control.invalid && control.touched;
  }

  enviar(): void {
    this.mensajeEstado = '';

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.mensajeEstado =
      'Demostración: los datos son válidos. El mensaje aún no se ha enviado.';
  }
}