import {
  booleanAttribute,
  Component,
  DestroyRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  signal,
} from '@angular/core';
import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ErrorStateMatcher } from '@angular/material/core';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-restablecer-contrasena',
  standalone: true,
  host: { class: 'recovery-page' },
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
  ],
  templateUrl: './restablecer-contrasena.html',
  styleUrl: './restablecer-contrasena.css',
})
export class RestablecerContrasena implements OnInit, OnChanges {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly destroyRef = inject(DestroyRef);

  private correo = '';
  private codigo = '';

  @Input({ transform: booleanAttribute }) previsualizacion = false;
  @Input() estado = 'formulario';

  mostrarContrasena = false;
  mostrarConfirmacion = false;

  readonly guardando = signal(false);
  readonly guardado = signal(false);
  readonly errorGuardado = signal('');
  readonly solicitarNuevoCodigo = signal(false);

  readonly form = new FormGroup(
    {
      contrasena: new FormControl('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.minLength(8),
        ],
      }),
      confirmacion: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {
      validators: (group: AbstractControl) =>
        group.get('confirmacion')?.value &&
        group.get('contrasena')?.value !==
          group.get('confirmacion')?.value
          ? { diferentes: true }
          : null,
    },
  );

  readonly errorMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control &&
      control.invalid &&
      (control.dirty || control.touched),
  };

  readonly confirmacionMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control &&
      (control.dirty || control.touched) &&
      (control.invalid || this.form.hasError('diferentes')),
  };

  ngOnInit(): void {
    if (this.previsualizacion) {
      return;
    }

    const estado: unknown = this.location.getState();

    if (estado && typeof estado === 'object') {
      const datos = estado as Record<string, unknown>;

      this.correo =
        typeof datos['correo'] === 'string'
          ? datos['correo'].trim().toLowerCase()
          : '';

      this.codigo =
        typeof datos['codigo'] === 'string'
          ? datos['codigo']
          : '';
    }

    if (!this.correo || !/^[0-9]{6}$/.test(this.codigo)) {
      void this.router.navigateByUrl('/auth/recuperar-contrasena');
    }
  }

  ngOnChanges(): void {
    if (this.previsualizacion && this.estado === 'error') {
      this.form.markAllAsTouched();
    }
  }

  guardar(): void {
    if (
      this.previsualizacion ||
      this.guardando() ||
      this.guardado()
    ) {
      return;
    }

    this.errorGuardado.set('');
    this.solicitarNuevoCodigo.set(false);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    if (!this.correo || !/^[0-9]{6}$/.test(this.codigo)) {
      void this.router.navigateByUrl('/auth/recuperar-contrasena');
      return;
    }

    const valores = this.form.getRawValue();

    this.guardando.set(true);
    this.form.disable();

    this.authService
      .restablecerContrasena({
        correo: this.correo,
        codigo: this.codigo,
        nuevaContrasena: valores.contrasena,
        confirmarContrasena: valores.confirmacion,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.guardando.set(false);
          this.form.enable();
        }),
      )
      .subscribe({
        next: () => {
          this.form.reset();
          this.mostrarContrasena = false;
          this.mostrarConfirmacion = false;
          this.correo = '';
          this.codigo = '';

          // Quita los datos de recuperación del estado de esta página.
          this.location.replaceState(this.location.path(), '', {});

          this.guardado.set(true);
        },
        error: (error: HttpErrorResponse) => {
          if (error.status === 400) {
            this.solicitarNuevoCodigo.set(true);
            this.errorGuardado.set(
              'No pudimos cambiar la contraseña. El código puede haber vencido o dejado de ser válido. Solicita uno nuevo.',
            );
            return;
          }

          this.errorGuardado.set(
            error.status === 0
              ? 'No pudimos conectar con el servidor. Inténtalo nuevamente.'
              : 'No pudimos cambiar la contraseña. Inténtalo nuevamente.',
          );
        },
      });
  }
}