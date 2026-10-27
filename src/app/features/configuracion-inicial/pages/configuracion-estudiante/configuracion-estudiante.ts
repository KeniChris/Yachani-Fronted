import { Component, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

type CursoForm = FormGroup<{ curso: FormControl<string>; nivel: FormControl<string> }>;
const normalizar = (valor: string): string => valor.trim().toLocaleLowerCase('es');
const obligatorio = (control: AbstractControl<string>): ValidationErrors | null =>
  control.value.trim() ? null : { required: true };

function validarCursos(control: AbstractControl): ValidationErrors | null {
  const cursos = control as FormArray<CursoForm>;
  if (!cursos.length) return { sinCursos: true };
  const nombres = cursos.controls.map(fila => normalizar(fila.controls.curso.value)).filter(Boolean);
  return new Set(nombres).size !== nombres.length ? { duplicados: true } : null;
}

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  selector: 'app-configuracion-estudiante',
  styleUrls: ['../configuracion-tutor/configuracion-tutor.css', './configuracion-estudiante.css'],
  templateUrl: './configuracion-estudiante.html',
})
export class ConfiguracionEstudiante {
  private readonly fb = inject(FormBuilder);
  // Previsualización local: nunca guarda datos ni completa un perfil real.
  readonly modoPrevisualizacion = false;
  readonly rutaInicioEstudiante: string | null = null; // Pendiente de una ruta real.
  paso: 1 | 2 = 1;
  estado: 'formulario' | 'guardando' | 'error' | 'exito' = 'formulario';
  mensaje = '';
  mensajeError = 'No pudimos guardar tu configuración. Inténtalo nuevamente.';
  readonly niveles: string[] = ['Básico', 'Intermedio', 'Avanzado'];
  readonly modalidades: string[] = ['Virtual', 'Presencial', 'Mixta'];
  readonly metodos: string[] = ['Visual', 'Práctico', 'Lectura', 'Debate', 'Flashcards'];
  readonly cursos = new FormArray<CursoForm>([this.crearCurso()], validarCursos);
  readonly perfilAcademico = this.fb.nonNullable.group({
    universidad: ['', obligatorio],
    carrera: ['', obligatorio],
    cursos: this.cursos,
  });
  readonly preferencias = this.fb.nonNullable.group({
    modalidad: ['', Validators.required],
    metodo: ['', Validators.required],
  });
  readonly tema = new FormControl('', { nonNullable: true });
  temas: string[] = [];
  readonly errorCurso: ErrorStateMatcher = {
    isErrorState: (control, form) => !!control &&
      (control.invalid || this.esDuplicado(control.value ?? '')) &&
      (control.touched || !!form?.submitted),
  };

  private crearCurso(): CursoForm {
    return this.fb.nonNullable.group({ curso: ['', obligatorio], nivel: ['', obligatorio] });
  }

  esDuplicado(nombre: string): boolean {
    const normalizado = normalizar(nombre);
    return !!normalizado && this.cursos.controls.filter(fila => normalizar(fila.controls.curso.value) === normalizado).length > 1;
  }

  agregarCurso(): void {
    this.cursos.push(this.crearCurso());
  }

  eliminarCurso(indice: number): void {
    this.cursos.removeAt(indice);
    this.cursos.markAsTouched();
  }

  siguiente(): void {
    if (this.perfilAcademico.invalid) {
      this.perfilAcademico.markAllAsTouched();
      return;
    }
    this.paso = 2;
    this.estado = 'formulario';
    this.mensaje = '';
  }

  atras(): void {
    if (this.estado === 'guardando') return;
    this.paso = 1;
    this.estado = 'formulario';
    this.mensaje = '';
  }

  errorPreferencia(campo: 'modalidad' | 'metodo'): boolean {
    const control = this.preferencias.controls[campo];
    return control.invalid && control.touched;
  }

  agregarTema(): boolean {
    const valor = this.tema.value.trim();
    this.tema.markAsTouched();
    if (!valor) { this.tema.setErrors({ vacio: true }); return false; }
    if (this.temas.some(tema => normalizar(tema) === normalizar(valor))) {
      this.tema.setErrors({ duplicado: true });
      return false;
    }
    this.temas = [...this.temas, valor];
    this.tema.reset();
    this.mensaje = '';
    return true;
  }

  limpiarErrorTema(): void { this.tema.setErrors(null); }

  eliminarTema(indice: number): void {
    this.temas = this.temas.filter((_, i) => i !== indice);
    this.limpiarErrorTema();
  }

  finalizar(): void {
    if (this.estado === 'guardando') return;
    this.mensaje = '';
    if (this.perfilAcademico.invalid) {
      this.perfilAcademico.markAllAsTouched();
      this.paso = 1;
      return;
    }
    this.preferencias.markAllAsTouched();
    // Evitar perder un tema escrito que todavía no se agregó.
    if (this.tema.value && !this.agregarTema()) return;
    if (this.preferencias.invalid) return;
    if (this.modoPrevisualizacion) { this.confirmarGuardado(); return; }
    // Pendiente: solicitud real al backend y estado='guardando'. Los niveles,
    // modalidad y método son String, sin enum ni listas para selecciones únicas.
    this.estado = 'formulario';
    this.mensaje = 'El guardado aún no está disponible. No se guardó tu configuración.';
  }

  // Invocar únicamente tras confirmar el guardado real o en la vista previa explícita.
  confirmarGuardado(): void { this.estado = 'exito'; this.mensaje = ''; }

  mostrarErrorGuardado(mensaje: string): void { this.estado = 'error'; this.mensajeError = mensaje; }
}
