import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recursos-grupo',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterOutlet,
    RouterLinkActive,
  ],
  templateUrl: './recursos-grupo.html',
  styleUrls: ['../../recursos.css', './recursos-grupo.css'],
})
export class RecursosGrupo {
  readonly pestanas = [
    { nombre: 'Chat', icono: 'chat' },
    { nombre: 'Temas y materiales', icono: 'menu_book' },
    { nombre: 'Sesiones', icono: 'calendar_month' },
    { nombre: 'Avisos', icono: 'campaign' },
    { nombre: 'Flashcards', icono: 'style' },
    { nombre: 'Integrantes', icono: 'groups' },
  ];
}
