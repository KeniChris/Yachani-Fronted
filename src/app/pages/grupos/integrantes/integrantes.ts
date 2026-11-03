import { Component, Input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {
  GrupoEstudioService,
  ID_GRUPO_DEMO,
  idGrupoDesdeSlug,
} from '../../../core/services/grupo-estudio.service';
import {
  GrupoEstudioResponse,
  IntegranteResponse,
} from '../../../core/models/grupo-estudio.models';

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
  readonly eliminadoReal = signal(false);
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
  readonly capacidadForm = new FormGroup({
    capacidad: new FormControl<number | null>(15, [Validators.required, Validators.min(8)]),
  });
  readonly errorCapacidad = signal('');
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
    this.api.obtenerGrupo(this.idGrupo).subscribe({ next: (grupo) => this.grupo.set(grupo) });
    this.api.listarIntegrantes(this.idGrupo).subscribe({
      next: (integrantes) => {
        this.lista.set(integrantes);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
  dialogRefCapacidad: MatDialogRef<unknown> | null = null;
  cambiarCapacidad() {
    if (this.capacidadForm.invalid) return;
    this.errorCapacidad.set('');
    this.api.actualizarCapacidad(this.idGrupo, this.capacidadForm.getRawValue().capacidad!).subscribe({
      next: (respuesta) => {
        this.resultadoCapacidad.set(respuesta);
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
        this.eliminadoReal.set(true);
        this.dialog.closeAll();
      },
      error: (respuesta) => {
        this.errorEliminar.set(respuesta.error?.mensaje || 'No pudimos eliminar al integrante.');
      },
    });
  }
}
