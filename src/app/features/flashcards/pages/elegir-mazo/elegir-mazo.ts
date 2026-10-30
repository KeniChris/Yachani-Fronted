import { Component } from '@angular/core';
import { rutaFlashcardsGrupo } from '../../flashcards-grupo.routes';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-elegir-mazo',
  standalone: true,
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
  ],
  templateUrl: './elegir-mazo.html',
  styleUrls: ['../../../recursos/recursos.css', '../../flashcards.css', './elegir-mazo.css'],
})
export class ElegirMazo {
  readonly flashcardsGrupo = rutaFlashcardsGrupo();
}
