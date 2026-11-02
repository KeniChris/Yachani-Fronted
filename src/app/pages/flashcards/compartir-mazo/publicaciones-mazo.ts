import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CompartirMazo } from './compartir-mazo';

@Component({
  selector: 'app-publicaciones-mazo',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatDialogModule],
  templateUrl: './publicaciones-mazo.html',
  styleUrls: ['../flashcards.css', './publicaciones-mazo.css'],
})
export class PublicacionesMazo {
  @Input() mazoId = 'formulas';
  @Input() rol = 'estudiante';
  @Input() contexto = 'tutor';
  readonly compartirMazo = CompartirMazo;
  constructor(public readonly dialog: MatDialog) {}
}
