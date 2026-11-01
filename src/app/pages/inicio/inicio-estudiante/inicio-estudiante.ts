import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-inicio-estudiante',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './inicio-estudiante.html',
  styleUrl: './inicio-estudiante.css',
})
export class InicioEstudiante {
  @Input({ transform: (valor: unknown) => Array.isArray(valor) ? valor : [] }) grupos: readonly {
    id: string;
    nombre: string;
    descripcion?: string;
    responsable?: string;
    detalle?: string;
  }[] = [];
}
