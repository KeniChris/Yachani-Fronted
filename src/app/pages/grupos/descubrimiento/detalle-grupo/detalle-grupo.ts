import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-detalle-grupo',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './detalle-grupo.html',
  styleUrl: './detalle-grupo.css',
})
export class DetalleGrupo {
  // Estado de la pantalla: disponible (D05), enviada (D06), sin-cupos (D07),
  // registrada (D08) o integrante (D10).
  @Input() estado = 'disponible';
}
