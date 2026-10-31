import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { Brand } from '../brand/brand';

@Component({
  selector: 'app-configuracion-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, MatButtonModule, Brand],
  templateUrl: './configuracion-layout.html',
  styleUrl: './configuracion-layout.css',
})
export class ConfiguracionLayout {}
