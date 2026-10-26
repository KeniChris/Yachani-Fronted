import { Component } from '@angular/core';
import { Hero } from '../../components/hero/hero';
import { About } from '../../components/about/about';
import { Benefits } from '../../components/benefits/benefits';
import { HowItWorks } from '../../components/how-it-works/how-it-works';
import { VideoSection } from '../../components/video-section/video-section';
import { PublicoObjetivo } from '../../components/publico-objetivo/publico-objetivo';
import { PreguntasFrecuentes } from '../../components/preguntas-frecuentes/preguntas-frecuentes';
import { Contacto } from '../../components/contacto/contacto';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [Hero, About, Benefits, HowItWorks, VideoSection, PublicoObjetivo, PreguntasFrecuentes, Contacto],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.css'
})
export class LandingPage {}