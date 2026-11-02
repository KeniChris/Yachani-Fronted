import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-inicio-tutor',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './inicio-tutor.html',
  styleUrl: './inicio-tutor.css',
})
export class InicioTutor {
  // Entradas vacías hasta que la integración proporcione datos; no dependen del rol visual.
  @Input({ transform: (valor: unknown) => (Array.isArray(valor) ? valor : []) }) grupos: readonly {
    id: string;
    nombre: string;
    descripcion?: string;
    responsable?: string;
    detalle?: string;
  }[] = [];
}
