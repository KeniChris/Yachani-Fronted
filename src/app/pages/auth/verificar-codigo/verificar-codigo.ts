import {
  booleanAttribute,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnInit,
  QueryList,
  signal,
  ViewChildren,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verificar-codigo',
  standalone: true,
  host: { class: 'recovery-page' },
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './verificar-codigo.html',
  styleUrl: './verificar-codigo.css',
})
export class VerificarCodigo implements OnInit, OnChanges {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ transform: booleanAttribute }) previsualizacion = false;
  @Input() estado = 'formulario';

  @Input({
    transform: (valor: unknown) =>
      typeof valor === 'string' ? valor.trim() : '',
  })
  destinatario = '';

  @ViewChildren('digit')
  casillas!: QueryList<ElementRef<HTMLInputElement>>;

  readonly verificando = signal(false);
  readonly reenviando = signal(false);
  readonly errorCodigo = signal('');
  readonly mensajeReenvio = signal('');

  readonly indices = [0, 1, 2, 3, 4, 5];

  readonly form = new FormGroup(
    Object.fromEntries(
      this.indices.map((i) => [
        String(i),
        new FormControl('', {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.pattern(/^[0-9]$/),
          ],
        }),
      ]),
    ),
  );

  ngOnInit(): void {
    if (this.previsualizacion) {
      return;
    }

    this.destinatario = (
      this.route.snapshot.queryParamMap.get('correo') ?? ''
    )
      .trim()
      .toLowerCase();

    if (!this.destinatario) {
      void this.router.navigateByUrl('/auth/recuperar-contrasena');
    }
  }

  ngOnChanges(): void {
    if (this.previsualizacion && this.estado === 'error') {
      this.form.markAllAsTouched();
    }
  }

  escribir(index: number, event: Event): void {
    this.errorCodigo.set('');

    const input = event.target as HTMLInputElement;

    if (/^[0-9]$/.test(input.value) && index < 5) {
      this.enfocar(index + 1);
    }
  }

  pegar(index: number, event: ClipboardEvent): void {
    event.preventDefault();

    if (this.verificando() || this.reenviando()) {
      return;
    }

    this.errorCodigo.set('');

    const texto = event.clipboardData?.getData('text').trim() ?? '';

    if (!/^[0-9]{1,6}$/.test(texto)) {
      this.form.markAllAsTouched();
      return;
    }

    const inicio = texto.length === 6 ? 0 : index;

    for (
      let offset = 0;
      offset < texto.length && inicio + offset < 6;
      offset++
    ) {
      const control = this.form.controls[String(inicio + offset)];
      control.setValue(texto[offset]);
      control.markAsDirty();
    }

    this.enfocar(Math.min(inicio + texto.length, 5));
  }

  teclado(index: number, event: KeyboardEvent): void {
    if (
      event.key === 'Backspace' &&
      !this.form.controls[String(index)].value &&
      index > 0
    ) {
      event.preventDefault();

      const anterior = this.form.controls[String(index - 1)];
      anterior.setValue('');
      anterior.markAsDirty();

      this.errorCodigo.set('');
      this.enfocar(index - 1);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.enfocar(index - 1);
    } else if (event.key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      this.enfocar(index + 1);
    }
  }

  private enfocar(index: number): void {
    const input = this.casillas.get(index)?.nativeElement;
    input?.focus();
    input?.select();
  }

  verificar(): void {
    if (
      this.previsualizacion ||
      this.verificando() ||
      this.reenviando()
    ) {
      return;
    }

    this.form.markAllAsTouched();
    this.errorCodigo.set('');
    this.mensajeReenvio.set('');

    if (this.form.invalid) {
      return;
    }

    if (!this.destinatario) {
      void this.router.navigateByUrl('/auth/recuperar-contrasena');
      return;
    }

    const correo = this.destinatario;
    const codigo = this.indices
      .map((i) => this.form.controls[String(i)].value)
      .join('');

    this.verificando.set(true);
    this.form.disable();

    this.authService
      .verificarCodigo(correo, codigo)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.verificando.set(false);
          this.form.enable();
        }),
      )
      .subscribe({
        next: () => {
          void this.router.navigate(
            ['/auth/restablecer-contrasena'],
            {
              state: { correo, codigo },
            },
          );
        },
        error: (error: HttpErrorResponse) => {
          this.errorCodigo.set(
            error.status === 0
              ? 'No pudimos conectar con el servidor.'
              : error.status === 400
                ? 'El código es incorrecto o ha vencido. Revisa el último correo o solicita otro código.'
                : 'No pudimos verificar el código. Inténtalo nuevamente.',
          );
        },
      });
  }

  reenviar(): void {
    if (
      this.previsualizacion ||
      this.verificando() ||
      this.reenviando()
    ) {
      return;
    }

    if (!this.destinatario) {
      void this.router.navigateByUrl('/auth/recuperar-contrasena');
      return;
    }

    this.errorCodigo.set('');
    this.mensajeReenvio.set('');
    this.reenviando.set(true);
    this.form.disable();

    this.authService
      .solicitarCodigo(this.destinatario)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.reenviando.set(false);
          this.form.enable();
        }),
      )
      .subscribe({
        next: () => {
          this.form.reset();

          this.mensajeReenvio.set(
            'Si el correo está registrado, recibirás un nuevo código. Usa el más reciente.',
          );
        },
        error: (error: HttpErrorResponse) => {
          this.errorCodigo.set(
            error.status === 0
              ? 'No pudimos conectar con el servidor.'
              : error.status === 503
                ? 'No pudimos enviar el correo. Inténtalo nuevamente más tarde.'
                : 'No pudimos reenviar el código. Inténtalo nuevamente.',
          );
        },
      });
  }
}