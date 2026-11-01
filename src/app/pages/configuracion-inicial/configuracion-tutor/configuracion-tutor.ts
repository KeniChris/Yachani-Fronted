import { booleanAttribute, Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-configuracion-tutor',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './configuracion-tutor.html',
  styleUrl: './configuracion-tutor.css',
})
export class ConfiguracionTutor {
  @Input({ transform: booleanAttribute }) previsualizacion = false;
  @Input() estado = 'formulario';
  paso: 1 | 2 = 1;
  readonly metodos = [
    'Visual',
    'Práctico',
    'Teórico',
    'Participativo',
    'Resolución de ejercicios',
    'Debate',
  ];
  readonly academico = new FormGroup({
    universidad: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    carrera: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
  });
  readonly perfil = new FormGroup({
    presentacion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/), Validators.maxLength(500)],
    }),
    metodo: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly errorMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control && control.invalid && (control.dirty || control.touched),
  };
  siguiente(): void {
    this.academico.markAllAsTouched();
    if (this.academico.invalid) return;
    this.paso = 2;
  }
  finalizar(): void {
    this.perfil.markAllAsTouched();
    if (this.academico.invalid) {
      this.academico.markAllAsTouched();
      this.paso = 1;
      return;
    }
    if (this.perfil.invalid) return;
    // Guardado y confirmación pendientes del backend; no se cambia el estado visual.
  }
}
