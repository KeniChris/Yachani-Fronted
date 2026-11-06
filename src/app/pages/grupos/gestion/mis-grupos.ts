import { Component, Input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { GrupoEstudioService } from '../../../core/services/grupo-estudio.service';
import {
  GrupoEstudioResponse,
  MiSolicitudResponse,
} from '../../../core/models/grupo-estudio.models';
import { SesionUsuarioService } from '../../../core/services/sesion-usuario.service';
import { crearAvisoTemporal } from '../../../core/services/aviso-temporal';

@Component({
  selector: 'app-mis-grupos',
  standalone: true,
  imports: [DatePipe, RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './mis-grupos.html',
  styleUrls: ['../grupos.css', './mis-grupos.css'],
})
export class MisGrupos implements OnInit {
  // Variante visual mediante ?rol=tutor y estados de Figma mediante ?grupos=vacio|creado|creado-ia.
  @Input() rol = 'estudiante';
  // El ?grupos=creado|creado-ia que deja la pantalla de creación solo sirve para el
  // aviso de confirmación, que se desvanece a los 3 s aunque el parámetro siga en la URL.
  readonly avisoCreado = crearAvisoTemporal();
  private gruposVisible = '';
  @Input() set grupos(valor: string) {
    this.gruposVisible = valor || '';
    if (valor === 'creado' || valor === 'creado-ia') {
      this.avisoCreado.mostrar(valor);
    }
  }
  get grupos() {
    return this.gruposVisible;
  }
  // App zoneless: el estado que cambia tras una respuesta HTTP tiene que ser signal().
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly lista = signal<GrupoEstudioResponse[]>([]);
  // Solicitudes que el propio estudiante envió a otros grupos.
  readonly solicitudes = signal<MiSolicitudResponse[]>([]);
  get idUsuario() {
    return this.sesion.idUsuario(this.rol);
  }
  constructor(
    private readonly api: GrupoEstudioService,
    private readonly sesion: SesionUsuarioService,
  ) {}
  // En ngOnInit, no en el constructor: el @Input() rol llega después de construir.
  ngOnInit() {
    this.cargar();
  }
  cargar() {
    this.cargando.set(true);
    this.error.set(false);
    this.api.listarMisGrupos(this.idUsuario).subscribe({
      next: (lista) => {
        this.lista.set(lista);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });

    this.api.listarMisSolicitudes(this.idUsuario).subscribe({
      next: (solicitudes) => this.solicitudes.set(solicitudes),
    });
  }
  // El backend guarda el estado en mayúsculas (PENDIENTE, ACEPTADA, RECHAZADA).
  estadoLegible(estado: string): string {
    return estado.charAt(0) + estado.slice(1).toLowerCase();
  }
  responsable(grupo: GrupoEstudioResponse): string {
    return grupo.tipoGrupo === 'TUTOR' ? 'Con tutor' : 'Entre estudiantes';
  }
  detalle(grupo: GrupoEstudioResponse): string {
    return `${grupo.metodoEstudio} · ${grupo.integrantesActuales} de ${grupo.capacidadMaxima} integrantes`;
  }
  esAdministradora(grupo: GrupoEstudioResponse): boolean {
    return this.rol !== 'tutor' && grupo.tipoGrupo !== 'TUTOR' && grupo.idCreador === this.idUsuario;
  }
}
