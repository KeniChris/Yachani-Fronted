import { booleanAttribute, Component, Input } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-configuracion-estudiante',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './configuracion-estudiante.html',
  styleUrl: './configuracion-estudiante.css',
})
export class ConfiguracionEstudiante {
  @Input({ transform: booleanAttribute }) previsualizacion = false;
  @Input() estado = 'formulario';
  paso: 1 | 2 = 1;
  readonly niveles = ['Básico', 'Intermedio', 'Avanzado'];
  readonly modalidades = ['Virtual', 'Presencial', 'Mixta'];
  readonly metodos = ['Visual', 'Práctico', 'Lectura', 'Debate', 'Flashcards'];
  readonly temas: string[] = [];

  readonly cursos = new FormArray([this.crearCurso()], {
    validators: [
      (control: AbstractControl) => {
        const filas = (control as FormArray).controls;
        if (!filas.length) return { sinCursos: true };
        const nombres = filas.map((fila) => this.normalizar(fila.get('nombre')?.value ?? ''));
        const duplicados = nombres.filter((nombre, i) => nombre && nombres.indexOf(nombre) !== i);
        return duplicados.length ? { duplicados } : null;
      },
    ],
  });
  readonly academico = new FormGroup({
    universidad: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    carrera: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    cursos: this.cursos,
  });
  readonly preferencias = new FormGroup({
    modalidad: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    metodo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    tema: new FormControl('', {
      nonNullable: true,
      validators: [
        (control: AbstractControl) => {
          const texto = control.value as string;
          if (texto && !texto.trim()) return { vacio: true };
          return this.temas.some((tema) => this.normalizar(tema) === this.normalizar(texto))
            ? { duplicado: true }
            : null;
        },
      ],
    }),
  });
  readonly errorMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control && control.invalid && (control.dirty || control.touched),
  };
  readonly cursoMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control &&
      (control.dirty || control.touched) &&
      (control.invalid || this.esDuplicado(control.value)),
  };

  private normalizar(valor: string): string {
    return valor.trim().toLocaleLowerCase();
  }
  private crearCurso() {
    return new FormGroup({
      nombre: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/\S/)],
      }),
      nivel: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    });
  }
  esDuplicado(nombre: string): boolean {
    return (
      (this.cursos.errors?.['duplicados'] as string[] | undefined)?.includes(
        this.normalizar(nombre),
      ) ?? false
    );
  }
  agregarCurso(): void {
    this.cursos.push(this.crearCurso());
  }
  eliminarCurso(index: number): void {
    this.cursos.removeAt(index);
    this.cursos.markAsTouched();
  }
  siguiente(): void {
    this.academico.markAllAsTouched();
    if (this.academico.invalid) return;
    this.paso = 2;
  }
  agregarTema(): void {
    const control = this.preferencias.controls.tema;
    control.markAsTouched();
    if (!control.value.trim()) {
      control.setErrors({ vacio: true });
      return;
    }
    control.updateValueAndValidity();
    if (control.invalid) return;
    this.temas.push(control.value.trim());
    control.reset('');
  }
  eliminarTema(index: number): void {
    this.temas.splice(index, 1);
    this.preferencias.controls.tema.updateValueAndValidity();
  }
  finalizar(): void {
    this.preferencias.markAllAsTouched();
    if (this.academico.invalid) {
      this.academico.markAllAsTouched();
      this.paso = 1;
      return;
    }
    if (this.preferencias.invalid) return;
    // El guardado y la confirmación reales requieren integración con el backend.
  }
}
