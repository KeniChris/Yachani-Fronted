import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

function validarPresentacion(control: AbstractControl<string>): ValidationErrors | null {
  const texto = control.value ?? '';
  if (!texto.trim()) return { required: true };
  if (texto.length > 500) return { maxlength: true };
  return null;
}

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  selector: 'app-configuracion-tutor',
  styleUrl: './configuracion-tutor.css',
  templateUrl: './configuracion-tutor.html',
})
export class ConfiguracionTutor {
  private readonly fb = inject(FormBuilder);
  // Cambiar a true para recorrer el flujo y mostrar el éxito sin guardar datos.
  readonly modoPrevisualizacion = false;
  paso: 1 | 2 = 1;
  estado: 'formulario' | 'guardando' | 'error' | 'exito' = 'formulario';
  mensaje = '';
  mensajeError = 'No pudimos guardar tu configuración. Inténtalo nuevamente.';
  // Pendiente: asignar la ruta real cuando exista el inicio del tutor.
  readonly rutaInicioTutor: string | null = null;
  readonly metodos = ['Visual', 'Práctico', 'Teórico', 'Participativo', 'Resolución de ejercicios', 'Debate'];
  readonly informacionAcademica = this.fb.nonNullable.group({
    universidad: ['', [Validators.required, Validators.pattern(/\S/)]],
    carrera: ['', [Validators.required, Validators.pattern(/\S/)]],
  });
  readonly perfilTutor = this.fb.nonNullable.group({
    presentacion: ['', validarPresentacion],
    metodo: ['', Validators.required],
  });

  get caracteres(): number { return this.perfilTutor.controls.presentacion.value.length; }
  get errorMetodo(): boolean {
    const control = this.perfilTutor.controls.metodo;
    return control.invalid && control.touched;
  }

  siguiente(): void {
    if (this.informacionAcademica.invalid) {
      this.informacionAcademica.markAllAsTouched();
      return;
    }
    this.paso = 2;
    this.mensaje = '';
    this.estado = 'formulario';
  }

  atras(): void {
    if (this.estado === 'guardando') return;
    this.paso = 1;
    this.estado = 'formulario';
    this.mensaje = '';
  }

  finalizar(): void {
    if (this.estado === 'guardando') return;
    this.mensaje = '';
    if (this.informacionAcademica.invalid) {
      this.informacionAcademica.markAllAsTouched();
      this.paso = 1;
      return;
    }
    if (this.perfilTutor.invalid) {
      this.perfilTutor.markAllAsTouched();
      return;
    }
    if (this.modoPrevisualizacion) { this.confirmarGuardado(); return; }
    // Pendiente: estado='guardando', solicitud al backend y confirmación real.
    this.estado = 'formulario';
    this.mensaje = 'El guardado aún no está disponible. No se guardó tu configuración.';
  }

  // Conectar únicamente a una respuesta de guardado exitosa del backend.
  // También se usa en el modo de previsualización explícito, sin persistencia.
  confirmarGuardado(): void {
    this.estado = 'exito';
    this.mensaje = '';
  }

  mostrarErrorGuardado(mensaje: string): void {
    this.estado = 'error';
    this.mensajeError = mensaje;
  }
}
