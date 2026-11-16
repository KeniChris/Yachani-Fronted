import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
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
import {
  catchError,
  distinctUntilChanged,
  finalize,
  forkJoin,
  map,
  of,
  switchMap,
} from 'rxjs';
import {
  PerfilTutorPublicoResponse,
  ResenaResponse,
} from '../../../../core/models/resena.models';
import { AuthService } from '../../../../core/services/auth.service';
import { crearAvisoTemporal } from '../../../../core/services/aviso-temporal';
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

  @ViewChild('resenaDialog', { static: true })
  private readonly resenaDialog!: TemplateRef<unknown>;

  private idTutorActual = 0;

  readonly estrellas = [1, 2, 3, 4, 5];
  readonly cargando = signal(true);
  readonly datos = signal<{
    tutor: PerfilTutorPublicoResponse;
    resenas: ResenaResponse[];
  } | null>(null);
  readonly publicando = signal(false);
  readonly errorPublicar = signal('');
  readonly avisoPublicada = crearAvisoTemporal();
  readonly formatearPromedio = formatearPromedio;
  readonly inicialesDe = inicialesDe;

  readonly resenaForm = new FormGroup({
    calificacion: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1), Validators.max(5)],
    }),
    comentario: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(500),
      ],
    }),
  });

  // Solo los estudiantes pueden escribir reseñas.
  get esEstudiante(): boolean {
    return this.authService.usuario()?.tipoUsuario === 'ESTUDIANTE';
  }

  constructor(public readonly dialog: MatDialog) {}

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((parametros) => Number(parametros.get('idTutor'))),
        distinctUntilChanged(),
        switchMap((idTutor) => {
          this.idTutorActual = idTutor;
          this.cargando.set(true);
          this.datos.set(null);

          if (!Number.isSafeInteger(idTutor) || idTutor <= 0) {
            return of(null);
          }

          return this.consultar(idTutor);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((datos) => {
        this.datos.set(datos);
        this.cargando.set(false);

        // Desde el perfil del tutor, "Escribir reseña" llega con ?escribir=si
        // y abre el formulario directamente.
        const escribir = this.route.snapshot.queryParamMap.get('escribir') === 'si';

        if (datos && escribir && this.esEstudiante) {
          this.abrirDialogo();
        }
      });
  }

  abrirDialogo(): void {
    this.resenaForm.reset({ calificacion: null, comentario: '' });
    this.errorPublicar.set('');
    this.dialog.open(this.resenaDialog, {
      width: '600px',
      maxWidth: 'calc(100vw - 32px)',
    });
  }

  elegirCalificacion(estrella: number): void {
    this.resenaForm.controls.calificacion.setValue(estrella);
    this.resenaForm.controls.calificacion.markAsTouched();
  }

  publicar(): void {
    const idTutor = this.idTutorActual;

    if (this.publicando()) {
      return;
    }

    this.resenaForm.markAllAsTouched();

    if (this.resenaForm.invalid) {
      return;
    }

    const { calificacion, comentario } = this.resenaForm.getRawValue();

    this.publicando.set(true);
    this.errorPublicar.set('');

    this.resenaService
      .publicar(idTutor, {
        calificacion: calificacion ?? 0,
        comentario: comentario.trim(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.publicando.set(false)),
      )
      .subscribe({
        next: () => {
          this.dialog.closeAll();
          this.avisoPublicada.mostrar();
          // Vuelve a pedir el promedio y la lista para que aparezca la reseña nueva.
          this.consultar(idTutor)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((datos) => {
              if (datos && this.idTutorActual === idTutor) {
                this.datos.set(datos);
              }
            });
        },
        error: (error: HttpErrorResponse) => {
          // 403: no pertenece a un grupo del tutor. 409: ya lo reseñó.
          // El backend envía el motivo en error.error.mensaje.
          this.errorPublicar.set(
            error.error?.mensaje ??
              (error.status === 0
                ? 'No pudimos conectar con el servidor.'
                : 'No pudimos publicar tu reseña. Vuelve a intentarlo.'),
          );
        },
      });
  }

  private consultar(idTutor: number) {
    return forkJoin({
      tutor: this.resenaService.consultarPerfilTutor(idTutor),
      resenas: this.resenaService.listar(idTutor),
    }).pipe(catchError(() => of(null)));
  }
}
