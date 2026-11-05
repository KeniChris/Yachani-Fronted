import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';
import { GrupoEstudioService } from '../../../core/services/grupo-estudio.service';
import { GrupoEstudioResponse } from '../../../core/models/grupo-estudio.models';
import { SesionUsuarioService } from '../../../core/services/sesion-usuario.service';
import { SesionEstudioService } from '../../../core/services/sesion-estudio.service';
import { SesionEstudioResponse } from '../../../core/models/sesion-estudio.models';
import { RecordatorioSesion } from '../../../shared/recordatorio-sesion/recordatorio-sesion';

@Component({
  selector: 'app-inicio-estudiante',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule, RecordatorioSesion],
  templateUrl: './inicio-estudiante.html',
  styleUrl: './inicio-estudiante.css',
})
export class InicioEstudiante implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly api = inject(GrupoEstudioService);
  private readonly sesion = inject(SesionUsuarioService);
  private readonly apiSesiones = inject(SesionEstudioService);

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
  // Sesiones programadas de todos mis grupos: con ellas se muestra el aviso previo,
  // sin necesidad de un endpoint ni una tabla de recordatorios.
  readonly sesiones = signal<SesionEstudioResponse[]>([]);

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
        this.cargarSesiones(grupos);
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }

  // El backend solo lista las sesiones grupo por grupo. Si un grupo falla, los avisos
  // de los demás se siguen mostrando: es información de apoyo, no la pantalla entera.
  private cargarSesiones(grupos: readonly GrupoEstudioResponse[]) {
    if (grupos.length === 0) {
      this.sesiones.set([]);
      return;
    }
    forkJoin(
      grupos.map((grupo) =>
        this.apiSesiones
          .listarSesiones(grupo.idGrupo)
          .pipe(catchError(() => of([] as SesionEstudioResponse[]))),
      ),
    ).subscribe({
      next: (porGrupo) => this.sesiones.set(porGrupo.flat()),
    });
  }

  responsable(grupo: GrupoEstudioResponse): string {
    return grupo.tipoGrupo === 'TUTOR' ? 'Con tutor' : 'Entre estudiantes';
  }

  detalle(grupo: GrupoEstudioResponse): string {
    return `${grupo.metodoEstudio} · ${grupo.integrantesActuales} de ${grupo.capacidadMaxima} integrantes`;
  }
}
