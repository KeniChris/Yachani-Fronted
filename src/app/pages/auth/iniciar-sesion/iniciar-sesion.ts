import {
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { finalize, timer } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import {
  LoginRequest,
  UsuarioResponse,
} from '../../../core/models/auth.models';

@Component({
  selector: 'app-iniciar-sesion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './iniciar-sesion.html',
  styleUrl: './iniciar-sesion.css',
})
export class IniciarSesion {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  // Previsualización manual, independiente de la respuesta real.
  estado: 'formulario' | 'error' | 'exito' = 'formulario';

  readonly cargando = signal(false);
  readonly errorLogin = signal('');
  readonly usuarioValidado = signal<UsuarioResponse | null>(null);

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
    contrasena: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  iniciarSesion(): void {
    if (
      this.cargando() ||
      this.usuarioValidado() ||
      this.estado !== 'formulario'
    ) {
      return;
    }

    this.errorLogin.set('');

    const correo = this.form.controls.correo.value
      .trim()
      .toLowerCase();

    this.form.controls.correo.setValue(correo);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const valores = this.form.getRawValue();

    const datos: LoginRequest = {
      correo: valores.correo,
      contrasena: valores.contrasena,
    };

    this.cargando.set(true);

    this.authService
      .iniciarSesion(datos)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (usuario) => {
          const destino = this.obtenerDestino(usuario);

          if (!destino) {
            this.authService.cerrarSesion();
            this.errorLogin.set(
              'No pudimos identificar el tipo de usuario de tu cuenta.',
            );
            return;
          }

          this.form.reset();
          this.mostrarContrasena = false;
          this.usuarioValidado.set(usuario);

          // Muestra brevemente el éxito antes de navegar.
          timer(1500)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              void this.router.navigateByUrl(destino);
            });
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              this.errorLogin.set(
                'Correo o contraseña incorrectos. Verifica tus datos e inténtalo nuevamente.',
              );
              return;
            }

            if (error.status === 0) {
              this.errorLogin.set(
                'No pudimos conectar con el servidor. Comprueba tu conexión y que el backend esté encendido.',
              );
              return;
            }
          }

          this.errorLogin.set(
            'No pudimos completar el inicio de sesión. Inténtalo nuevamente.',
          );
        },
      });
  }

  private obtenerDestino(usuario: UsuarioResponse): string | null {
    if (usuario.tipoUsuario === 'ESTUDIANTE') {
      return usuario.configuracionCompletada
        ? '/inicio?rol=estudiante'
        : '/configuracion-inicial/estudiante';
    }

    if (usuario.tipoUsuario === 'TUTOR') {
      return usuario.configuracionCompletada
        ? '/inicio?rol=tutor'
        : '/configuracion-inicial/tutor';
    }

    return null;
  }
}