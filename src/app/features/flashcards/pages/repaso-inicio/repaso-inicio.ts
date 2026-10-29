import { Component } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-repaso-inicio',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
  ],
  templateUrl: './repaso-inicio.html',
  styleUrls: ['../../../recursos/recursos.css', '../../flashcards.css', './repaso-inicio.css'],
})
export class RepasoInicio {
  readonly esAutor = true;
  readonly esAdministrador = false;
}
