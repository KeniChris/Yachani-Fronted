import { Component, inject, Input, Output, EventEmitter, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

type RolTutorial = 'estudiante' | 'tutor';

@Component({
  selector: 'app-tutorial-landing',
  standalone: true,
  imports: [MatButtonModule, MatButtonToggleModule],
  templateUrl: './tutorial-landing.html',
  styleUrl: './tutorial-landing.css',
})
export class TutorialLanding {
  private readonly sanitizer = inject(DomSanitizer);
  private rolActual: RolTutorial = 'estudiante';
  readonly reproduciendo = signal(false);
  @Output() readonly rolChange = new EventEmitter<RolTutorial>();
  @Input() set rol(valor: RolTutorial) {
    this.rolActual = valor;
    this.reproduciendo.set(false);
  }
  get rol(): RolTutorial {
    return this.rolActual;
  }

  // Identificadores fijos de los tutoriales proporcionados por el equipo.
  readonly tutoriales = {
    estudiante: this.crearTutorial(
      'BKrl1zL8zDU',
      'estudiantes',
      'Encuentra un grupo de estudio, comparte materiales y repasa con tus compañeros.',
    ),
    tutor: this.crearTutorial(
      'kwnOnu7YtMQ',
      'tutores',
      'Crea tu grupo, organiza las sesiones y comparte recursos con tus estudiantes.',
    ),
  };

  get tutorial() {
    return this.tutoriales[this.rol];
  }

  private crearTutorial(id: string, publico: string, descripcion: string) {
    return {
      titulo: `Yachani para ${publico}`,
      descripcion,
      enlace: `https://www.youtube.com/watch?v=${id}`,
      // Solo se construye con los dos IDs constantes, nunca con datos del visitante.
      reproductor: this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`,
      ),
    };
  }
}
