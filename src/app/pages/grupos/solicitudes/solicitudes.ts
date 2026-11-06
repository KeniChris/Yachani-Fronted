import { Component, Input, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { GrupoEstudioService } from '../../../core/services/grupo-estudio.service';
import {
  GrupoEstudioResponse,
  SolicitudPendienteResponse,
} from '../../../core/models/grupo-estudio.models';
import { SesionUsuarioService } from '../../../core/services/sesion-usuario.service';
import { crearAvisoTemporal } from '../../../core/services/aviso-temporal';

// Una solicitud junto con el grupo al que pertenece: la pantalla ya no vive dentro de
// un grupo, así que cada tarjeta tiene que decir de qué grupo viene.
export interface SolicitudConGrupo extends SolicitudPendienteResponse {
  nombreGrupo: string;
}

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [DatePipe, RouterLink, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './solicitudes.html',
  styleUrls: ['../grupos.css', './solicitudes.css'],
})
export class Solicitudes implements OnInit {
  // Identidad de vista previa mediante ?rol=, igual que el resto de grupos: con sesión
  // iniciada manda el usuario real.
  @Input() rol = 'estudiante';
  // App zoneless: el estado que cambia tras una respuesta HTTP tiene que ser signal().
  readonly cargando = signal(true);
  readonly error = signal(false);
  readonly lista = signal<SolicitudConGrupo[]>([]);
  // Grupos que administro (los que creé): son los únicos con solicitudes que gestionar.
  readonly misGrupos = signal<GrupoEstudioResponse[]>([]);
  // Confirmación que se desvanece a los 3 s ('aceptada' | 'rechazada').
  readonly aviso = crearAvisoTemporal();
  readonly errorAccion = signal('');
  // Evita la doble llamada: el backend BORRA la solicitud al aceptarla, así que un
  // segundo clic (o Enter + clic) respondía 404 "La solicitud no existe" aunque la
  // primera hubiera funcionado.
  readonly procesando = signal(false);
  get idUsuario() {
    return this.sesion.idUsuario(this.rol);
  }
  constructor(
    public readonly dialog: MatDialog,
    private readonly api: GrupoEstudioService,
    private readonly sesion: SesionUsuarioService,
  ) {}
  ngOnInit() {
    this.cargar();
  }
  // El backend solo expone las solicitudes grupo por grupo, así que primero se piden
  // mis grupos y después, en paralelo, las solicitudes pendientes de cada uno.
  cargar() {
    this.cargando.set(true);
    this.error.set(false);
    this.api
      .listarMisGrupos(this.idUsuario)
      .pipe(
        map((grupos) => grupos.filter((grupo) => grupo.idCreador === this.idUsuario)),
        switchMap((grupos) => {
          this.misGrupos.set(grupos);
          if (grupos.length === 0) return of([] as SolicitudConGrupo[]);
          return forkJoin(
            grupos.map((grupo) =>
              this.api.listarSolicitudes(grupo.idGrupo).pipe(
                map((solicitudes) =>
                  solicitudes.map((solicitud) => ({
                    ...solicitud,
                    nombreGrupo: grupo.nombre,
                  })),
                ),
                // Si un grupo falla, la lista sigue mostrando los demás.
                catchError(() => of([] as SolicitudConGrupo[])),
              ),
            ),
          ).pipe(map((porGrupo) => porGrupo.flat()));
        }),
      )
      .subscribe({
        next: (solicitudes) => {
          this.lista.set(solicitudes);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set(true);
          this.cargando.set(false);
        },
      });
  }
  iniciales(nombre: string): string {
    return nombre
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join('');
  }
  aceptar(idSolicitud: number) {
    if (this.procesando()) return;
    this.errorAccion.set('');
    this.procesando.set(true);
    this.api.aceptarSolicitud(idSolicitud).subscribe({
      next: () => {
        this.procesando.set(false);
        this.cargar();
        this.aviso.mostrar('aceptada');
        this.dialog.closeAll();
      },
      error: (respuesta) => {
        this.procesando.set(false);
        this.fallo(respuesta, 'No hay cupos para aceptar esta solicitud.');
      },
    });
  }
  rechazar(idSolicitud: number) {
    if (this.procesando()) return;
    this.errorAccion.set('');
    this.procesando.set(true);
    this.api.rechazarSolicitud(idSolicitud).subscribe({
      next: () => {
        this.procesando.set(false);
        this.cargar();
        this.aviso.mostrar('rechazada');
        this.dialog.closeAll();
      },
      error: (respuesta) => {
        this.procesando.set(false);
        this.fallo(respuesta, 'No pudimos rechazar la solicitud.');
      },
    });
  }
  // Si la solicitud ya no está pendiente (la procesó otra persona, o se aceptó en otra
  // pestaña) no es un error que la usuaria pueda arreglar: se recarga la lista y se
  // avisa con un texto entendible, en vez del "La solicitud no existe" del backend.
  private fallo(respuesta: { error?: { mensaje?: string } }, porDefecto: string) {
    this.dialog.closeAll();
    const mensaje = respuesta.error?.mensaje || '';
    const yaNoEsta = /no existe|ya fue procesada|ya pertenece/i.test(mensaje);
    if (yaNoEsta) {
      this.cargar();
      this.errorAccion.set('Esa solicitud ya no está pendiente. Actualizamos la lista.');
      return;
    }
    this.errorAccion.set(mensaje || porDefecto);
  }
}
