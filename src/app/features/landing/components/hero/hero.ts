import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class Hero {
  selectedRole: 'estudiante' | 'tutor' = 'estudiante';
}