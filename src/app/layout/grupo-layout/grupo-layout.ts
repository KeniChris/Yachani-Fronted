import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-grupo-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, MatTabsModule, MatIconModule],
  templateUrl: './grupo-layout.html',
  styleUrl: './grupo-layout.css',
})
export class GrupoLayout {
  @Input() nombreGrupo = '';
  readonly tabs = [
    { label: 'Chat', path: 'chat', icon: 'forum' },
    { label: 'Temas y materiales', path: 'recursos', icon: 'folder' },
    { label: 'Sesiones', path: 'sesiones', icon: 'calendar_month' },
    { label: 'Avisos', path: 'avisos', icon: 'campaign' },
    { label: 'Flashcards', path: 'flashcards', icon: 'style' },
    { label: 'Integrantes', path: 'integrantes', icon: 'groups' },
    { label: 'Solicitudes', path: 'solicitudes', icon: 'person_add' },
  ];
}
