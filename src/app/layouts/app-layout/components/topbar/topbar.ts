import { Component, Input, Output,EventEmitter} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './topbar.html',
  styleUrl: './topbar.css'
})
export class Topbar {
  @Input() userName = '';
  @Input() role: 'estudiante' | 'tutor' = 'estudiante';
  @Input() showMenuButton = false;
  @Input() menuOpen = false;
  @Output() menuToggle = new EventEmitter<void>();

  get initials(): string {
    return this.userName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  }
}