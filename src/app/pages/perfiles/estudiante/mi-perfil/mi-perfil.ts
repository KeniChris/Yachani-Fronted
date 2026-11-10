import {
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
  TemplateRef,
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
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { PerfilEstudianteService } from '../../../../core/services/perfil-estudiante.service';
import {
  ConocimientoAcademicoResponse,
  PerfilAcademicoResponse,
  ResumenResponse,
} from '../../../../core/models/perfil-estudiante.models';
import { crearAvisoTemporal } from '../../../../core/services/aviso-temporal';
import { ResumenService } from '../../../../core/services/resumen.service';

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
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatTabsModule,
  ],
  templateUrl: './mi-perfil.html',
  styleUrls: ['../../perfiles.css', './mi-perfil.css'],
})
export class MiPerfil implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly perfilService = inject(PerfilEstudianteService);
  private readonly resumenService = inject(ResumenService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly cargando = signal(true);
  readonly errorCarga = signal('');
  readonly perfil = signal<PerfilAcademicoResponse | null>(null);

  // Guardado de los diálogos de información académica y preferencias.
  readonly guardando = signal(false);
  readonly errorGuardado = signal('');
  readonly avisoGuardado = crearAvisoTemporal();
  // Curso que se está editando en el diálogo "Editar curso".
  private idCursoEditando: number | null = null;

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

  readonly misResumenes = signal<ResumenResponse[]>([]);
  readonly cargandoResumenes = signal(false);
  readonly errorResumenes = signal('');
  readonly errorDescargaResumen = signal('');
  readonly guardandoResumen = signal(false);
  readonly errorResumen = signal('');
  readonly errorArchivo = signal('');
  readonly avisoResumen = crearAvisoTemporal();

  private resumenEditando: ResumenResponse | null = null;
  private dialogoResumen: MatDialogRef<unknown> | null = null;

  readonly resumenForm = new FormGroup({
    titulo: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(150),
      ],
    }),
  });

  readonly archivoSeleccionado = signal<File | null>(null);

  abrirResumen(
    plantilla: TemplateRef<unknown>,
    resumen: ResumenResponse | null = null,
  ): void {
    if (this.guardandoResumen()) {
      return;
    }

    this.resumenEditando = resumen;
    this.resumenForm.reset({ titulo: resumen?.titulo ?? '' });
    this.archivoSeleccionado.set(null);
    this.errorArchivo.set('');
    this.errorResumen.set('');

    this.dialogoResumen = this.dialog.open(plantilla, {
      width: '600px',
      maxWidth: 'calc(100vw - 32px)',
      data: resumen ? 'reemplazar' : 'publicar',
    });
  }

  seleccionarArchivo(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0];

    if (!archivo) {
      return;
    }

    this.errorResumen.set('');

    const mensaje = !/\.(pdf|png|jpe?g)$/i.test(archivo.name)
      ? 'Selecciona un archivo PDF, PNG, JPG o JPEG.'
      : archivo.size === 0 || archivo.size > 1024 * 1024
        ? 'El archivo debe tener contenido y pesar como máximo 1 MB.'
        : '';

    this.errorArchivo.set(mensaje);
    this.archivoSeleccionado.set(mensaje ? null : archivo);
    input.value = '';
  }

  cargarResumenes(): void {
    const idUsuario = this.perfil()?.idUsuario;

    if (!idUsuario || this.cargandoResumenes() || this.guardandoResumen()) {
      return;
    }

    this.cargandoResumenes.set(true);
    this.errorResumenes.set('');

    this.resumenService
      .listar(idUsuario)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoResumenes.set(false)),
      )
      .subscribe({
        next: (resumenes) => this.misResumenes.set(resumenes),
        error: () => this.errorResumenes.set('No pudimos cargar tus resúmenes.'),
      });
  }

  guardarResumen(): void {
    const idUsuario = this.perfil()?.idUsuario;
    const archivo = this.archivoSeleccionado();
    const dialogo = this.dialogoResumen;

    if (
      !idUsuario ||
      !archivo ||
      !dialogo ||
      this.resumenForm.invalid ||
      this.guardandoResumen()
    ) {
      return;
    }

    const titulo = this.resumenForm.controls.titulo.value.trim();
    const resumen = this.resumenEditando;
    const solicitud = resumen
      ? this.resumenService.reemplazar(idUsuario, resumen.idResumen, titulo, archivo)
      : this.resumenService.publicar(idUsuario, titulo, archivo);

    this.guardandoResumen.set(true);
    this.errorResumen.set('');
    this.resumenForm.disable();
    dialogo.disableClose = true;

    solicitud
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.guardandoResumen.set(false);
          this.resumenForm.enable();
          dialogo.disableClose = false;
        }),
      )
      .subscribe({
        next: (guardado) => {
          this.misResumenes.update((lista) =>
            resumen
              ? lista.map((item) =>
                  item.idResumen === guardado.idResumen ? guardado : item,
                )
              : [guardado, ...lista],
          );

          dialogo.close();
          this.avisoResumen.mostrar(resumen ? 'reemplazado' : 'publicado');
        },
        error: (error: HttpErrorResponse) =>
          this.errorResumen.set(
            error.error?.mensaje || 'No pudimos guardar el resumen. Vuelve a intentarlo.',
          ),
      });
  }

  descargarResumen(resumen: ResumenResponse): void {
    const idUsuario = this.perfil()?.idUsuario;

    if (!idUsuario) {
      return;
    }

    this.errorDescargaResumen.set('');

    this.resumenService
      .descargar(idUsuario, resumen)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: () => this.errorDescargaResumen.set('No pudimos descargar el archivo.'),
      });
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

  prepararAgregarCurso(): void {
    this.errorGuardado.set('');
    this.agregarCursoForm.reset();
  }

  prepararEditarCurso(curso: ConocimientoAcademicoResponse): void {
    this.errorGuardado.set('');
    this.idCursoEditando = curso.idConocimiento;
    this.editarCursoForm.reset({
      curso: curso.curso,
      nivel: curso.nivel,
    });
  }

  agregarCurso(): void {
    const usuario = this.authService.usuario();

    if (!usuario || this.agregarCursoForm.invalid || this.guardando()) {
      return;
    }

    const { curso, nivel } = this.agregarCursoForm.getRawValue();

    this.guardando.set(true);
    this.errorGuardado.set('');

    this.perfilService
      .registrarCurso(usuario.idUsuario, { curso: curso.trim(), nivel })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false)),
      )
      .subscribe({
        next: (nuevo) => {
          this.perfil.update((datos) =>
            datos
              ? { ...datos, conocimientos: [...datos.conocimientos, nuevo] }
              : datos,
          );
          this.dialog.closeAll();
          this.avisoGuardado.mostrar();
        },
        error: (error: HttpErrorResponse) => this.mostrarErrorGuardado(error),
      });
  }

  guardarCurso(): void {
    const usuario = this.authService.usuario();
    const idConocimiento = this.idCursoEditando;

    if (
      !usuario ||
      idConocimiento === null ||
      this.editarCursoForm.invalid ||
      this.guardando()
    ) {
      return;
    }

    const { curso, nivel } = this.editarCursoForm.getRawValue();

    this.guardando.set(true);
    this.errorGuardado.set('');

    this.perfilService
      .actualizarCurso(usuario.idUsuario, idConocimiento, {
        curso: curso.trim(),
        nivel,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.guardando.set(false)),
      )
      .subscribe({
        next: (actualizado) => {
          this.perfil.update((datos) =>
            datos
              ? {
                  ...datos,
                  conocimientos: datos.conocimientos.map((c) =>
                    c.idConocimiento === actualizado.idConocimiento
                      ? actualizado
                      : c,
                  ),
                }
              : datos,
          );
          this.dialog.closeAll();
          this.avisoGuardado.mostrar();
        },
        error: (error: HttpErrorResponse) => this.mostrarErrorGuardado(error),
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
          this.cargarResumenes();

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