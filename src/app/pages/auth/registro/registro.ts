import { Component, inject, signal } from '@angular/core';
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
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { RegistroRequest } from '../../../core/models/auth.models';

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
  private readonly authService = inject(AuthService);

  // Solo para revisión visual; independiente del resultado del backend.
  previsualizacion: false | 'formulario' | 'error' | 'exito' = false;

  readonly guardando = signal(false);
  readonly registroExitoso = signal(false);
  readonly errorRegistro = signal('');

  mostrarContrasena = false;
  mostrarConfirmacion = false;

  readonly form = new FormGroup(
    {
      rol: new FormControl<'estudiante' | 'tutor' | null>(
        null,
        Validators.required,
      ),
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
      confirmacion: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {
      validators: (group: AbstractControl) => {
        const contrasena = group.get('contrasena')?.value;
        const confirmacion = group.get('confirmacion')?.value;

        return confirmacion && contrasena !== confirmacion
          ? { contrasenasDiferentes: true }
          : null;
      },
    },
  );

  readonly campoErrorMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control &&
      control.invalid &&
      (control.dirty || control.touched),
  };

  readonly confirmacionErrorMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control &&
      (control.dirty || control.touched) &&
      (control.invalid || this.form.hasError('contrasenasDiferentes')),
  };

  registrarse(): void {
    if (this.guardando() || this.registroExitoso()) {
      return;
    }

    // Las previsualizaciones no crean cuentas reales.
    if (this.previsualizacion !== false) {
      return;
    }

    this.errorRegistro.set('');
    this.form.markAllAsTouched();

    const valores = this.form.getRawValue();

    if (this.form.invalid || valores.rol === null) {
      return;
    }

    const datos: RegistroRequest = {
      nombres: valores.nombres.trim(),
      apellidos: valores.apellidos.trim(),
      correo: valores.correo.trim().toLowerCase(),
      contrasena: valores.contrasena,
      tipoUsuario:
        valores.rol === 'tutor' ? 'TUTOR' : 'ESTUDIANTE',
    };

    this.guardando.set(true);

    this.authService
      .registrar(datos)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.form.reset();
          this.mostrarContrasena = false;
          this.mostrarConfirmacion = false;
          this.registroExitoso.set(true);
        },
        error: () => {
          this.errorRegistro.set(
            'Revisa tu conexión o intenta iniciar sesión si ya creaste la cuenta.',
          );
        },
      });
  }
}