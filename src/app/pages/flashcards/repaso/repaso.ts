import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatStepperModule } from '@angular/material/stepper';

@Component({
  selector: 'app-repaso',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatDialogModule, MatProgressBarModule, MatStepperModule],
  templateUrl: './repaso.html',
  styleUrls: ['../flashcards.css', './repaso.css'],
})
export class Repaso {
  @Input() mazoId = 'formulas';
  @Input() enGrupo = false;
  @Input() rol = 'estudiante';
  @Input() permiso = 'integrante';
  @Input() autoria = 'propio';
  @Input() contexto = 'tutor';
  @Input() publicaciones = 'todos';
  constructor(public readonly dialog: MatDialog) {}
}
