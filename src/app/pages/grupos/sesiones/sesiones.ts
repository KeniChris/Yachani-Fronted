import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';

@Component({
  selector: 'app-sesiones',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTimepickerModule,
  ],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }],
  templateUrl: './sesiones.html',
  styleUrl: './sesiones.css',
})
export class Sesiones {
  // Variante visual mediante ?rol=tutor. Vistas de Figma mediante ?vista= (programar, editar, detalle)
  // y estados mediante ?sesiones= (vacio, programada, actualizada, cancelada).
  @Input() rol = 'estudiante';
  @Input() sesiones = '';
  // Las fechas anteriores a hoy muestran el error de S05.
  readonly hoy = new Date();
  // Programar (S04) empieza vacío; editar (S07) muestra los datos actuales de la sesión.
  readonly form = new FormGroup({
    tema: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    descripcion: new FormControl('', { nonNullable: true, validators: Validators.maxLength(500) }),
    fecha: new FormControl<Date | null>(null, Validators.required),
    hora: new FormControl<Date | null>(null, Validators.required),
    duracion: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(15),
      Validators.max(480),
    ]),
    lugar: new FormControl('', { nonNullable: true, validators: Validators.maxLength(200) }),
  });
  private vistaActual = '';
  @Input() set vista(valor: string) {
    this.vistaActual = valor || '';
    this.form.reset(
      valor === 'editar'
        ? {
            tema: 'Repaso de derivadas',
            descripcion: 'Repasaremos conceptos y resolveremos ejercicios paso a paso.',
            fecha: new Date(2026, 10, 30),
            hora: new Date(2026, 10, 30, 19, 0),
            duracion: 60,
            lugar: 'meet.google.com/abc-defg-hij',
          }
        : {},
    );
  }
  get vista() {
    return this.vistaActual;
  }
  constructor(public readonly dialog: MatDialog) {}
}
