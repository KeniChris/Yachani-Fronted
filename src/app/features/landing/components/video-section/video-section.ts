import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-video-section',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './video-section.html',
  styleUrl: './video-section.css'
})
export class VideoSection {
  // Agrega aquí la ruta cuando tengas el tutorial.
  videoUrl = '';
}