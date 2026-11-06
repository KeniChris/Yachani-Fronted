import { Component, Input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  GrupoEstudioService,
  idGrupoDesdeSlug,
} from '../../../../core/services/grupo-estudio.service';
import { GrupoEstudioResponse } from '../../../../core/models/grupo-estudio.models';
import { SesionUsuarioService } from '../../../../core/services/sesion-usuario.service';

@Component({
  selector: 'app-detalle-grupo',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './detalle-grupo.html',
  styleUrl: './detalle-grupo.css',
})
export class DetalleGrupo {
  // Variante visual mediante ?rol= (para el idEstudiante de la solicitud).
  @Input() rol = 'estudiante';
  // App zoneless: el estado que cambia tras una respuesta HTTP tiene que ser signal().
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly grupo = signal<GrupoEstudioResponse | null>(null);
  // Estado de la acción: disponible (por defecto), enviada, sin-cupos, registrada.
  readonly estadoSolicitud = signal('disponible');
  @Input() set grupoId(valor: string) {
    const idGrupo = idGrupoDesdeSlug(valor);
    if (idGrupo === null) {
      this.error.set(true);
      this.cargando.set(false);
      return;
    }
    this.idGrupoActual = idGrupo;
    this.cargando.set(true);
    this.error.set(false);
    this.api.obtenerGrupo(idGrupo).subscribe({
      next: (grupo) => {
        this.grupo.set(grupo);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
  private idGrupoActual = 0;
  constructor(
    private readonly api: GrupoEstudioService,
    private readonly sesion: SesionUsuarioService,
  ) {}
  // US10: unirse al grupo (POST /grupos/{id}/solicitudes).
  solicitarIngreso() {
    this.api.solicitarUnirse(this.idGrupoActual, this.sesion.idUsuario(this.rol)).subscribe({
      next: () => this.estadoSolicitud.set('enviada'),
      error: (respuesta) => {
        const mensaje: string = respuesta.error?.mensaje || '';
        this.estadoSolicitud.set(mensaje.toLowerCase().includes('cupo') ? 'sin-cupos' : 'registrada');
      },
    });
  }
}
