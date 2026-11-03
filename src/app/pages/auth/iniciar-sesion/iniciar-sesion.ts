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
import {
  finalize,
  map,
  Observable,
  switchMap,
  throwError,
  timer,
} from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { PerfilEstudianteService } from '../../../core/services/perfil-estudiante.service';
import { PerfilTutorService } from '../../../core/services/perfil-tutor.service';
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
  private readonly perfilEstudiante = inject(PerfilEstudianteService);
  private readonly perfilTutor = inject(PerfilTutorService);
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
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const valores = this.form.getRawValue();

    const datos: LoginRequest = {
      correo: valores.correo.trim().toLowerCase(),
      contrasena: valores.contrasena,
    };

    let credencialesVerificadas = false;

    this.cargando.set(true);

    this.authService
      .iniciarSesion(datos)
      .pipe(
        switchMap((usuario) => {
          credencialesVerificadas = true;

          return this.obtenerDestino(usuario).pipe(
            map((destino) => ({ usuario, destino })),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: ({ usuario, destino }) => {
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
          if (credencialesVerificadas) {
            this.errorLogin.set(
              'Tus credenciales son correctas, pero no pudimos consultar tu perfil. Vuelve a intentarlo.',
            );
            return;
          }

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

  private obtenerDestino(usuario: UsuarioResponse): Observable<string> {
    if (usuario.tipoUsuario === 'ESTUDIANTE') {
      return this.perfilEstudiante
        .consultarPerfil(usuario.idUsuario)
        .pipe(
          map((perfil) => {
            const cursos = perfil.conocimientos ?? [];

            const completo =
              !!perfil.universidad?.trim() &&
              !!perfil.carrera?.trim() &&
              !!perfil.modalidadPreferida?.trim() &&
              !!perfil.metodoPreferido?.trim() &&
              cursos.length > 0 &&
              cursos.every(
                (curso) => !!curso.curso?.trim() && !!curso.nivel?.trim(),
              );

            return completo
              ? '/inicio?rol=estudiante'
              : '/configuracion-inicial/estudiante';
          }),
        );
    }

    if (usuario.tipoUsuario === 'TUTOR') {
      return this.perfilTutor
        .consultarPerfil(usuario.idUsuario)
        .pipe(
          map((perfil) => {
            const completo =
              !!perfil.presentacion?.trim() &&
              !!perfil.metodoEnsenanza?.trim();

            return completo
              ? '/inicio?rol=tutor'
              : '/configuracion-inicial/tutor';
          }),
        );
    }

    return throwError(
      () => new Error('Tipo de usuario no reconocido'),
    );
  }
}