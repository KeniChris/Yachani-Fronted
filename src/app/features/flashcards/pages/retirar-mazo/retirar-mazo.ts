import { Component } from '@angular/core';
import { rutaFlashcardsGrupo } from '../../flashcards-grupo.routes';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-retirar-mazo',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './retirar-mazo.html',
  styleUrls: ['../../../recursos/recursos.css', '../../flashcards.css', './retirar-mazo.css'],
})
export class RetirarMazo {
  readonly flashcardsGrupo = rutaFlashcardsGrupo();
  readonly publicacion: boolean;
  readonly esAutor = true;
  readonly esAdministrador = false;
  constructor(route: ActivatedRoute) {
    this.publicacion = route.snapshot.data['publicacion'] === true;
  }
}
