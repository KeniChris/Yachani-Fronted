import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-perfil-estudiante',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './perfil-estudiante.html',
  styleUrls: ['../../perfiles.css', './perfil-estudiante.css'],
})
export class PerfilEstudiante {
  @Input() estado = 'disponible';
}
