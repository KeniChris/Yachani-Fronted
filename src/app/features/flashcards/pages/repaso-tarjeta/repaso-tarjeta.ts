import { Component } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-repaso-tarjeta',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
  ],
  templateUrl: './repaso-tarjeta.html',
  styleUrls: ['../../../recursos/recursos.css', '../../flashcards.css', './repaso-tarjeta.css'],
})
export class RepasoTarjeta {
  readonly mostrandoRespuesta: boolean;
  constructor(route: ActivatedRoute) {
    this.mostrandoRespuesta = route.snapshot.data['respuesta'] === true;
  }
}
