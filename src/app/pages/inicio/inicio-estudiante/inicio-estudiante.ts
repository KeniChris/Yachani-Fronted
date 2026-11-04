import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { GrupoEstudioService } from '../../../core/services/grupo-estudio.service';
import { GrupoEstudioResponse } from '../../../core/models/grupo-estudio.models';
import { SesionUsuarioService } from '../../../core/services/sesion-usuario.service';

@Component({
  selector: 'app-inicio-estudiante',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './inicio-estudiante.html',
  styleUrl: './inicio-estudiante.css',
})
export class InicioEstudiante implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly api = inject(GrupoEstudioService);
  private readonly sesion = inject(SesionUsuarioService);

  get nombre(): string {
    return this.authService.usuario()?.nombres.trim().split(/\s+/)[0] ?? '';
  }

  // Identidad de vista previa mediante ?rol=, igual que en las pantallas de grupos:
  // con sesión iniciada manda el usuario real y el ?rol= se ignora; sin sesión se usa
  // el usuario de ejemplo de ese rol. En ngOnInit, no en el constructor, porque el
  // @Input() llega después de construir.
  @Input() rol = 'estudiante';

  // Grupos de los que la usuaria forma parte (GET /api/grupos?idUsuario=), los mismos
  // que Mis grupos. App zoneless: el estado que cambia tras una respuesta HTTP tiene
  // que ser signal(), si no la vista no se refresca.
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly grupos = signal<GrupoEstudioResponse[]>([]);

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.cargando.set(true);
    this.error.set(false);
    this.api.listarMisGrupos(this.sesion.idUsuario(this.rol)).subscribe({
      next: (grupos) => {
        this.grupos.set(grupos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  responsable(grupo: GrupoEstudioResponse): string {
    return grupo.tipoGrupo === 'TUTOR' ? 'Con tutor' : 'Entre estudiantes';
  }

  detalle(grupo: GrupoEstudioResponse): string {
    return `${grupo.metodoEstudio} · ${grupo.integrantesActuales} de ${grupo.capacidadMaxima} integrantes`;
  }
}
