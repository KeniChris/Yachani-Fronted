import { Component, Input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  GrupoEstudioService,
  ID_GRUPO_DEMO,
  idGrupoDesdeSlug,
} from '../../../core/services/grupo-estudio.service';
import {
  GrupoEstudioResponse,
  SolicitudPendienteResponse,
} from '../../../core/models/grupo-estudio.models';
import { crearAvisoTemporal } from '../../../core/services/aviso-temporal';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [DatePipe, RouterLink, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './solicitudes.html',
  styleUrls: ['../grupos.css', './solicitudes.css'],
})
export class Solicitudes implements OnInit {
  // Variante visual mediante ?rol=tutor; el estudiante no administra solicitudes (G13).
  @Input() rol = 'estudiante';
  @Input() admin = '';
  // Grupo activo según el :grupoId de la ruta padre.
  idGrupo = ID_GRUPO_DEMO;
  @Input() set grupoId(valor: string) {
    this.idGrupo = idGrupoDesdeSlug(valor) ?? ID_GRUPO_DEMO;
  }
  // App zoneless: el estado que cambia tras una respuesta HTTP tiene que ser signal().
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly lista = signal<SolicitudPendienteResponse[]>([]);
  readonly grupo = signal<GrupoEstudioResponse | null>(null);
  // Confirmación que se desvanece a los 3 s ('aceptada' | 'rechazada').
  readonly aviso = crearAvisoTemporal();
  readonly errorAccion = signal('');
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
    this.api.listarSolicitudes(this.idGrupo).subscribe({
      next: (lista) => {
        this.lista.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
  aceptar(idSolicitud: number) {
    this.errorAccion.set('');
    this.api.aceptarSolicitud(idSolicitud).subscribe({
      next: () => {
        this.cargar();
        this.aviso.mostrar('aceptada');
        this.dialog.closeAll();
      },
      error: (respuesta) => {
        this.errorAccion.set(respuesta.error?.mensaje || 'No hay cupos para aceptar esta solicitud.');
        this.dialog.closeAll();
      },
    });
  }
  rechazar(idSolicitud: number) {
    this.errorAccion.set('');
    this.api.rechazarSolicitud(idSolicitud).subscribe({
      next: () => {
        this.cargar();
        this.aviso.mostrar('rechazada');
        this.dialog.closeAll();
      },
      error: (respuesta) => {
        this.errorAccion.set(respuesta.error?.mensaje || 'La solicitud ya fue procesada.');
        this.dialog.closeAll();
      },
    });
  }
}
