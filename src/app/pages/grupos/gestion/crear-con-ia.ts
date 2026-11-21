import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { METODOS_ESTUDIO_GRUPO } from '../../../core/models/grupo-estudio.models';
import { AuthService } from '../../../core/services/auth.service';
import { GrupoEstudioService } from '../../../core/services/grupo-estudio.service';
import { errorApi, textoRequerido } from '../../../core/services/recursos-ui';
import { BorradorGrupoIa, TutorIaService } from '../../../core/services/tutor-ia.service';

const FORMATOS_AUDIO = [
  { tipo: 'audio/webm', nombre: 'instruccion.webm' },
  { tipo: 'audio/mp4', nombre: 'instruccion.mp4' },
];
const MAXIMO_AUDIO = 10 * 1024 * 1024;

type EstadoIa = 'permiso' | 'grabando' | 'transcribiendo' | 'generando';

@Component({
  selector: 'app-crear-con-ia',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './crear-con-ia.html',
  styleUrls: ['../grupos.css', './crear-con-ia.css'],
})
export class CrearConIa {
  private readonly auth = inject(AuthService);
  private readonly ia = inject(TutorIaService);
  private readonly grupos = inject(GrupoEstudioService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private grabadora?: MediaRecorder;
  private microfono?: MediaStream;

  readonly esTutor = computed(() => this.auth.usuario()?.tipoUsuario === 'TUTOR');
  readonly estadoIa = signal<EstadoIa | null>(null);
  readonly estadoCreacion = signal<'guardando' | 'creado' | null>(null);
  readonly ocupado = computed(() => this.estadoIa() !== null || this.estadoCreacion() !== null);
  readonly mensajeIa = signal('');
  readonly errorIa = signal('');
  readonly errorCrear = signal('');

  readonly metodos = METODOS_ESTUDIO_GRUPO;
  readonly maximoTemas = 3;
  readonly maximoInstruccion = 2000;
  readonly instruccion = new FormControl('', {
    nonNullable: true,
    validators: [textoRequerido, Validators.maxLength(this.maximoInstruccion)],
  });
  readonly temas = new FormArray<FormControl<string>>([]);
  readonly form = new FormGroup({
    nombre: new FormControl('', {
      nonNullable: true,
      validators: [textoRequerido, Validators.maxLength(100)],
    }),
    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [textoRequerido, Validators.maxLength(500)],
    }),
    metodoEstudio: new FormControl('', { nonNullable: true, validators: Validators.required }),
    capacidadMaxima: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(2),
      Validators.max(2147483647),
      Validators.pattern(/^\d+$/),
    ]),
    temas: this.temas,
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.liberarMicrofono());
  }

  generarBorrador(): void {
    if (this.ocupado()) return;
    if (this.instruccion.invalid) {
      this.instruccion.markAsTouched();
      return;
    }

    this.mensajeIa.set('');
    this.errorIa.set('');
    this.estadoIa.set('generando');
    this.form.disable();

    this.ia
      .generarBorrador(this.instruccion.value.trim())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.form.enable();
          this.estadoIa.set(null);
        }),
      )
      .subscribe({
        next: (borrador) => this.aplicarBorrador(borrador),
        error: (error: unknown) =>
          this.errorIa.set(
            this.mensajeDeError(
              error,
              'No pudimos generar el borrador. Inténtalo de nuevo o completa el formulario.',
            ),
          ),
      });
  }

  agregarTema(): void {
    if (this.ocupado() || this.temas.length >= this.maximoTemas) return;
    this.temas.push(this.controlTema(''));
  }

  quitarTema(indice: number): void {
    if (this.ocupado()) return;
    this.temas.removeAt(indice);
  }

  async iniciarGrabacion(): Promise<void> {
    if (this.ocupado()) return;
    this.errorIa.set('');
    this.mensajeIa.set('');

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      this.errorIa.set(
        'El micrófono requiere una página segura y un navegador compatible. Puedes escribir la instrucción.',
      );
      return;
    }
    const formato = FORMATOS_AUDIO.find(({ tipo }) => MediaRecorder.isTypeSupported(tipo));
    if (!formato) {
      this.errorIa.set(
        'Este navegador no puede grabar en un formato compatible. Puedes escribir la instrucción.',
      );
      return;
    }

    this.estadoIa.set('permiso');
    try {
      const microfono = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (this.destroyRef.destroyed) {
        microfono.getTracks().forEach((pista) => pista.stop());
        return;
      }

      this.microfono = microfono;
      const grabadora = new MediaRecorder(microfono, { mimeType: formato.tipo });
      this.grabadora = grabadora;
      const partes: Blob[] = [];

      grabadora.ondataavailable = (evento) => partes.push(evento.data);
      grabadora.onstop = () => {
        this.liberarMicrofono();
        this.transcribir(
          new Blob(partes, { type: grabadora.mimeType || formato.tipo }),
          formato.nombre,
        );
      };
      grabadora.onerror = () => {
        this.liberarMicrofono();
        this.estadoIa.set(null);
        this.errorIa.set('No pudimos terminar la grabación. Inténtalo de nuevo.');
      };

      grabadora.start();
      this.estadoIa.set('grabando');
    } catch {
      this.liberarMicrofono();
      if (this.destroyRef.destroyed) return;
      this.estadoIa.set(null);
      this.errorIa.set('No pudimos acceder al micrófono. Revisa los permisos del navegador.');
    }
  }

  detenerGrabacion(): void {
    if (this.grabadora?.state !== 'recording') return;
    this.estadoIa.set('transcribiendo');
    this.grabadora.stop();
  }

  crearGrupo(): void {
    if (this.ocupado()) return;
    this.errorCrear.set('');

    const datos = this.form.getRawValue();
    if (this.form.invalid || datos.capacidadMaxima === null) {
      this.form.markAllAsTouched();
      this.errorCrear.set('Completa los campos requeridos para crear el grupo.');
      return;
    }
    const tutor = this.auth.usuario();
    if (tutor?.tipoUsuario !== 'TUTOR') {
      this.errorCrear.set('Inicia sesión como tutor para crear el grupo.');
      return;
    }

    this.estadoCreacion.set('guardando');
    this.form.disable();

    this.grupos
      .crearGrupo({
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion.trim(),
        metodoEstudio: datos.metodoEstudio,
        capacidadMaxima: datos.capacidadMaxima,
        idCreador: tutor.idUsuario,
        temasIniciales: datos.temas.map((tema) => tema.trim()).filter(Boolean),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.estadoCreacion.set('creado');
          void this.router.navigate(['/grupos/gestion'], { queryParams: { grupos: 'creado' } });
        },
        error: (error: unknown) => {
          this.errorCrear.set(errorApi(error));
          this.form.enable();
          this.estadoCreacion.set(null);
        },
      });
  }

  private aplicarBorrador(borrador: BorradorGrupoIa): void {
    const actual = this.form.getRawValue();
    this.form.patchValue({
      nombre: borrador.nombre ?? actual.nombre,
      descripcion: borrador.descripcion ?? actual.descripcion,
      metodoEstudio: borrador.metodoEstudio ?? actual.metodoEstudio,
      capacidadMaxima: borrador.capacidadMaxima ?? actual.capacidadMaxima,
    });
    const sugeridos = borrador.temasSugeridos?.slice(0, this.maximoTemas) ?? [];
    if (sugeridos.length) {
      this.temas.clear();
      sugeridos.forEach((nombre) => this.temas.push(this.controlTema(nombre)));
    }
    this.mensajeIa.set('Borrador listo. Revisa los datos y completa los campos pendientes.');
  }

  private controlTema(nombre: string): FormControl<string> {
    return new FormControl(nombre, {
      nonNullable: true,
      validators: Validators.maxLength(100),
    });
  }

  private transcribir(audio: Blob, nombre: string): void {
    if (!audio.size || audio.size > MAXIMO_AUDIO) {
      this.estadoIa.set(null);
      this.errorIa.set(
        audio.size
          ? 'La grabación supera los 10 MB. Dicta una instrucción más breve.'
          : 'La grabación está vacía. Inténtalo de nuevo.',
      );
      return;
    }
    this.estadoIa.set('transcribiendo');
    this.ia
      .transcribir(audio, nombre)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.estadoIa.set(null)),
      )
      .subscribe({
        next: ({ texto }) => {
          const instruccion = this.instruccion.value.trim();
          this.instruccion.setValue([instruccion, texto].filter(Boolean).join(' '));
          this.instruccion.markAsTouched();
          this.mensajeIa.set('Voz transcrita. Revisa el texto y genera el borrador.');
        },
        error: (error: unknown) =>
          this.errorIa.set(
            this.mensajeDeError(
              error,
              'No pudimos transcribir la voz. Puedes volver a grabar o escribir la instrucción.',
            ),
          ),
      });
  }

  private liberarMicrofono(): void {
    if (this.grabadora) {
      this.grabadora.ondataavailable = null;
      this.grabadora.onstop = null;
      this.grabadora.onerror = null;
      if (this.grabadora.state !== 'inactive') this.grabadora.stop();
      this.grabadora = undefined;
    }
    this.microfono?.getTracks().forEach((pista) => pista.stop());
    this.microfono = undefined;
  }

  private mensajeDeError(error: unknown, mensaje: string): string {
    return error instanceof HttpErrorResponse && error.status === 503 ? mensaje : errorApi(error);
  }
}
