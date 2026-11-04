import {
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { PerfilEstudianteService } from '../../../../core/services/perfil-estudiante.service';
import { PerfilAcademicoResponse } from '../../../../core/models/perfil-estudiante.models';
import { crearAvisoTemporal } from '../../../../core/services/aviso-temporal';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatTabsModule,
  ],
  templateUrl: './mi-perfil.html',
  styleUrls: ['../../perfiles.css', './mi-perfil.css'],
})
export class MiPerfil implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly perfilService = inject(PerfilEstudianteService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly perfil = signal<PerfilAcademicoResponse | null>(null);

  // Guardado de los diálogos de información académica y preferencias.
  readonly guardando = signal(false);
  readonly errorGuardado = signal('');
  readonly avisoGuardado = crearAvisoTemporal();

  get usuario() {
    return this.authService.usuario();
  }

  get iniciales(): string {
    const datos = this.perfil() ?? this.usuario;

    if (!datos) {
      return '';
    }

    const nombre = Array.from(datos.nombres.trim())[0] ?? '';
    const apellido = Array.from(datos.apellidos.trim())[0] ?? '';

    return `${nombre}${apellido}`.toLocaleUpperCase();
  }

  readonly academicoForm = new FormGroup({
    universidad: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    carrera: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly metodos = [
    'Visual',
    'Práctico',
    'Lectura',
    'Debate',
    'Flashcards',
    'Teórico',
    'Participativo',
    'Resolución de ejercicios',
  ];

  readonly modalidades = ['Virtual', 'Presencial', 'Mixta', 'Híbrida'];

  readonly preferenciasForm = new FormGroup({
    metodo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    modalidad: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    temas: new FormControl('', {
      nonNullable: true,
    }),
  });

  readonly niveles = ['Básico', 'Intermedio', 'Avanzado'];

  readonly agregarCursoForm = new FormGroup({
    curso: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    nivel: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  readonly editarCursoForm = new FormGroup({
    curso: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    nivel: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  // La consulta y publicación de resúmenes se integran por separado.
  @Input() resumenes = 'vacio';
  @Input() archivoResumen = 'valido';

  readonly misResumenes: {
    titulo: string;
    archivo: string;
    detalle: string;
  }[] = [];

  readonly resumenForm = new FormGroup({
    titulo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    archivo: new FormControl(''),
  });

  readonly archivoSeleccionado = signal<File | null>(null);

  prepararResumen(): void {
    this.resumenForm.reset();
    this.archivoSeleccionado.set(null);
  }

  seleccionarArchivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    this.archivoSeleccionado.set(input.files?.[0] ?? null);
  }

  constructor(public readonly dialog: MatDialog) {}

  ngOnInit(): void {
    this.cargarPerfil();
  }

  // Al abrir cada diálogo se restauran los datos guardados del perfil,
  // para descartar lo que se escribió y no se guardó.
  prepararAcademico(): void {
    const datos = this.perfil();

    this.errorGuardado.set('');
    this.academicoForm.reset({
      universidad: datos?.universidad ?? '',
      carrera: datos?.carrera ?? '',
    });
  }

  prepararPreferencias(): void {
    const datos = this.perfil();

    this.errorGuardado.set('');
    this.preferenciasForm.reset({
      metodo: datos?.metodoPreferido ?? '',
      modalidad: datos?.modalidadPreferida ?? '',
      temas: (datos?.temasInteres ?? []).join(', '),
    });
  }

  guardarAcademico(): void {
    const usuario = this.authService.usuario();

    if (!usuario || this.academicoForm.invalid || this.guardando()) {
      return;
    }

    const { universidad, carrera } = this.academicoForm.getRawValue();

    this.guardando.set(true);
    this.errorGuardado.set('');

    this.perfilService
      .guardarAcademico(usuario.idUsuario, {
        universidad: universidad.trim(),
        carrera: carrera.trim(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false)),
      )
      .subscribe({
        next: (datos) => this.aplicarPerfilGuardado(datos),
        error: (error: HttpErrorResponse) => this.mostrarErrorGuardado(error),
      });
  }

  guardarPreferencias(): void {
    const usuario = this.authService.usuario();

    if (!usuario || this.preferenciasForm.invalid || this.guardando()) {
      return;
    }

    const { metodo, modalidad, temas } = this.preferenciasForm.getRawValue();

    this.guardando.set(true);
    this.errorGuardado.set('');

    this.perfilService
      .guardarPreferencias(usuario.idUsuario, {
        modalidadPreferida: modalidad,
        metodoPreferido: metodo,
        temasInteres: temas
          .split(',')
          .map((tema) => tema.trim())
          .filter((tema) => tema.length > 0),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false)),
      )
      .subscribe({
        next: (datos) => this.aplicarPerfilGuardado(datos),
        error: (error: HttpErrorResponse) => this.mostrarErrorGuardado(error),
      });
  }

  private aplicarPerfilGuardado(datos: PerfilAcademicoResponse): void {
    this.perfil.set(datos);

    this.academicoForm.reset({
      universidad: datos.universidad ?? '',
      carrera: datos.carrera ?? '',
    });

    this.preferenciasForm.reset({
      metodo: datos.metodoPreferido ?? '',
      modalidad: datos.modalidadPreferida ?? '',
      temas: (datos.temasInteres ?? []).join(', '),
    });

    this.dialog.closeAll();
    this.avisoGuardado.mostrar();
  }

  private mostrarErrorGuardado(error: HttpErrorResponse): void {
    this.errorGuardado.set(
      error.error?.mensaje ??
        (error.status === 0
          ? 'No pudimos conectar con el servidor.'
          : 'No pudimos guardar los cambios. Vuelve a intentarlo.'),
    );
  }

  cargarPerfil(): void {
    const usuario = this.authService.usuario();

    if (!usuario) {
      void this.router.navigateByUrl('/auth/iniciar-sesion');
      return;
    }

    if (usuario.tipoUsuario !== 'ESTUDIANTE') {
      void this.router.navigateByUrl('/perfiles?rol=tutor');
      return;
    }

    this.cargando.set(true);
    this.errorCarga.set('');

    this.perfilService
      .consultarPerfil(usuario.idUsuario)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe({
        next: (datos) => {
          this.perfil.set(datos);

          this.academicoForm.reset({
            universidad: datos.universidad ?? '',
            carrera: datos.carrera ?? '',
          });

          this.preferenciasForm.reset({
            metodo: datos.metodoPreferido ?? '',
            modalidad: datos.modalidadPreferida ?? '',
            temas: (datos.temasInteres ?? []).join(', '),
          });
        },
        error: (error: HttpErrorResponse) => {
          this.errorCarga.set(
            error.status === 0
              ? 'No pudimos conectar con el servidor.'
              : 'No pudimos cargar tu perfil. Vuelve a intentarlo.',
          );
        },
      });
  }
}