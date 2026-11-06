import { Component, computed, DestroyRef, inject, Input, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { finalize, forkJoin, of, Subscription } from 'rxjs';
import { GrupoEstudioService, idGrupoDesdeSlug } from '../../../../core/services/grupo-estudio.service';
import { GrupoEstudioResponse } from '../../../../core/models/grupo-estudio.models';
import { AuthService } from '../../../../core/services/auth.service';
import { errorApi } from '../../../../core/services/recursos-ui';
import { AvisoOperacion } from '../../../../shared/aviso-operacion/aviso-operacion';

type EstadoIngreso = 'disponible' | 'enviada' | 'sin-cupos' | 'pendiente' | 'miembro' | 'inactivo' | 'solo-estudiantes';

@Component({
  selector: 'app-detalle-grupo',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, AvisoOperacion],
  templateUrl: './detalle-grupo.html',
  styleUrl: './detalle-grupo.css',
})
export class DetalleGrupo {
  @Input() rol = 'estudiante';
  private readonly auth = inject(AuthService);
  private readonly destroy = inject(DestroyRef);
  private carga?: Subscription;
  private envio?: Subscription;
  private idGrupoActual = 0;
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly errorCarga = signal('');
  readonly errorAccion = signal('');
  readonly enviando = signal(false);
  readonly grupo = signal<GrupoEstudioResponse | null>(null);
  readonly estadoSolicitud = signal<EstadoIngreso>('disponible');
  readonly cuposDisponibles = computed(() => {
    const g = this.grupo();
    return g ? Math.max(0, g.cuposDisponibles ?? g.capacidadMaxima - g.integrantesActuales) : 0;
  });
  readonly puedeSolicitar = computed(() =>
    !this.cargando() && !this.error() && !this.enviando() &&
    this.estadoSolicitud() === 'disponible' && this.cuposDisponibles() > 0 &&
    this.auth.usuario()?.tipoUsuario === 'ESTUDIANTE',
  );

  @Input() set grupoId(valor: string) {
    this.envio?.unsubscribe();
    this.idGrupoActual = idGrupoDesdeSlug(valor) ?? 0;
    this.cargar();
  }

  constructor(private readonly api: GrupoEstudioService) {}

  cargar(): void {
    this.carga?.unsubscribe();
    this.error.set(false);
    this.errorCarga.set('');
    this.errorAccion.set('');
    this.estadoSolicitud.set('disponible');
    const usuario = this.auth.usuario();
    if (!this.idGrupoActual || !usuario) {
      this.error.set(true);
      this.errorCarga.set(!usuario ? 'Inicia sesión para consultar el grupo.' : 'El identificador del grupo no es válido.');
      this.cargando.set(false);
      return;
    }
    this.cargando.set(true);
    this.carga = forkJoin({
      grupo: this.api.obtenerGrupo(this.idGrupoActual),
      misGrupos: this.api.listarMisGrupos(usuario.idUsuario),
      solicitudes: usuario.tipoUsuario === 'ESTUDIANTE'
        ? this.api.listarMisSolicitudes(usuario.idUsuario) : of([]),
    }).pipe(
      takeUntilDestroyed(this.destroy),
      finalize(() => this.cargando.set(false)),
    ).subscribe({
      next: ({ grupo, misGrupos, solicitudes }) => {
        this.grupo.set(grupo);
        if (grupo.idCreador === usuario.idUsuario || misGrupos.some((g) => g.idGrupo === grupo.idGrupo)) {
          this.estadoSolicitud.set('miembro');
        } else if (grupo.estado !== 'ACTIVO') {
          this.estadoSolicitud.set('inactivo');
        } else if (usuario.tipoUsuario !== 'ESTUDIANTE') {
          this.estadoSolicitud.set('solo-estudiantes');
        } else if (solicitudes.some((s) => s.idGrupo === grupo.idGrupo && s.estado === 'PENDIENTE')) {
          this.estadoSolicitud.set('pendiente');
        } else if (this.cuposDisponibles() === 0) {
          this.estadoSolicitud.set('sin-cupos');
        }
      },
      error: (e) => {
        this.error.set(true);
        this.errorCarga.set(errorApi(e));
      },
    });
  }

  solicitarIngreso(): void {
    const usuario = this.auth.usuario();
    if (!usuario || !this.puedeSolicitar()) return;
    const idGrupo = this.idGrupoActual;
    this.errorAccion.set('');
    this.enviando.set(true);
    this.envio = this.api.solicitarUnirse(idGrupo, usuario.idUsuario).pipe(
      takeUntilDestroyed(this.destroy),
      finalize(() => this.enviando.set(false)),
    ).subscribe({
      next: () => {
        if (this.idGrupoActual === idGrupo) this.estadoSolicitud.set('enviada');
      },
      error: (e: HttpErrorResponse) => {
        if (this.idGrupoActual !== idGrupo) return;
        const codigo = e.error?.codigo;
        const mensaje = typeof e.error?.mensaje === 'string' ? e.error.mensaje : '';
        const normalizado = mensaje.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        if (codigo === 'GRUPO_LLENO' || (e.status === 409 && /capacidad|sin cupos|completo|lleno/.test(normalizado))) {
          this.estadoSolicitud.set('sin-cupos');
        } else if (codigo === 'SOLICITUD_PENDIENTE' || (e.status === 409 && /solicitud.*(pendiente|registrada)/.test(normalizado))) {
          this.estadoSolicitud.set('pendiente');
        } else if (codigo === 'YA_ES_INTEGRANTE' || (e.status === 409 && /ya perteneces/.test(normalizado))) {
          this.estadoSolicitud.set('miembro');
        } else if (codigo === 'GRUPO_INACTIVO') {
          this.estadoSolicitud.set('inactivo');
        } else {
          this.errorAccion.set(errorApi(e));
        }
      },
    });
  }
}
