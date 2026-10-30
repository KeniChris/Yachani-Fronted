import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import {
  AdjuntoMensaje, AvisoGrupo, BorradorGrupo, DatosAviso, DatosGrupo, GrupoEstudio, DatosSesion, IntegranteGrupo, MensajeChat, NotificacionUsuario,
  RolGrupo, SesionEstudio, SolicitudUnion, TipoNotificacion, crearDatosGruposVacios,
} from './grupos.models';
import { crearDatosGruposDemostracion, MODO_PREVISUALIZACION_GRUPOS, USUARIOS_DEMOSTRACION } from './grupos.demo';
import { formatearDiaMes, formatearHora, textoCambioSesion } from './grupos.formato';

export const LIMITE_ELIMINAR_MENSAJE_MS = 2 * 60_000;

// Estado en memoria de la gestión de grupos y sesiones.
// Pendiente: reemplazar cada método por la llamada al backend y actualizar el estado con su respuesta.
@Injectable({ providedIn: 'root' })
export class GruposStore {
  readonly modoPrevisualizacion = MODO_PREVISUALIZACION_GRUPOS;
  private readonly datos = this.modoPrevisualizacion ? crearDatosGruposDemostracion() : crearDatosGruposVacios();

  readonly grupos = signal(this.datos.grupos);
  readonly integrantes = signal(this.datos.integrantes);
  readonly temas = signal(this.datos.temas);
  readonly mensajes = signal(this.datos.mensajes);
  readonly sesiones = signal(this.datos.sesiones);
  readonly avisos = signal(this.datos.avisos);
  readonly solicitudes = signal(this.datos.solicitudes);
  readonly notificaciones = signal(this.datos.notificaciones);

  // Reloj compartido para tiempos relativos ("Hace 10 min") y recordatorios.
  readonly ahora = signal(new Date());
  readonly recordatoriosDescartados = signal<string[]>([]);
  // Propuesta de la IA que el tutor decidió revisar en el formulario de creación.
  readonly borradorGrupo = signal<BorradorGrupo | null>(null);

  // Pendiente: filtrar por las membresías del usuario autenticado.
  readonly recordatorios = computed(() => this.sesiones()
    .filter(sesion => sesion.estado !== 'cancelada' && sesion.fin > this.ahora())
    .sort((a, b) => a.inicio.getTime() - b.inicio.getTime()));
  readonly notificacionesSinLeer = computed(() => this.notificaciones().filter(item => !item.leida).length);
  // Recordatorio activo: la sesión entra en su ventana de aviso (p. ej. 30 min antes).
  readonly recordatorioActivo = computed(() => this.recordatorios().find(sesion => {
    const restante = sesion.inicio.getTime() - this.ahora().getTime();
    return restante > 0 && restante <= sesion.recordatorioMinutos * 60_000;
  }) ?? null);

  private secuencia = 0;

  constructor() {
    const reloj = setInterval(() => this.ahora.set(new Date()), 15_000);
    inject(DestroyRef).onDestroy(() => clearInterval(reloj));
  }

  usuarioActualId(rol: RolGrupo): string {
    // Pendiente: obtener el usuario desde la sesión autenticada.
    return this.modoPrevisualizacion ? USUARIOS_DEMOSTRACION[rol].id : '';
  }

  nombreUsuario(rol: RolGrupo): string {
    return this.modoPrevisualizacion ? USUARIOS_DEMOSTRACION[rol].nombre : '';
  }

  // Tutor: grupos que dirige. Estudiante: grupos de los que es integrante.
  gruposDe(rol: RolGrupo, usuarioId: string): GrupoEstudio[] {
    if (rol === 'tutor') return this.grupos().filter(grupo => grupo.tutorId === usuarioId);
    const ids = new Set(this.integrantes().filter(item => item.usuarioId === usuarioId).map(item => item.grupoId));
    return this.grupos().filter(grupo => ids.has(grupo.id) && grupo.tutorId !== usuarioId);
  }

  grupo(id: string) { return this.grupos().find(grupo => grupo.id === id) ?? null; }
  tema(id: string | null) { return id ? this.temas().find(tema => tema.id === id) ?? null : null; }
  sesion(id: string) { return this.sesiones().find(sesion => sesion.id === id) ?? null; }

