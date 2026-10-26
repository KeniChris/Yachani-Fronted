import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

const contrasenasCoinciden: ValidatorFn = (form: AbstractControl) => {
  const contrasena = form.get('contrasena')?.value;
  const confirmacion = form.get('confirmacion')?.value;
  return contrasena && confirmacion && contrasena !== confirmacion
    ? { noCoinciden: true } : null;
};

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  selector: 'app-registro',
  styleUrl: './registro.css',
  templateUrl: './registro.html',
  host: {
    '[class.error-view]': "estadoVista === 'errores'",
    '[class.success-view]': "estadoVista === 'exito'",
  },
})
export class Registro {
  private readonly fb = inject(FormBuilder);
  // Solo previsualización. El envío nunca cambia automáticamente a éxito.
  estadoVista: 'formulario' | 'errores' | 'exito' = 'formulario';
  mostrarContrasena = false;
  mostrarConfirmacion = false;
  mensajeEstado = '';
  readonly roles = [
    { valor: 'estudiante', nombre: 'Estudiante', descripcion: 'Quiero encontrar grupos', icono: 'student.svg' },
    { valor: 'tutor', nombre: 'Tutor', descripcion: 'Quiero orientar grupos', icono: 'tutor.svg' },
  ];
  readonly formulario = this.fb.nonNullable.group({
    rol: ['', Validators.required],
    nombres: ['', [Validators.required, Validators.pattern(/\S/)]],
    apellidos: ['', [Validators.required, Validators.pattern(/\S/)]],
    correo: ['', [Validators.required, Validators.email, Validators.pattern(/^[^@\s]+@upc\.edu\.pe$/)]],
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
    confirmacion: ['', Validators.required],
  }, { validators: contrasenasCoinciden });

  readonly errorMatcher: ErrorStateMatcher = {
    isErrorState: (control, form) => !!control &&
      (control.invalid || (control === this.formulario.controls.confirmacion && this.formulario.hasError('noCoinciden'))) &&
      (control.touched || !!form?.submitted || this.estadoVista === 'errores'),
  };

  errorRol(): boolean {
    const rol = this.formulario.controls.rol;
    return rol.invalid && (rol.touched || this.estadoVista === 'errores');
  }

  registrar(): void {
    this.mensajeEstado = '';
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) {
      this.estadoVista = 'errores';
      return;
    }
    this.estadoVista = 'formulario';
    this.mensajeEstado = 'El registro aún no está disponible. No se creó ninguna cuenta.';
  }

  limpiarMensaje(): void {
    this.mensajeEstado = '';
  }
}
