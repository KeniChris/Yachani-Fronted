import {
  booleanAttribute,
  Component,
  DestroyRef,
  inject,
  Input,
  OnChanges,
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
import { ErrorStateMatcher } from '@angular/material/core';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  host: { class: 'recovery-page' },
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: './recuperar-contrasena.html',
  styleUrl: './recuperar-contrasena.css',
})
export class RecuperarContrasena implements OnChanges {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ transform: booleanAttribute }) previsualizacion = false;
  @Input() estado = 'formulario';

  readonly enviando = signal(false);
  readonly errorEnvio = signal('');

  readonly form = new FormGroup({
    correo: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^@]+@upc\.edu\.pe$/),
      ],
    }),
  });

  readonly errorMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control &&
      control.invalid &&
      (control.dirty || control.touched),
  };

  ngOnChanges(): void {
    if (this.previsualizacion && this.estado === 'error') {
      this.form.markAllAsTouched();
    }
  }

  enviar(): void {
    if (this.enviando() || this.previsualizacion) {
      return;
    }

    this.errorEnvio.set('');

    const correo = this.form.controls.correo.value
      .trim()
      .toLowerCase();

    this.form.controls.correo.setValue(correo);
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    this.enviando.set(true);
    this.form.disable();

    this.authService
      .solicitarCodigo(correo)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.enviando.set(false);
          this.form.enable();
        }),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(
            ['/auth/verificar-codigo'],
            { queryParams: { correo } },
          );
        },
        error: (error: HttpErrorResponse) => {
          this.errorEnvio.set(
            error.status === 0
              ? 'No pudimos conectar con el servidor. Inténtalo nuevamente.'
              : error.status === 503
                ? 'No pudimos enviar el correo. Inténtalo nuevamente más tarde.'
                : 'No pudimos solicitar el código. Revisa el correo e inténtalo nuevamente.',
          );
        },
      });
  }
}