  // Crear y editar grupos (US09)
  crearGrupo(datos: DatosGrupo, temas: string[], rol: RolGrupo = 'tutor'): GrupoEstudio {
    const tutorId = this.usuarioActualId(rol);
    const perfil = this.modoPrevisualizacion ? USUARIOS_DEMOSTRACION[rol] : { nombre: '', carrera: '', ciclo: null };
    const grupo: GrupoEstudio = { ...datos, id: this.idDisponible(datos.nombre), tutorId };
    this.grupos.update(lista => [...lista, grupo]);
    this.integrantes.update(lista => [...lista, { grupoId: grupo.id, usuarioId: tutorId, nombre: perfil.nombre, carrera: perfil.carrera, ciclo: perfil.ciclo, rol: 'tutor', fechaIngreso: new Date() }]);
    this.temas.update(lista => [...lista, ...temas.map(nombre => ({ id: this.nuevoId('tema'), grupoId: grupo.id, nombre }))]);
    return grupo;
  }

  editarGrupo(id: string, datos: DatosGrupo): string | null {
    const total = this.integrantesDe(id).length;
    if (datos.capacidadMaxima < total) return `El límite no puede ser menor que los integrantes actuales (${total}).`;
    this.grupos.update(lista => lista.map(item => item.id === id ? { ...item, ...datos } : item));
    return null;
  }

  // Chat (US11, US12)
  enviarMensaje(grupoId: string, autorId: string, contenido: string, adjunto: AdjuntoMensaje | null = null): void {
    const mensaje: MensajeChat = { id: this.nuevoId('m'), grupoId, autorId, contenido, adjunto, fechaEnvio: new Date(), eliminado: false };
    this.mensajes.update(lista => [...lista, mensaje]);
  }

  puedeEliminarMensaje(mensaje: MensajeChat, usuarioId: string, ahora = new Date()): boolean {
    return !mensaje.eliminado && mensaje.autorId === usuarioId && this.msRestantesEliminar(mensaje, ahora) > 0;
  }

  msRestantesEliminar(mensaje: MensajeChat, ahora = new Date()): number {
    return Math.max(0, LIMITE_ELIMINAR_MENSAJE_MS - (ahora.getTime() - mensaje.fechaEnvio.getTime()));
  }

  eliminarMensaje(id: string, usuarioId: string): boolean {
    const mensaje = this.mensajes().find(item => item.id === id);
    if (!mensaje || !this.puedeEliminarMensaje(mensaje, usuarioId)) return false;
    this.mensajes.update(lista => lista.map(item => item.id === id ? { ...item, eliminado: true, contenido: '', adjunto: null } : item));
    return true;
  }

  // Sesiones (US14, US15)
  crearSesion(grupoId: string, datos: DatosSesion): SesionEstudio {
    const sesion: SesionEstudio = { ...datos, id: this.nuevoId('sesion'), grupoId, estado: 'programada', anterior: null, recordatorioMinutos: 30 };
    this.sesiones.update(lista => [...lista, sesion]);
    this.notificar('recordatorio', sesion.id, `Recordatorio programado: ${this.grupo(grupoId)?.nombre ?? 'Grupo'} — ${sesion.titulo}`);
    return sesion;
  }

  // "Guardar y notificar": conserva el horario anterior y actualiza el recordatorio.
  editarSesion(id: string, datos: DatosSesion): void {
    const actual = this.sesion(id);
    if (!actual || actual.estado === 'cancelada') return;
    const cambioHorario = actual.inicio.getTime() !== datos.inicio.getTime() || actual.fin.getTime() !== datos.fin.getTime();
    const anterior = cambioHorario ? { inicio: actual.inicio, fin: actual.fin } : actual.anterior;
    this.sesiones.update(lista => lista.map(item => item.id === id ? { ...item, ...datos, estado: 'modificada', anterior } : item));
    this.notificar('cambio_sesion', id, textoCambioSesion(this.grupo(actual.grupoId)?.nombre ?? 'Grupo', datos.inicio, new Date()));
  }

