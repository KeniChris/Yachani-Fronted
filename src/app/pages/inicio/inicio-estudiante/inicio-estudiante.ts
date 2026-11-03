import { Component, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-inicio-estudiante',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './inicio-estudiante.html',
  styleUrl: './inicio-estudiante.css',
})
export class InicioEstudiante {
  private readonly authService = inject(AuthService);

  get nombre(): string {
    return this.authService.usuario()?.nombres.trim().split(/\s+/)[0] ?? '';
  }

  @Input({
    transform: (valor: unknown) => (Array.isArray(valor) ? valor : []),
  })
  grupos: readonly {
    id: string;
    nombre: string;
    descripcion?: string;
    responsable?: string;
    detalle?: string;
  }[] = [];
}