import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {
  readonly values = [
    {
      icon: 'groups',
      title: 'Colaboración',
      description: 'Aprendemos mejor juntos.'
    },
    {
      icon: 'event_available',
      title: 'Compromiso',
      description: 'Constancia y puntualidad en cada sesión.'
    },
    {
      icon: 'verified_user',
      title: 'Confianza',
      description: 'Un espacio seguro para estudiar y compartir.'
    },
    {
      icon: 'favorite',
      title: 'Inclusión',
      description: 'Aprendizaje accesible para todos.'
    }
  ];

  readonly team = [
    { name: 'Vanessa Barrientos', initials: 'VB' },
    { name: 'Anabella Huamán', initials: 'AH' },
    { name: 'Linda Leon', initials: 'LL' },
    { name: 'Leicy Cahuana', initials: 'LC' }
  ];
}