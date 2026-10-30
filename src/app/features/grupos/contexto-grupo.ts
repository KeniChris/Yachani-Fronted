import { Injectable, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { RolGrupo } from './grupos.models';
import { GruposStore } from './grupos.store';
import { rutaGrupo } from './grupos.formato';

// Datos del grupo abierto, compartidos entre el encabezado y sus pestañas.
// Se provee en EspacioGrupo, por lo que cada pestaña recibe la misma instancia.
@Injectable()
export class ContextoGrupo {
  private readonly route = inject(ActivatedRoute);
  readonly store = inject(GruposStore);

  // Solo define la variante visual; el backend deberá autorizar el rol real en el grupo.
  readonly rol: RolGrupo = this.route.snapshot.data['rolVista'] === 'tutor' ? 'tutor' : 'estudiante';
  readonly esTutor = this.rol === 'tutor';
  readonly usuarioId = this.store.usuarioActualId(this.rol);

  readonly grupoId = toSignal(this.route.paramMap.pipe(map(params => params.get('grupoId') ?? '')),
    { initialValue: this.route.snapshot.paramMap.get('grupoId') ?? '' });
  readonly grupo = computed(() => this.store.grupos().find(grupo => grupo.id === this.grupoId()) ?? null);
  readonly integrantes = computed(() => this.store.integrantes().filter(item => item.grupoId === this.grupoId()));
  readonly temas = computed(() => this.store.temas().filter(tema => tema.grupoId === this.grupoId()));
  readonly cuposDisponibles = computed(() => Math.max(0, (this.grupo()?.capacidadMaxima ?? 0) - this.integrantes().length));
  readonly tutor = computed(() => this.integrantes().find(item => item.usuarioId === this.grupo()?.tutorId) ?? null);
  readonly solicitudesPendientes = computed(() =>
    this.store.solicitudes().filter(item => item.grupoId === this.grupoId() && item.estado === 'pendiente').length);
  readonly proximaSesion = computed(() =>
    this.store.recordatorios().find(sesion => sesion.grupoId === this.grupoId()) ?? null);
  // Se notifica a todos los integrantes menos a quien realiza la acción.
  readonly integrantesANotificar = computed(() => Math.max(0, this.integrantes().length - 1));

  nombreDe(usuarioId: string): string {
    return this.integrantes().find(item => item.usuarioId === usuarioId)?.nombre ?? 'Integrante';
  }

  ruta(pestana?: string): string {
    return rutaGrupo(this.rol, this.grupoId(), pestana);
  }
}
