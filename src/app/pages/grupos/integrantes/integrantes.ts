import { Component, Input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { finalize, forkJoin } from 'rxjs';
import {
  GrupoEstudioService,
  ID_GRUPO_DEMO,
  idGrupoDesdeSlug,
} from '../../../core/services/grupo-estudio.service';
import {
  GrupoEstudioResponse,
  IntegranteResponse,
} from '../../../core/models/grupo-estudio.models';
import { crearAvisoTemporal } from '../../../core/services/aviso-temporal';

@Component({
  selector: 'app-integrantes',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './integrantes.html',
  styleUrls: ['../grupos.css', './integrantes.css'],
})
export class Integrantes implements OnInit {
  // Variante visual mediante ?rol=tutor y capacidad guardada (G11) mediante ?integrantes=capacidad.
  @Input() rol = 'estudiante';
  // Grupo activo según el :grupoId de la ruta padre.
  idGrupo = ID_GRUPO_DEMO;
  @Input() set grupoId(valor: string) {
    this.idGrupo = idGrupoDesdeSlug(valor) ?? ID_GRUPO_DEMO;
  }
  @Input() integrantes = '';
  // Grupo entre estudiantes con administradora (G15…): ?admin=si junto con rol=estudiante.
  @Input() admin = '';
  // App zoneless: el estado que cambia tras una respuesta HTTP tiene que ser signal().
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly lista = signal<IntegranteResponse[]>([]);
  readonly grupo = signal<GrupoEstudioResponse | null>(null);
  readonly errorEliminar = signal('');
  // Confirmación de integrante eliminado: se desvanece a los 3 s.
  readonly avisoEliminado = crearAvisoTemporal();
  // La API no marca quién es tutor en /integrantes: se identifica comparando
  // con el idCreador que devuelve el grupo.
  get tutor() {
    const idCreador = this.grupo()?.idCreador;
    return this.lista().find((i) => i.idUsuario === idCreador);
  }
  get estudiantes() {
    const idCreador = this.grupo()?.idCreador;
    return this.lista().filter((i) => i.idUsuario !== idCreador);
  }
  iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((parte) => parte[0])
      .join('');
  }
  // Capacidad real del grupo (hasta que llegue la respuesta, 0).
  get capacidadBase() {
    return this.grupo()?.capacidadMaxima ?? 0;
  }
  // La lista incluye al administrador. Los cupos usan el total del backend,
  // igual que Mis grupos, que excluye al tutor de las plazas de estudiantes.
  get integrantesActuales() {
    return this.grupo()?.integrantesActuales ?? 0;
  }
  get cuposDisponibles() {
    return Math.max(0, this.capacidadBase - this.integrantesActuales);
  }
  get capacidadMinima() {
    return Math.max(2, this.integrantesActuales);
  }
  readonly capacidadForm = new FormGroup({
    capacidad: new FormControl<number | null>(null, [Validators.required, Validators.min(2)]),
  });
  readonly errorCapacidad = signal('');
  // Capacidad guardada: el aviso se desvanece a los 3 s, pero la capacidad nueva
  // se conserva aparte porque el texto del aviso la menciona.
  readonly avisoCapacidad = crearAvisoTemporal();
  readonly resultadoCapacidad = signal<GrupoEstudioResponse | null>(null);
  constructor(
    public readonly dialog: MatDialog,
    private readonly api: GrupoEstudioService,
  ) {}
  ngOnInit() {
    this.cargar();
  }
  cargar() {
    this.cargando.set(true);
    this.error.set(false);
    forkJoin({
      grupo: this.api.obtenerGrupo(this.idGrupo),
      integrantes: this.api.listarIntegrantes(this.idGrupo),
    }).pipe(
      finalize(() => this.cargando.set(false)),
    ).subscribe({
      next: ({ grupo, integrantes }) => {
        this.grupo.set(grupo);
        this.lista.set(integrantes);
      },
      error: () => {
        this.error.set(true);
      },
    });
  }
  dialogRefCapacidad: MatDialogRef<unknown> | null = null;
  prepararCapacidad() {
    this.errorCapacidad.set('');
    this.capacidadForm.controls.capacidad.setValidators([
      Validators.required,
      Validators.min(this.capacidadMinima),
    ]);
    this.capacidadForm.reset({ capacidad: this.capacidadBase });
  }
  cambiarCapacidad() {
    if (this.capacidadForm.invalid) return;
    this.errorCapacidad.set('');
    this.api.actualizarCapacidad(this.idGrupo, this.capacidadForm.getRawValue().capacidad!).subscribe({
      next: (respuesta) => {
        this.grupo.set(respuesta);
        this.resultadoCapacidad.set(respuesta);
        this.avisoCapacidad.mostrar();
        this.dialogRefCapacidad?.close();
      },
      error: (respuesta) => {
        this.errorCapacidad.set(respuesta.error?.mensaje || 'No pudimos actualizar la capacidad.');
      },
    });
  }
  eliminarIntegrante(idUsuario: number) {
    this.errorEliminar.set('');
    this.api.eliminarIntegrante(this.idGrupo, idUsuario).subscribe({
      next: () => {
        this.cargar();
        this.avisoEliminado.mostrar();
        this.dialog.closeAll();
      },
      error: (respuesta) => {
        this.errorEliminar.set(respuesta.error?.mensaje || 'No pudimos eliminar al integrante.');
      },
    });
  }
}
