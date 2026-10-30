import { Component, DestroyRef, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { EstadoRecuperacion, RecoveryFlow } from '../../recovery-flow';

const coinciden: ValidatorFn = form => {
  const nueva = form.get('contrasena')?.value;
  const confirmacion = form.get('confirmacion')?.value;
  return nueva && confirmacion && nueva !== confirmacion ? { noCoinciden: true } : null;
};

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  selector: 'app-restablecer-contrasena',
  styleUrls: ['../../recovery.css', './restablecer-contrasena.css'],
  templateUrl: './restablecer-contrasena.html',
})
export class RestablecerContrasena {
  readonly flujo = inject(RecoveryFlow);
  private readonly fb = inject(FormBuilder);
  estado: EstadoRecuperacion = 'formulario';
  mensaje = '';
  mensajeError = 'No pudimos actualizar tu contraseña. Inténtalo nuevamente.';
  mostrarContrasena = false;
  mostrarConfirmacion = false;
  readonly formulario = this.fb.nonNullable.group({
    contrasena: ['', [Validators.required, Validators.minLength(8)]],
    confirmacion: ['', Validators.required],
  }, { validators: coinciden });
  readonly confirmacionMatcher: ErrorStateMatcher = {
    isErrorState: (control, form) => !!control &&
      (control.invalid || this.formulario.hasError('noCoinciden')) &&
      (control.touched || !!form?.submitted),
  };

  constructor() {
    inject(DestroyRef).onDestroy(() => this.formulario.reset());
  }

  guardar(): void {
    if (this.estado === 'cargando') return;
    this.mensaje = '';
    this.estado = 'formulario';
    if (this.formulario.invalid) { this.formulario.markAllAsTouched(); return; }
    if (this.flujo.modoPrevisualizacion) { this.confirmarActualizacion(); return; }
    if (!this.flujo.codigoVerificado) {
      this.mostrarError('Debes verificar el código antes de restablecer tu contraseña.');
      return;
    }
    // Pendiente: estado='cargando' y solicitud al backend con su autorización
    // de recuperación. El backend debe comprobar que sea distinta de la anterior.
    this.mensaje = 'El cambio de contraseña aún no está disponible. No se modificó tu contraseña.';
  }

  // Llamar solo con confirmación del backend o en previsualización explícita.
  confirmarActualizacion(): void {
    this.formulario.reset();
    this.mostrarContrasena = false;
    this.mostrarConfirmacion = false;
    this.mensaje = '';
    this.estado = 'exito';
    this.flujo.reiniciar();
  }

  mostrarError(mensaje: string): void { this.estado = 'error'; this.mensajeError = mensaje; }
}
