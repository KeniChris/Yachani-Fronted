import { Component, computed, DestroyRef, inject, Input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { SesionEstudioService } from '../../../core/services/sesion-estudio.service';
import { SesionEstudioResponse } from '../../../core/models/sesion-estudio.models';
import { AuthService } from '../../../core/services/auth.service';
import {
  GrupoEstudioService,
  ID_GRUPO_DEMO,
  idGrupoDesdeSlug,
} from '../../../core/services/grupo-estudio.service';
import { SesionUsuarioService } from '../../../core/services/sesion-usuario.service';
import { RecordatorioSesion } from '../../../shared/recordatorio-sesion/recordatorio-sesion';
import { crearAvisoTemporal } from '../../../core/services/aviso-temporal';
import { errorApi } from '../../../core/services/recursos-ui';
import { AvisoOperacion } from '../../../shared/aviso-operacion/aviso-operacion';

@Component({
  selector: 'app-sesiones',
  standalone: true,
  imports: [
    DatePipe,
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTimepickerModule,
    RecordatorioSesion,
    AvisoOperacion,
  ],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }],
  templateUrl: './sesiones.html',
  styleUrls: ['../grupos.css', './sesiones.css'],
})
export class Sesiones implements OnInit {
  // Grupo activo según el :grupoId de la ruta padre.
  idGrupo = ID_GRUPO_DEMO;
  @Input() set grupoId(valor: string) {
    this.idGrupo = idGrupoDesdeSlug(valor) ?? ID_GRUPO_DEMO;
  }
  // Variante visual mediante ?rol=tutor. Vistas de Figma mediante ?vista= (programar, editar, detalle)
  // y conectado a la API real: GET/POST/PUT /api/grupos/{idGrupo}/sesiones y
  // PATCH /api/grupos/{idGrupo}/sesiones/{idSesion}/cancelar. La app es zoneless: el estado
  // que cambia tras una respuesta HTTP tiene que ser signal(), si no la vista no se refresca.
  @Input() rol = 'estudiante';
  @Input() admin = '';
  // Las fechas anteriores a hoy muestran el error de S05.
  readonly hoy = new Date();
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly errorCarga = signal('');
  readonly guardando = signal(false);
  readonly sesiones = signal<SesionEstudioResponse[]>([]);
  // Confirmación que se desvanece a los 3 s ('programada' | 'actualizada' | 'cancelada').
  readonly aviso = crearAvisoTemporal();
  readonly errorAccion = signal('');
  // Programar (S04) empieza vacío; editar (S07) muestra los datos actuales de la sesión.
  readonly form = new FormGroup({
    tema: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    descripcion: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
    fecha: new FormControl<Date | null>(null, Validators.required),
    hora: new FormControl<Date | null>(null, Validators.required),
    duracion: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(15),
      Validators.max(480),
    ]),
    lugar: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
  });
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroy = inject(DestroyRef);
  private readonly grupos = inject(GrupoEstudioService);
  private readonly idCreador = signal<number | null>(null);
  // Solo el creador del grupo (usuario con sesión == idCreador) gestiona las sesiones.
  readonly puedeGestionar = computed(() => {
    const usuario = this.auth.usuario();
    const creador = this.idCreador();
    return usuario != null && creador != null && usuario.idUsuario === creador;
  });
  private readonly vistaSignal = signal('');
  @Input() set vista(valor: string) {
    this.vistaSignal.set(valor || '');
    if (valor === 'editar') {
      this.llenarFormularioEditar();
    } else {
      this.idLlenado = null;
      if (valor === 'programar') this.form.reset();
    }
    this.errorAccion.set('');
  }
  // Programar y editar solo existen para el creador del grupo; mientras no se sepa, no se muestran.
  get vista() {
    const v = this.vistaSignal();
    return (v === 'programar' || v === 'editar') && !this.puedeGestionar() ? '' : v;
  }
  // Sesión activa para las vistas de detalle/editar, mediante ?idSesion=.
  private _idSesion = '';
  @Input() set idSesion(valor: string) {
    this._idSesion = valor ?? '';
    this.llenarFormularioEditar();
  }
  get idSesion() {
    return this._idSesion;
  }
  // Id de la sesión ya volcada al formulario, para no pisar lo que el usuario escribe.
  private idLlenado: number | null = null;
  // Rellena el formulario de Modificar en cuanto se conocen vista, idSesion y las sesiones.
  private llenarFormularioEditar() {
    if (this.vista !== 'editar') return;
    const s = this.sesionActual;
    if (!s || this.idLlenado === s.idSesion) return;
    this.idLlenado = s.idSesion;
    const inicio = new Date(s.fechaHoraInicio);
    this.form.reset({
      tema: s.tema,
      descripcion: s.descripcion,
      fecha: inicio,
      hora: inicio,
      duracion: s.duracionMinutos,
      lugar: s.lugar,
    });
  }
  get sesionActual(): SesionEstudioResponse | undefined {
    return this.sesiones().find((s) => String(s.idSesion) === this.idSesion);
  }
  readonly sesionesProgramadas = computed(() =>
    this.sesiones()
      .filter((s) => s.estado === 'PROGRAMADA')
      .slice()
      .sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio)),
  );
  get idUsuario() {
    return this.sesion.idUsuario(this.rol);
  }
  constructor(
    public readonly dialog: MatDialog,
    private readonly api: SesionEstudioService,
    private readonly sesion: SesionUsuarioService,
  ) {}
  ngOnInit() {
    this.grupos.obtenerGrupo(this.idGrupo).subscribe({
      next: (grupo) => {
        this.idCreador.set(grupo.idCreador);
        this.llenarFormularioEditar();
      },
      error: () => this.idCreador.set(null),
    });
    this.cargar();
  }
  cargar() {
    this.cargando.set(true);
    this.error.set(false);
    this.errorCarga.set('');
    this.api.listarSesiones(this.idGrupo).pipe(takeUntilDestroyed(this.destroy)).subscribe({
      next: (sesiones) => {
        this.sesiones.set(sesiones);
        this.cargando.set(false);
        this.llenarFormularioEditar();
      },
      error: (e) => {
        this.error.set(true);
        this.errorCarga.set(errorApi(e));
        this.cargando.set(false);
      },
    });
  }
  private volverAlListado() {
    this.idLlenado = null;
    this.vistaSignal.set('');
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { vista: null, idSesion: null },
      queryParamsHandling: 'merge',
    });
  }
  private get solicitud() {
    const f = this.form.getRawValue();
    const fecha = f.fecha!;
    const hora = f.hora!;
    const inicio = new Date(fecha);
    inicio.setHours(hora.getHours(), hora.getMinutes(), 0, 0);
    // Hora local sin "Z" (p. ej. 2026-11-15T19:00:00): el backend la interpreta en America/Lima.
    const dos = (n: number) => String(n).padStart(2, '0');
    const fechaHoraInicio =
      `${inicio.getFullYear()}-${dos(inicio.getMonth() + 1)}-${dos(inicio.getDate())}` +
      `T${dos(inicio.getHours())}:${dos(inicio.getMinutes())}:00`;
    return {
      tema: f.tema,
      descripcion: f.descripcion,
      fechaHoraInicio,
      duracionMinutos: f.duracion!,
      lugar: f.lugar,
    };
  }
  programar() {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.puedeGestionar() || this.guardando()) return;
    this.errorAccion.set('');
    this.guardando.set(true);
    this.api.crearSesion(this.idGrupo, this.solicitud).pipe(
      takeUntilDestroyed(this.destroy),
      finalize(() => this.guardando.set(false)),
    ).subscribe({
      next: () => {
        this.cargar();
        this.volverAlListado();
        this.aviso.mostrar('programada');
      },
      error: (respuesta) => {
        this.errorAccion.set(errorApi(respuesta));
      },
    });
  }
  guardarCambios() {
    this.form.markAllAsTouched();
    if (this.form.invalid || !this.sesionActual || !this.puedeGestionar() || this.guardando()) return;
    this.errorAccion.set('');
    this.guardando.set(true);
    this.api.modificarSesion(this.idGrupo, this.sesionActual.idSesion, this.solicitud).pipe(
      takeUntilDestroyed(this.destroy),
      finalize(() => this.guardando.set(false)),
    ).subscribe({
      next: () => {
        this.cargar();
        this.volverAlListado();
        this.aviso.mostrar('actualizada');
      },
      error: (respuesta) => {
        this.errorAccion.set(errorApi(respuesta));
      },
    });
  }
  cancelar(idSesion: number, ref?: MatDialogRef<unknown>) {
    if (!this.puedeGestionar() || this.guardando()) return;
    this.errorAccion.set('');
    this.guardando.set(true);
    if (ref) ref.disableClose = true;
    this.api.cancelarSesion(this.idGrupo, idSesion).pipe(
      takeUntilDestroyed(this.destroy),
      finalize(() => {
        this.guardando.set(false);
        if (ref) ref.disableClose = false;
      }),
    ).subscribe({
      next: () => {
        this.cargar();
        this.volverAlListado();
        ref?.close();
        this.aviso.mostrar('cancelada');
      },
      error: (respuesta) => {
        this.errorAccion.set(errorApi(respuesta));
      },
    });
  }
}
