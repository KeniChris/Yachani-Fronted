import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { catchError, distinctUntilChanged, forkJoin, map, of, switchMap } from 'rxjs';
import {
  PerfilTutorPublicoResponse,
  ResenaResponse,
} from '../../../../core/models/resena.models';
import { AuthService } from '../../../../core/services/auth.service';
import {
  formatearPromedio,
  inicialesDe,
  ResenaService,
} from '../../../../core/services/resena.service';

@Component({
  selector: 'app-resenas-tutor',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './resenas-tutor.html',
  styleUrls: ['../../perfiles.css', './resenas-tutor.css'],
})
export class ResenasTutor implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly resenaService = inject(ResenaService);
  private readonly authService = inject(AuthService);

  readonly estrellas = [1, 2, 3, 4, 5];
  readonly cargando = signal(true);
  readonly datos = signal<{
    tutor: PerfilTutorPublicoResponse;
    resenas: ResenaResponse[];
  } | null>(null);
  readonly formatearPromedio = formatearPromedio;
  readonly inicialesDe = inicialesDe;

  // Solo los estudiantes pueden escribir reseñas.
  get esEstudiante(): boolean {
    return this.authService.usuario()?.tipoUsuario === 'ESTUDIANTE';
  }

  readonly resenaForm = new FormGroup({
    calificacion: new FormControl(5, { nonNullable: true, validators: [Validators.required] }),
    comentario: new FormControl('Explica con claridad y resuelve mis dudas.', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
  });
  constructor(public readonly dialog: MatDialog) {}

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((parametros) => Number(parametros.get('idTutor'))),
        distinctUntilChanged(),
        switchMap((idTutor) => {
          this.cargando.set(true);
          this.datos.set(null);

          if (!Number.isSafeInteger(idTutor) || idTutor <= 0) {
            return of(null);
          }

          return forkJoin({
            tutor: this.resenaService.consultarPerfilTutor(idTutor),
            resenas: this.resenaService.listar(idTutor),
          }).pipe(catchError(() => of(null)));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((datos) => {
        this.datos.set(datos);
        this.cargando.set(false);
      });
  }
}
