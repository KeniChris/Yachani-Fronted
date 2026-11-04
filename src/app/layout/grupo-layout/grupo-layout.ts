import { Component, Input, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import {
  GrupoEstudioService,
  idGrupoDesdeSlug,
} from '../../core/services/grupo-estudio.service';
import { GrupoEstudioResponse } from '../../core/models/grupo-estudio.models';

@Component({
  selector: 'app-grupo-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatTabsModule, MatIconModule],
  templateUrl: './grupo-layout.html',
  styleUrl: './grupo-layout.css',
})
export class GrupoLayout {
  // Grupo activo según el parámetro de ruta :grupoId (slug). Conectado a la API real:
  // GET /api/grupos/{idGrupo}. La app es zoneless: el estado que cambia tras una respuesta
  // HTTP tiene que ser signal(), si no la cabecera no se refresca.
  private readonly grupoResponse = signal<GrupoEstudioResponse | null>(null);
  @Input() set grupoId(valor: string) {
    const idGrupo = idGrupoDesdeSlug(valor);
    if (idGrupo === null) {
      this.grupoResponse.set(null);
      return;
    }
    this.api.obtenerGrupo(idGrupo).subscribe({
      next: (grupo) => this.grupoResponse.set(grupo),
      error: () => this.grupoResponse.set(null),
    });
  }
  get grupo() {
    const g = this.grupoResponse();
    return {
      nombre: g?.nombre ?? 'Grupo de estudio',
      detalle: g ? `${g.metodoEstudio} · ${g.integrantesActuales} de ${g.capacidadMaxima} integrantes` : '',
    };
  }
  readonly tabs = [
    { label: 'Chat', path: 'chat', icon: 'forum' },
    { label: 'Temas y materiales', path: 'recursos', icon: 'folder' },
    { label: 'Sesiones', path: 'sesiones', icon: 'calendar_month' },
    { label: 'Avisos', path: 'avisos', icon: 'campaign' },
    { label: 'Flashcards', path: 'flashcards', icon: 'style' },
    { label: 'Integrantes', path: 'integrantes', icon: 'groups' },
  ];
  constructor(private readonly api: GrupoEstudioService) {}
}
