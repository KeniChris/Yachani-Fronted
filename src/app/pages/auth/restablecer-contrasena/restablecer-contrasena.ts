import { booleanAttribute, Component, Input, OnChanges } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-restablecer-contrasena',
  standalone: true,
  host: { class: 'recovery-page' },
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatInputModule, MatFormFieldModule],
  templateUrl: './restablecer-contrasena.html',
  styleUrl: './restablecer-contrasena.css',
})
export class RestablecerContrasena implements OnChanges {
  @Input({ transform: booleanAttribute }) previsualizacion = false;
  @Input() estado = 'formulario';
  mostrarContrasena = false;
  mostrarConfirmacion = false;
  readonly form = new FormGroup(
    {
      contrasena: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmacion: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    },
    {
      validators: (group: AbstractControl) =>
        group.get('confirmacion')?.value &&
        group.get('contrasena')?.value !== group.get('confirmacion')?.value
          ? { diferentes: true }
          : null,
    },
  );
  readonly errorMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control && control.invalid && (control.dirty || control.touched),
  };
  readonly confirmacionMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control &&
      (control.dirty || control.touched) &&
      (control.invalid || this.form.hasError('diferentes')),
  };
  ngOnChanges(): void {
    if (this.previsualizacion && this.estado === 'error') this.form.markAllAsTouched();
  }
  guardar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return; /* El cambio real requiere confirmación del backend. */
  }
}
