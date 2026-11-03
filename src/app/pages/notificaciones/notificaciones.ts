import { Component, Input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificacionService } from '../../core/services/notificacion.service';
import {
  NotificacionSesionResponse,
  NotificacionSolicitudResponse,
  NotificacionVista,
} from '../../core/models/notificacion.models';
import { SesionUsuarioService } from '../../core/services/sesion-usuario.service';

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [DatePipe, RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './notificaciones.html',
  styleUrls: ['../grupos/grupos.css', './notificaciones.css'],
})
export class Notificaciones implements OnInit {
  // Variante visual mediante ?rol=tutor. Recordatorio (N06) mediante ?vista=recordatorio
  // junto con ?idNotificacion= para saber cuál se abre.
  @Input() rol = 'estudiante';
  @Input() vista = '';
  @Input() idNotificacion = '';
  // App zoneless: el estado que cambia tras una respuesta HTTP tiene que ser signal().
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly lista = signal<NotificacionVista[]>([]);
  readonly avisoLeida = signal(false);
  get idUsuario() {
    return this.sesion.idUsuario(this.rol);
  }
  get sinLeer() {
    return this.lista().filter((n) => !n.leida).length;
  }
  get recordatorio() {
    return this.lista().find((n) => n.clave === `sesion-${this.idNotificacion}`)?.sesion ?? null;
  }
  constructor(
    private readonly api: NotificacionService,
    private readonly sesion: SesionUsuarioService,
  ) {}
  ngOnInit() {
    this.cargar();
  }
  cargar() {
    this.cargando.set(true);
    this.error.set(false);
    const idUsuario = this.idUsuario;
    this.api.listarDeSolicitudes(idUsuario).subscribe({
      next: (solicitudes) => {
        this.combinar(solicitudes, null);
        // Las de sesión son solo para estudiantes: si el usuario es tutor el backend
        // responde con error y la lista se queda con las de solicitudes.
        this.api.listarDeSesiones(idUsuario).subscribe({
          next: (sesiones) => this.combinar(solicitudes, sesiones),
          error: () => this.cargando.set(false),
        });
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
  }
  private combinar(
    solicitudes: NotificacionSolicitudResponse[],
    sesiones: NotificacionSesionResponse[] | null,
  ) {
    const deSolicitudes: NotificacionVista[] = solicitudes.map((n) => ({
      clave: `solicitud-${n.idNotificacion}`,
      idNotificacion: n.idNotificacion,
      titulo: this.tituloSolicitud(n.tipo),
      texto: n.mensaje,
      fecha: n.fechaCreacion,
      accion: n.tipo === 'SOLICITUD_RECHAZADA' ? 'Explorar' : 'Ver grupo',
      enlace: this.enlaceSolicitud(n),
      leida: n.leida,
      marcable: true,
      sesion: null,
    }));
    const deSesiones: NotificacionVista[] = (sesiones ?? []).map((n) => ({
      clave: `sesion-${n.idNotificacion}`,
      idNotificacion: n.idNotificacion,
      titulo: n.titulo,
      texto: `${n.tema} · ${n.grupo}`,
      fecha: n.fechaCreacion,
      accion: 'Ver sesión',
      enlace: ['/notificaciones'],
      leida: true,
      marcable: false,
      sesion: n,
    }));
    this.lista.set(
      [...deSolicitudes, ...deSesiones].sort((a, b) => b.fecha.localeCompare(a.fecha)),
    );
    this.cargando.set(false);
  }
  private tituloSolicitud(tipo: string): string {
    if (tipo === 'SOLICITUD_RECIBIDA') return 'Nueva solicitud de ingreso';
    if (tipo === 'SOLICITUD_ACEPTADA') return 'Solicitud aceptada';
    if (tipo === 'SOLICITUD_RECHAZADA') return 'Solicitud rechazada';
    return 'Notificación';
  }
  private enlaceSolicitud(n: NotificacionSolicitudResponse): unknown[] {
    if (n.tipo === 'SOLICITUD_RECHAZADA' || n.idGrupo === null) {
      return ['/grupos/descubrimiento'];
    }
    // Al creador le interesa la bandeja de solicitudes; al estudiante, el grupo.
    return n.tipo === 'SOLICITUD_RECIBIDA'
      ? ['/grupos', n.idGrupo, 'solicitudes']
      : ['/grupos', n.idGrupo];
  }
  marcarComoLeida(notificacion: NotificacionVista) {
    if (!notificacion.marcable) return;
    this.api.marcarComoLeida(notificacion.idNotificacion, this.idUsuario).subscribe({
      next: () => {
        this.avisoLeida.set(true);
        this.cargar();
      },
    });
  }
}
