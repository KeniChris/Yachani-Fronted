import {
  booleanAttribute,
  Component,
  DestroyRef,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { PerfilEstudianteService } from '../../../core/services/perfil-estudiante.service';
import {
  ConfiguracionEstudianteRequest,
  ConocimientoAcademicoResponse,
  PerfilAcademicoResponse,
} from '../../../core/models/perfil-estudiante.models';

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
export class ConfiguracionEstudiante implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly perfilService = inject(PerfilEstudianteService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @Input({ transform: booleanAttribute }) previsualizacion = false;
  @Input() estado = 'formulario';

  readonly cargandoPerfil = signal(true);
  readonly errorCarga = signal('');
  readonly guardando = signal(false);
  readonly guardado = signal(false);
  readonly errorGuardado = signal('');

  paso: 1 | 2 = 1;
  temaVacio = false;

  readonly niveles = ['Básico', 'Intermedio', 'Avanzado'];
  readonly modalidades = ['Virtual', 'Presencial', 'Mixta'];
  readonly metodos = ['Visual', 'Práctico', 'Lectura', 'Debate', 'Flashcards'];
  readonly temas: string[] = [];

  readonly cursos = new FormArray([this.crearCurso()], {
    validators: [
      (control: AbstractControl) => {
        const filas = (control as FormArray).controls;

        if (!filas.length) {
          return { sinCursos: true };
        }

        const nombres = filas.map((fila) =>
          this.normalizar(fila.get('nombre')?.value ?? ''),
        );

        const duplicados = nombres.filter(
          (nombre, indice) => nombre && nombres.indexOf(nombre) !== indice,
        );

        return duplicados.length ? { duplicados } : null;
      },
    ],
  });

  readonly academico = new FormGroup({
    universidad: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(120),
      ],
    }),
    carrera: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(/\S/),
        Validators.maxLength(120),
      ],
    }),
    cursos: this.cursos,
  });

  readonly preferencias = new FormGroup({
    modalidad: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    metodo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    tema: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.maxLength(100),
        (control: AbstractControl) => {
          const texto = control.value as string;

          if (texto && !texto.trim()) {
            return { vacio: true };
          }

          return this.temas.some(
            (tema) => this.normalizar(tema) === this.normalizar(texto),
          )
            ? { duplicado: true }
            : null;
        },
      ],
    }),
  });

  readonly errorMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control &&
      control.invalid &&
      (control.dirty || control.touched),
  };

  readonly cursoMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl | null) =>
      !!control &&
      (control.dirty || control.touched) &&
      (control.invalid || this.esDuplicado(control.value)),
  };

  ngOnInit(): void {
    if (this.previsualizacion) {
      this.cargandoPerfil.set(false);
      return;
    }

    this.cargarPerfil();
  }

  cargarPerfil(): void {
    if (!this.authService.estaAutenticado()) {
      void this.router.navigateByUrl('/auth/iniciar-sesion');
      return;
    }

    const usuario = this.authService.usuario();

    if (!usuario) {
      void this.router.navigateByUrl('/auth/iniciar-sesion');
      return;
    }

    if (usuario.tipoUsuario !== 'ESTUDIANTE') {
      void this.router.navigateByUrl('/configuracion-inicial/tutor');
      return;
    }

    this.cargandoPerfil.set(true);
    this.errorCarga.set('');

    this.perfilService
      .consultarPerfil(usuario.idUsuario)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.cargandoPerfil.set(false)),
      )
      .subscribe({
        next: (perfil) => this.rellenarPerfil(perfil),
        error: (error: HttpErrorResponse) => {
          this.errorCarga.set(
            this.mensajeError(error, 'No pudimos cargar tu configuración.'),
          );
        },
      });
  }

  private rellenarPerfil(perfil: PerfilAcademicoResponse): void {
    this.academico.patchValue({
      universidad: perfil.universidad ?? '',
      carrera: perfil.carrera ?? '',
    });

    this.temas.splice(0, this.temas.length, ...(perfil.temasInteres ?? []));

    this.preferencias.patchValue({
      modalidad: perfil.modalidadPreferida ?? '',
      metodo: perfil.metodoPreferido ?? '',
      tema: '',
    });

    this.cursos.clear();

    for (const curso of perfil.conocimientos ?? []) {
      this.cursos.push(this.crearCurso(curso));
    }

    if (!this.cursos.length) {
      this.cursos.push(this.crearCurso());
    }
  }

  private normalizar(valor: string): string {
    return valor.trim().toLocaleLowerCase();
  }

  private crearCurso(curso?: ConocimientoAcademicoResponse) {
    return new FormGroup({
      idConocimiento: new FormControl<number | null>(
        curso?.idConocimiento ?? null,
      ),
      nombre: new FormControl(curso?.curso ?? '', {
        nonNullable: true,
        validators: [Validators.required, Validators.pattern(/\S/)],
      }),
      nivel: new FormControl(curso?.nivel ?? '', {
        nonNullable: true,
        validators: [Validators.required],
      }),
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
    if (this.guardando()) {
      return;
    }

    this.cursos.push(this.crearCurso());
  }

  eliminarCurso(index: number): void {
    if (this.guardando()) {
      return;
    }

    // El curso se retira del backend cuando se guarda la lista completa.
    this.cursos.removeAt(index);
    this.cursos.markAsTouched();
  }

  siguiente(): void {
    this.academico.markAllAsTouched();

    if (this.academico.invalid) {
      return;
    }

    this.paso = 2;
  }

  agregarTema(): void {
    if (this.guardando()) {
      return;
    }

    const control = this.preferencias.controls.tema;
    control.markAsTouched();
    this.temaVacio = !control.value.trim();

    if (this.temaVacio) {
      return;
    }

    control.updateValueAndValidity();

    if (control.invalid) {
      return;
    }

    this.temas.push(control.value.trim());
    control.reset('');
    this.temaVacio = false;
  }

  eliminarTema(index: number): void {
    if (this.guardando()) {
      return;
    }

    this.temas.splice(index, 1);
    this.preferencias.controls.tema.updateValueAndValidity();
  }

  finalizar(): void {
    if (
      this.previsualizacion ||
      this.guardando() ||
      this.guardado() ||
      this.cargandoPerfil() ||
      this.errorCarga()
    ) {
      return;
    }

    this.errorGuardado.set('');
    this.academico.markAllAsTouched();

    if (this.academico.invalid) {
      this.paso = 1;
      return;
    }

    // Incorpora un tema pendiente válido antes de guardar.
    const controlTema = this.preferencias.controls.tema;
    const temaPendiente = controlTema.value.trim();

    if (
      !temaPendiente ||
      this.temas.some(
        (tema) => this.normalizar(tema) === this.normalizar(temaPendiente),
      )
    ) {
      controlTema.reset('');
      this.temaVacio = false;
    } else {
      this.agregarTema();
    }

    this.preferencias.markAllAsTouched();

    if (this.preferencias.invalid) {
      return;
    }

    if (!this.authService.estaAutenticado()) {
      void this.router.navigateByUrl('/auth/iniciar-sesion');
      return;
    }

    const usuario = this.authService.usuario();

    if (!usuario || usuario.tipoUsuario !== 'ESTUDIANTE') {
      void this.router.navigateByUrl('/auth/iniciar-sesion');
      return;
    }

    const academico = this.academico.getRawValue();
    const preferencias = this.preferencias.getRawValue();

    const datos: ConfiguracionEstudianteRequest = {
      universidad: academico.universidad.trim(),
      carrera: academico.carrera.trim(),
      conocimientos: academico.cursos.map((curso) => ({
        curso: curso.nombre.trim(),
        nivel: curso.nivel,
      })),
      modalidadPreferida: preferencias.modalidad,
      metodoPreferido: preferencias.metodo,
      temasInteres: [...this.temas],
    };

    this.guardando.set(true);
    this.academico.disable();
    this.preferencias.disable();

    this.perfilService
      .guardarConfiguracion(datos)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.academico.enable();
          this.preferencias.enable();
          this.guardando.set(false);
        }),
      )
      .subscribe({
        next: (perfil) => {
          this.rellenarPerfil(perfil);

          this.authService.actualizarEstadoConfiguracion(
            perfil.idUsuario,
            perfil.configuracionCompletada,
          );

          if (!perfil.configuracionCompletada) {
            this.errorGuardado.set(
              'El servidor aún indica que tu configuración está incompleta. Revisa los datos requeridos.',
            );
            return;
          }

          this.guardado.set(true);
        },
        error: (error: HttpErrorResponse) => {
          this.errorGuardado.set(
            this.mensajeError(
              error,
              'No pudimos completar el guardado. Vuelve a intentarlo.',
            ),
          );
        },
      });
  }

  private mensajeError(
    error: HttpErrorResponse,
    alternativa: string,
  ): string {
    const cuerpo: unknown = error.error;

    if (
      cuerpo !== null &&
      typeof cuerpo === 'object' &&
      'mensaje' in cuerpo &&
      typeof cuerpo.mensaje === 'string'
    ) {
      return cuerpo.mensaje;
    }

    if (error.status === 0) {
      return 'No pudimos conectar con el servidor.';
    }

    return alternativa;
  }
}