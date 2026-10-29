import { Component } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-repaso-pausa',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './repaso-pausa.html',
  styleUrls: ['../../../recursos/recursos.css', '../../flashcards.css', './repaso-pausa.css'],
})
export class RepasoPausa {}
