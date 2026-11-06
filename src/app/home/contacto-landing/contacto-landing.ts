import { Component, DestroyRef, inject, signal, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormControl,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { finalize } from 'rxjs';
import { ContactoService } from '../../core/services/contacto.service';
import { textoRequerido } from '../../core/services/recursos-ui';
import { AvisoOperacion } from '../../shared/aviso-operacion/aviso-operacion';

@Component({
  selector: 'app-contacto-landing',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    AvisoOperacion,
  ],
  templateUrl: './contacto-landing.html',
  styles: [':host { display: block; min-width: 0; }'],
})
export class ContactoLanding {
  private readonly servicio = inject(ContactoService);
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('contactDirective') private directiva?: FormGroupDirective;
  readonly enviando = signal(false);
  readonly error = signal('');
  readonly confirmacion = signal('');
  readonly formulario = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [textoRequerido, Validators.maxLength(100), Validators.pattern(/^[^\r\n]*$/)],
    }),
    correo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    asunto: new FormControl('', {
      nonNullable: true,
      validators: [textoRequerido, Validators.maxLength(150), Validators.pattern(/^[^\r\n]*$/)],
    }),
    mensaje: new FormControl('', {
      nonNullable: true,
      validators: [textoRequerido, Validators.maxLength(5000)],
    }),
  });

  constructor() {
    this.formulario.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.error.set('');
      this.confirmacion.set('');
    });
  }

  enviar(): void {
    if (this.enviando()) return;
    this.formulario.markAllAsTouched();
    if (this.formulario.invalid) return;
    const datos = this.formulario.getRawValue();
    this.error.set('');
    this.confirmacion.set('');
    this.enviando.set(true);
    this.servicio
      .enviar({
        nombre: datos.nombre.trim(),
        correo: datos.correo.trim(),
        asunto: datos.asunto.trim(),
        mensaje: datos.mensaje.trim(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.enviando.set(false)),
      )
      .subscribe({
        next: (respuesta) => {
          this.directiva?.resetForm();
          this.confirmacion.set(respuesta.mensaje);
        },
        error: (error: HttpErrorResponse) => {
          this.error.set(
            error.status === 0
              ? 'No pudimos conectar con el servidor. Conservamos tu mensaje para que puedas reintentar.'
              : typeof error.error?.mensaje === 'string'
                ? error.error.mensaje
                : 'No fue posible enviar tu mensaje. Inténtalo de nuevo más tarde.',
          );
        },
      });
  }
}
