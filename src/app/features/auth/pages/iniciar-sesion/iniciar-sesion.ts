import { Component, DestroyRef, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, RouterLink],
  selector: 'app-iniciar-sesion',
  styleUrl: './iniciar-sesion.css',
  templateUrl: './iniciar-sesion.html',
  host: {
    '[class.error-view]': "estadoVista === 'error'",
    '[class.success-view]': "estadoVista === 'exito'",
  },
})
export class IniciarSesion {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private temporizadorRedireccion?: ReturnType<typeof setTimeout>;
  private readonly pausaExitoMs = 1500;
  // Pendiente: añadir los roles reales del backend y sus rutas de inicio
  // cuando se definan. /app aún no tiene rutas hijas de inicio.
  private readonly destinosPorRol: Readonly<Partial<Record<string, string>>> = {};
  // Vista temporal: 'formulario', 'error' o 'exito'. No simula autenticación.
  estadoVista: 'formulario' | 'error' | 'exito' = 'formulario';
  mostrarContrasena = false;
  mensajeEstado = '';
  readonly formulario = this.fb.nonNullable.group({
    correo: ['', [Validators.required, Validators.email, Validators.pattern(/^[^@\s]+@upc\.edu\.pe$/)]],
    contrasena: ['', Validators.required],
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.cancelarRedireccion());
  }

  iniciarSesion(): void {
    this.cancelarRedireccion();
    this.estadoVista = 'formulario';
    this.mensajeEstado = '';
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.mensajeEstado = 'El inicio de sesión aún no está disponible.';
  }

  // Invocar únicamente tras una autenticación confirmada por el backend,
  // pasando el rol de su respuesta. Cambiar estadoVista solo previsualiza la UI.
  completarInicioSesion(rolBackend: unknown): void {
    this.cancelarRedireccion();
    this.mensajeEstado = '';
    this.estadoVista = 'exito';

    const destino = typeof rolBackend === 'string' &&
      Object.hasOwn(this.destinosPorRol, rolBackend)
      ? this.destinosPorRol[rolBackend]
      : undefined;

    // Sin un rol reconocido y una ruta real, conservar la vista de éxito.
    if (!destino) return;

    this.temporizadorRedireccion = setTimeout(() => {
      this.temporizadorRedireccion = undefined;
      void this.router.navigateByUrl(destino);
    }, this.pausaExitoMs);
  }

  private cancelarRedireccion(): void {
    if (this.temporizadorRedireccion !== undefined) {
      clearTimeout(this.temporizadorRedireccion);
      this.temporizadorRedireccion = undefined;
    }
  }

  corregirDatos(): void {
    if (this.estadoVista === 'error') {
      this.estadoVista = 'formulario';
    }
    this.mensajeEstado = '';
  }

  informarPendiente(accion: 'recuperar' | 'registrar'): void {
    this.mensajeEstado = accion === 'recuperar'
      ? 'La recuperación de contraseña aún no está disponible.'
      : 'El registro aún no está disponible.';
  }
}
