import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './solicitudes.html',
  styleUrl: './solicitudes.css',
})
export class Solicitudes {
  // Estados de Figma mediante ?estado=: aceptada (Q03), rechazada (Q05) y vacio (Q06).
  @Input() estado = '';
  readonly solicitudes = [
    { iniciales: 'IC', nombre: 'Irene Castro', fecha: 'Solicitó unirse el 29 oct 2026' },
    { iniciales: 'PD', nombre: 'Pedro Díaz', fecha: 'Solicitó unirse el 29 oct 2026' },
  ];
  constructor(public readonly dialog: MatDialog) {}
}
