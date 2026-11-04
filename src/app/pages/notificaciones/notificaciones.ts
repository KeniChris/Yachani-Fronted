import { Component, Input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificacionService } from '../../core/services/notificacion.service';
import {
  NotificacionResponse,
  NotificacionSesionResponse,
  NotificacionVista,
} from '../../core/models/notificacion.models';
import { SesionUsuarioService } from '../../core/services/sesion-usuario.service';
import { crearAvisoTemporal } from '../../core/services/aviso-temporal';

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
  // El conteo lo da el backend (GET /notificaciones/no-leidas/conteo), no la página
  // cargada: así cuadra aunque haya más notificaciones de las que caben en una página.
  readonly sinLeer = signal(0);
  // Confirmaciones que se desvanecen a los 3 s ('una' | 'todas').
  readonly aviso = crearAvisoTemporal();
  readonly marcando = signal(false);
  get idUsuario() {
    return this.sesion.idUsuario(this.rol);
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
    this.api.listar().subscribe({
      next: (bandeja) => {
        this.combinar(bandeja, null);
        // Los datos del encuentro (fecha, hora, lugar) solo están en la ruta antigua de
        // sesiones, y es solo para estudiantes: si el usuario es tutor el backend
        // responde con error y la lista se queda con la bandeja general.
        this.api.listarDeSesiones(this.idUsuario).subscribe({
          next: (sesiones) => this.combinar(bandeja, sesiones),
          error: () => this.cargando.set(false),
        });
      },
      error: () => {
        this.error.set(true);
        this.cargando.set(false);
      },
    });
    this.api.contarNoLeidas().subscribe({
      next: (cantidad) => this.sinLeer.set(cantidad),
    });
  }
  private combinar(
    bandeja: NotificacionResponse[],
    sesiones: NotificacionSesionResponse[] | null,
  ) {
    // El backend ya manda título y ruta listos, así que la pantalla no los inventa.
    const generales: NotificacionVista[] = bandeja.map((n) => ({
      clave: `bandeja-${n.idNotificacion}`,
      idNotificacion: n.idNotificacion,
      titulo: n.titulo,
      texto: n.mensaje,
      fecha: n.fechaCreacion,
      accion: this.accion(n),
      enlace: n.ruta,
      leida: n.leida,
      marcable: true,
      sesion: null,
    }));
    // Las de la ruta de sesiones que ya están en la bandeja general no se repiten.
    const yaEstan = new Set(bandeja.map((n) => n.idSesion).filter((id) => id !== null));
    const deSesiones: NotificacionVista[] = (sesiones ?? [])
      .filter((n) => !yaEstan.has(n.idSesion))
      .map((n) => ({
        clave: `sesion-${n.idNotificacion}`,
        idNotificacion: n.idNotificacion,
        titulo: n.titulo,
        texto: `${n.tema} · ${n.grupo}`,
        fecha: n.fechaCreacion,
        accion: 'Ver sesión',
        enlace: '/notificaciones',
        leida: true,
        marcable: false,
        sesion: n,
      }));
    this.lista.set(
      [...generales, ...deSesiones].sort((a, b) => b.fecha.localeCompare(a.fecha)),
    );
    this.cargando.set(false);
  }
  private accion(n: NotificacionResponse): string {
    if (n.tipo === 'SOLICITUD_RECIBIDA') return 'Ver solicitudes';
    if (n.tipo === 'SOLICITUD_RECHAZADA' || n.idGrupo === null) return 'Explorar grupos';
    if (n.idSesion !== null) return 'Ver sesión';
    return 'Ver grupo';
  }
  marcarComoLeida(notificacion: NotificacionVista) {
    if (!notificacion.marcable || this.marcando()) return;
    this.marcando.set(true);
    this.api.marcarComoLeida(notificacion.idNotificacion).subscribe({
      next: () => {
        this.marcando.set(false);
        this.aviso.mostrar('una');
        this.cargar();
      },
      error: () => this.marcando.set(false),
    });
  }
  marcarTodas() {
    if (this.marcando() || this.sinLeer() === 0) return;
    this.marcando.set(true);
    this.api.marcarTodasComoLeidas().subscribe({
      next: () => {
        this.marcando.set(false);
        this.aviso.mostrar('todas');
        this.cargar();
      },
      error: () => this.marcando.set(false),
    });
  }
}
