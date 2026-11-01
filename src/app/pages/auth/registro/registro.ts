import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatRadioModule,
  ],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  // Solo para revisión visual desde el código; nunca cambia al enviar el formulario.
  previsualizacion: false | 'formulario' | 'error' | 'exito' = false;
  mostrarContrasena = false;
  mostrarConfirmacion = false;

  readonly form = new FormGroup(
    {
      rol: new FormControl<'estudiante' | 'tutor' | null>(null, Validators.required),
      nombres: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/\S/)],
      }),
      apellidos: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/\S/)],
      }),
      correo: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[^@]+@upc\.edu\.pe$/),
        ],
      }),
      contrasena: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmacion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    {
      validators: (group: AbstractControl) => {
        const contrasena = group.get('contrasena')?.value;
        const confirmacion = group.get('confirmacion')?.value;
        return confirmacion && contrasena !== confirmacion ? { contrasenasDiferentes: true } : null;
      },
    },
  );

  readonly campoErrorMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control && control.invalid && (control.dirty || control.touched),
  };
  readonly confirmacionErrorMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control &&
      (control.dirty || control.touched) &&
      (control.invalid || this.form.hasError('contrasenasDiferentes')),
  };

  registrarse(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    // La creación de cuenta y su resultado quedan pendientes del backend.
  }
}
