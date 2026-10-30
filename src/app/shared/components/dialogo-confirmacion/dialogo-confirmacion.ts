import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Observable, map } from 'rxjs';

export interface DatosConfirmacion {
  titulo: string;
  mensaje: string;
  confirmar: string;
  cancelar?: string;
  // 'peligro' para acciones destructivas: eliminar, cancelar o rechazar.
  tono?: 'normal' | 'peligro';
  icono?: string;
}

@Component({
  selector: 'app-dialogo-confirmacion',
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './dialogo-confirmacion.html',
  styleUrl: './dialogo-confirmacion.css',
})
export class DialogoConfirmacion {
  readonly datos = inject<DatosConfirmacion>(MAT_DIALOG_DATA);
}

// Abre la confirmación y emite true solo si la persona confirma.
export function confirmarAccion(dialog: MatDialog, datos: DatosConfirmacion): Observable<boolean> {
  return dialog.open(DialogoConfirmacion, { data: datos, width: '420px', maxWidth: 'calc(100vw - 32px)', autoFocus: 'dialog' })
    .afterClosed().pipe(map(resultado => resultado === true));
}