  cancelarSesion(id: string): void {
    const actual = this.sesion(id);
    if (!actual || actual.estado === 'cancelada') return;
    this.sesiones.update(lista => lista.map(item => item.id === id ? { ...item, estado: 'cancelada' } : item));
    this.notificar('cancelacion', id, `${this.grupo(actual.grupoId)?.nombre ?? 'Grupo'}: la sesión del ${formatearDiaMes(actual.inicio)}, ${formatearHora(actual.inicio)} fue cancelada`);
  }

  // Avisos (US16): publicar siempre notifica a los integrantes.
  publicarAviso(grupoId: string, autorId: string, datos: DatosAviso): void {
    const aviso: AvisoGrupo = { ...datos, id: this.nuevoId('aviso'), grupoId, autorId, fechaEnvio: new Date(), editado: false };
    this.avisos.update(lista => [aviso, ...lista]);
  }

  editarAviso(id: string, datos: DatosAviso): void {
    this.avisos.update(lista => lista.map(item => item.id === id ? { ...item, ...datos, editado: true, fechaEnvio: new Date() } : item));
  }

  alternarFijado(id: string): void {
    this.avisos.update(lista => lista.map(item => item.id === id ? { ...item, fijado: !item.fijado } : item));
  }

  eliminarAviso(id: string): void {
    this.avisos.update(lista => lista.filter(item => item.id !== id));
  }

  // Integrantes (US09 alternativo)
  integrantesDe(grupoId: string): IntegranteGrupo[] {
    return this.integrantes().filter(item => item.grupoId === grupoId);
  }

  actualizarCapacidad(grupoId: string, capacidad: number): string | null {
    const total = this.integrantesDe(grupoId).length;
    if (!Number.isInteger(capacidad) || capacidad < total) return `El límite no puede ser menor que los integrantes actuales (${total}).`;
    this.grupos.update(lista => lista.map(item => item.id === grupoId ? { ...item, capacidadMaxima: capacidad } : item));
    return null;
  }

  // Solicitudes (US10)
  responderSolicitud(id: string, respuesta: 'aceptada' | 'rechazada'): string | null {
    const solicitud = this.solicitudes().find(item => item.id === id);
    if (!solicitud || solicitud.estado !== 'pendiente') return 'Esta solicitud ya fue respondida.';
    const grupo = this.grupo(solicitud.grupoId);
    if (respuesta === 'aceptada') {
      if (!grupo || this.integrantesDe(grupo.id).length >= grupo.capacidadMaxima) return 'El grupo está completo. Aumenta el límite de integrantes para aceptar más solicitudes.';
      this.integrantes.update(lista => [...lista, this.integranteDesde(solicitud)]);
    }
    this.solicitudes.update(lista => lista.map(item => item.id === id ? { ...item, estado: respuesta, fechaRespuesta: new Date() } : item));
    return null;
  }

  // Notificaciones (US15)
  marcarNotificacionesLeidas(): void {
    this.notificaciones.update(lista => lista.map(item => ({ ...item, leida: true })));
  }

  descartarRecordatorio(sesionId: string): void {
    this.recordatoriosDescartados.update(lista => [...lista, sesionId]);
  }

  private notificar(tipo: TipoNotificacion, sesionId: string, texto: string): void {
    // Pendiente: el backend genera y envía la notificación a cada integrante.
    const notificacion: NotificacionUsuario = { id: this.nuevoId('n'), tipo, sesionId, texto, fecha: new Date(), leida: false };
    this.notificaciones.update(lista => [notificacion, ...lista]);
  }

  private integranteDesde(solicitud: SolicitudUnion): IntegranteGrupo {
    return { grupoId: solicitud.grupoId, usuarioId: solicitud.estudianteId, nombre: solicitud.nombre, carrera: solicitud.carrera, ciclo: solicitud.ciclo, rol: 'estudiante', fechaIngreso: new Date() };
  }

  private idDisponible(nombre: string): string {
    const base = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'grupo';
    let id = base;
    for (let i = 2; this.grupo(id); i++) id = `${base}-${i}`;
    return id;
  }

  private nuevoId(prefijo: string): string {
    return `${prefijo}-${Date.now().toString(36)}-${++this.secuencia}`;
  }
}
