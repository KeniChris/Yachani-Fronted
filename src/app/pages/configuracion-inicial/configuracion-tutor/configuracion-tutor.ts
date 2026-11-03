import {
  booleanAttribute,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
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
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { PerfilTutorService } from '../../../core/services/perfil-tutor.service';

@Component({
  selector: 'app-configuracion-tutor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './configuracion-tutor.html',
  styleUrl: './configuracion-tutor.css',
})
export class ConfiguracionTutor implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly perfilService = inject(PerfilTutorService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ transform: booleanAttribute }) previsualizacion = false;
  @Input() estado = 'formulario';

  readonly cargandoPerfil = signal(true);
  readonly errorCarga = signal('');
  readonly guardando = signal(false);
  readonly guardado = signal(false);
  readonly errorGuardado = signal('');

  readonly metodos = [
    'Visual',
    'Práctico',
    'Teórico',
    'Participativo',
    'Resolución de ejercicios',
    'Debate',
  ];

  readonly perfil = new FormGroup({
    presentacion: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(500),
      ],
    }),
    metodo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly errorMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control &&
      control.invalid &&
      (control.dirty || control.touched),
  };

  ngOnInit(): void {
    if (this.previsualizacion) {
      this.cargandoPerfil.set(false);
      return;
    }

    this.cargarPerfil();
  }

  cargarPerfil(): void {
    const usuario = this.authService.usuario();

    if (!usuario) {
      void this.router.navigateByUrl('/auth/iniciar-sesion');
      return;
    }

    if (usuario.tipoUsuario !== 'TUTOR') {
      void this.router.navigateByUrl('/configuracion-inicial/estudiante');
      return;
    }

    this.cargandoPerfil.set(true);
    this.errorCarga.set('');

    this.perfilService
      .consultarPerfil(usuario.idUsuario)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoPerfil.set(false)),
      )
      .subscribe({
        next: (datos) => {
          this.perfil.patchValue({
            presentacion: datos.presentacion ?? '',
            metodo: datos.metodoEnsenanza ?? '',
          });
        },
        error: (error: HttpErrorResponse) => {
          this.errorCarga.set(
            this.mensajeError(
              error,
              'No pudimos cargar tu configuración.',
            ),
          );
        },
      });
  }

  finalizar(): void {
    if (
      this.previsualizacion ||
      this.guardando() ||
      this.guardado() ||
      this.cargandoPerfil() ||
      this.errorCarga()
    ) {
      return;
    }

    this.errorGuardado.set('');
    this.perfil.markAllAsTouched();

    if (this.perfil.invalid) {
      return;
    }

    const usuario = this.authService.usuario();

    if (!usuario || usuario.tipoUsuario !== 'TUTOR') {
      void this.router.navigateByUrl('/auth/iniciar-sesion');
      return;
    }

    const valores = this.perfil.getRawValue();

    this.guardando.set(true);
    this.perfil.disable();

    this.perfilService
      .guardarPerfil(usuario.idUsuario, {
        presentacion: valores.presentacion.trim(),
        metodoEnsenanza: valores.metodo,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.perfil.enable();
          this.guardando.set(false);
        }),
      )
      .subscribe({
        next: () => {
          this.guardado.set(true);
        },
        error: (error: HttpErrorResponse) => {
          this.errorGuardado.set(
            this.mensajeError(
              error,
              'No pudimos confirmar el guardado. Puedes volver a intentarlo.',
            ),
          );
        },
      });
  }

  private mensajeError(
    error: HttpErrorResponse,
    alternativa: string,
  ): string {
    const cuerpo: unknown = error.error;

    if (
      cuerpo !== null &&
      typeof cuerpo === 'object' &&
      'mensaje' in cuerpo &&
      typeof cuerpo.mensaje === 'string'
    ) {
      return cuerpo.mensaje;
    }

    if (error.status === 0) {
      return 'No pudimos conectar con el servidor.';
    }

    return alternativa;
  }
}