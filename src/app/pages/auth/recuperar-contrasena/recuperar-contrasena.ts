import { booleanAttribute, Component, Input, OnChanges } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  host: { class: 'recovery-page' },
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule],
  templateUrl: './recuperar-contrasena.html',
  styleUrl: './recuperar-contrasena.css',
})
export class RecuperarContrasena implements OnChanges {
  @Input({ transform: booleanAttribute }) previsualizacion = false;
  @Input() estado = 'formulario';
  readonly form = new FormGroup({
    correo: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[^@]+@upc\.edu\.pe$/),
      ],
    }),
  });
  readonly errorMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control && control.invalid && (control.dirty || control.touched),
  };
  ngOnChanges(): void {
    if (this.previsualizacion && this.estado === 'error') this.form.markAllAsTouched();
  }
  enviar(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return; /* Pendiente del backend. */
  }
}
