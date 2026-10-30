import { Component } from '@angular/core';
import { rutaGrupoActual } from '../../../grupos/ruta-grupo-actual';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-recursos-grupo',
  standalone: true,
  imports: [RouterLink, MatButtonModule, RouterOutlet, RouterLinkActive],
  templateUrl: './recursos-grupo.html',
  styleUrls: ['../../recursos.css', './recursos-grupo.css'],
})
export class RecursosGrupo {
  readonly grupo = rutaGrupoActual();
}
