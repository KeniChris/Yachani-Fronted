import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EstadoRecuperacion, RecoveryFlow } from '../../recovery-flow';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  selector: 'app-recuperar-contrasena',
  styleUrls: ['../../recovery.css', './recuperar-contrasena.css'],
  templateUrl: './recuperar-contrasena.html',
})
export class RecuperarContrasena {
  readonly flujo = inject(RecoveryFlow);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  // Puede cambiarse a 'cargando' o 'error' para revisar esas vistas.
  estado: EstadoRecuperacion = 'formulario';
  mensaje = '';
  mensajeError = 'No pudimos solicitar el código. Inténtalo nuevamente.';
  readonly formulario = this.fb.nonNullable.group({
    correo: [this.flujo.correo(), [Validators.required, Validators.email, Validators.pattern(/^[^@\s]+@upc\.edu\.pe$/)]],
  });

  enviar(): void {
    if (this.estado === 'cargando') return;
    this.mensaje = '';
    this.estado = 'formulario';
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.flujo.codigoVerificado = false;
    this.flujo.envioConfirmado = false;
    this.flujo.correo.set(this.formulario.controls.correo.value);
    if (this.flujo.modoPrevisualizacion) {
      this.confirmarEnvio();
      return;
    }
    // Pendiente: establecer estado='cargando' y conectar la solicitud al backend.
    this.mensaje = 'El envío de códigos aún no está disponible. No se envió ningún correo.';
  }

  // Conectar solo a una respuesta de envío exitosa del backend.
  confirmarEnvio(): void {
    this.flujo.envioConfirmado = true;
    this.estado = 'exito';
    void this.router.navigateByUrl('/verificar-codigo');
  }

  mostrarError(mensaje: string): void {
    this.estado = 'error';
    this.mensajeError = mensaje;
  }
}
