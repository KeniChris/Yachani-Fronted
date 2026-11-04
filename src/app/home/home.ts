import {
  afterNextRender,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { textoRequerido } from '../core/services/recursos-ui';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
  host: { class: 'yachani-dark' },
})
export class Home implements OnDestroy {
  @ViewChild('pageNavigation') private pageNavigation?: ElementRef<HTMLElement>;
  seccionActiva = 'inicio';
  indicador = { izquierda: 0, arriba: 0, ancho: 0 };
  private resizeObserver?: ResizeObserver;

  constructor(
    private host: ElementRef<HTMLElement>,
    private changeDetector: ChangeDetectorRef,
  ) {
    afterNextRender(() => {
      this.actualizarSeccion();
      this.resizeObserver = new ResizeObserver(() => this.actualizarIndicador());
      const nav = this.pageNavigation?.nativeElement;
      if (nav) {
        this.resizeObserver.observe(nav);
        nav
          .querySelectorAll('[data-anchor]')
          .forEach((label) => this.resizeObserver!.observe(label));
      }
    });
  }

  @HostListener('window:scroll')
  @HostListener('window:resize')
  actualizarSeccion(): void {
    const limite = window.innerHeight * 0.3;
    let activa = 'inicio';
    for (const link of this.navigation) {
      const section = this.host.nativeElement.querySelector<HTMLElement>('#' + link.anchor);
      if (section && section.getBoundingClientRect().top <= limite) activa = link.anchor;
    }
    if (
      window.scrollY > 0 &&
      window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
    ) {
      activa = 'contacto';
    }
    this.seccionActiva = activa;
    this.actualizarIndicador();
  }

  irASeccion(event: MouseEvent, anchor: string): void {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
      return;
    const section = this.host.nativeElement.querySelector<HTMLElement>('#' + anchor);
    if (!section) return;
    event.preventDefault();
    this.seccionActiva = anchor;
    this.actualizarIndicador();
    section.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
      block: 'start',
    });
  }

  private actualizarIndicador(): void {
    const nav = this.pageNavigation?.nativeElement;
    const label = nav?.querySelector<HTMLElement>('[data-anchor="' + this.seccionActiva + '"]');
    if (!nav || !label) return;
    const parent = nav.getBoundingClientRect();
    const rect = label.getBoundingClientRect();
    this.indicador = {
      izquierda: rect.left - parent.left,
      arriba: rect.bottom - parent.top + 6,
      ancho: rect.width,
    };
    this.changeDetector.markForCheck();
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }
  readonly audience = new FormGroup({
    rol: new FormControl('estudiante', { nonNullable: true }),
  });
  readonly contactForm = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: textoRequerido }),
    correo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    asunto: new FormControl('', { nonNullable: true, validators: textoRequerido }),
    mensaje: new FormControl('', { nonNullable: true, validators: textoRequerido }),
  });
  readonly navigation = [
    { label: 'Inicio', anchor: 'inicio' },
    { label: 'Quiénes somos', anchor: 'quienes-somos' },
    { label: 'Qué ofrecemos', anchor: 'beneficios' },
    { label: 'Cómo funciona', anchor: 'como-funciona' },
    { label: 'Contáctanos', anchor: 'contacto' },
  ];
  readonly values = [
    { icon: 'collaboration', title: 'Colaboración', text: 'Aprendemos mejor juntos.' },
    { icon: 'commitment', title: 'Compromiso', text: 'Constancia y puntualidad en cada sesión.' },
    { icon: 'trust', title: 'Confianza', text: 'Un espacio seguro para estudiar y compartir.' },
    { icon: 'inclusion', title: 'Inclusión', text: 'Aprendizaje accesible para todos.' },
  ];
  readonly team = [
    { initials: 'VB', name: 'Vanessa Barrientos' },
    { initials: 'AH', name: 'Anabella Huamán' },
    { initials: 'LL', name: 'Linda Leon' },
    { initials: 'LC', name: 'Leicy Cahuana' },
  ];
  readonly benefits = [
    {
      icon: 'groups',
      title: 'Encuentra grupos',
      text: 'Filtra por curso, tema y modalidad presencial o virtual.',
    },
    {
      icon: 'materials',
      title: 'Comparte materiales',
      text: 'Sube apuntes, resúmenes y ejercicios para todo el grupo.',
    },
    {
      icon: 'chat',
      title: 'Chat grupal',
      text: 'Coordina sesiones y resuelve dudas en tiempo real.',
    },
    {
      icon: 'flashcards',
      title: 'Flashcards',
      text: 'Crea tarjetas de repaso y practica antes de cada examen.',
    },
  ];
  readonly steps = [
    {
      number: 1,
      icon: 'register',
      title: 'Regístrate',
      text: 'Crea tu cuenta gratis con tu correo y elige tus cursos de interés.',
      mobile: 'Crea tu cuenta gratis y elige tus cursos de interés.',
    },
    {
      number: 2,
      icon: 'search',
      title: 'Busca un grupo',
      text: 'Explora grupos por curso, tema o modalidad que encajen con tu horario.',
      mobile: 'Explora grupos por curso, tema o modalidad.',
    },
    {
      number: 3,
      icon: 'join',
      title: 'Únete y aprende',
      text: 'Solicita unirte, comparte materiales y estudia con tu nuevo grupo.',
      mobile: 'Comparte materiales y estudia con tu nuevo grupo.',
    },
  ];
  readonly roleBenefits = [
    {
      title: 'Para estudiantes',
      items: [
        {
          text: 'Encuentra compañeros de tu mismo curso.',
          mobile: 'Encuentra compañeros de tu curso.',
        },
        {
          text: 'Accede a materiales y flashcards del grupo.',
          mobile: 'Accede a materiales y flashcards.',
        },
        {
          text: 'Resuelve dudas en el chat antes del examen.',
          mobile: 'Resuelve dudas en el chat.',
        },
      ],
    },
    {
      title: 'Para tutores',
      items: [
        { text: 'Crea grupos y define cupos y modalidad.', mobile: 'Crea grupos y define cupos.' },
        { text: 'Comparte guías y ejercicios resueltos.', mobile: 'Comparte guías y ejercicios.' },
        { text: 'Acompaña el avance de tus estudiantes.', mobile: 'Acompaña el avance del grupo.' },
      ],
    },
  ];
  readonly chapters = [
    { time: '1', label: 'Regístrate' },
    { time: '2', label: 'Busca un grupo' },
    { time: '3', label: 'Únete y aprende' },
  ];
  readonly audiences = [
    {
      icon: 'groups',
      title: 'Estudiantes de pregrado',
      text: 'Que buscan compañeros de su mismo curso para repasar antes del examen.',
    },
    {
      icon: 'flashcards',
      title: 'Estudiantes que repasan',
      text: 'Que quieren organizar materiales y flashcards en un solo lugar.',
    },
    {
      icon: 'chat',
      title: 'Tutores y alumnos destacados',
      text: 'Que desean guiar grupos, compartir guías y resolver dudas.',
    },
  ];
  readonly questions: readonly { pregunta: string; respuesta: string }[] = [
    {
      pregunta: '¿Qué puedo hacer en Yachani?',
      respuesta:
        'Puedes encontrar grupos de estudio, compartir materiales, conversar con tus compañeros y repasar con flashcards.',
    },
    {
      pregunta: '¿Quién puede ser tutor?',
      respuesta:
        'Los estudiantes que desean compartir sus conocimientos y acompañar a otros pueden registrarse como estudiantes tutores y organizar grupos de estudio.',
    },
    {
      pregunta: '¿Cómo puedo unirme a un grupo de estudio?',
      respuesta:
        'Regístrate, busca un grupo por curso o tema y revisa sus detalles. Si tiene cupos disponibles, envía una solicitud para que quien administra el grupo la revise.',
    },
    {
      pregunta: '¿Cómo funciona la recomendación con IA?',
      respuesta:
        'La recomendación con IA está prevista para una próxima entrega. Mientras tanto, puedes buscar grupos y aplicar los filtros disponibles.',
    },
    {
      pregunta: '¿Qué formatos de archivo puedo subir?',
      respuesta:
        'Puedes compartir PDF, DOCX, PPTX, XLSX, PNG, JPG o JPEG. Cada envío permite hasta 5 archivos de 10 MB cada uno.',
    },
  ];
  prepararCorreo(): void {
    this.contactForm.markAllAsTouched();
    if (this.contactForm.invalid) return;
    const datos = this.contactForm.getRawValue();
    const cuerpo = `Nombre: ${datos.nombre.trim()}\nCorreo: ${datos.correo.trim()}\n\n${datos.mensaje.trim()}`;
    window.location.href = `mailto:yachani.soporte@gmail.com?subject=${encodeURIComponent(datos.asunto.trim())}&body=${encodeURIComponent(cuerpo)}`;
  }
  readonly testimonials = [
    {
      text: 'Antes coordinábamos todo por WhatsApp y se perdían los archivos. Con Yachani encontré un grupo de Cálculo y aprobé con 16.',
      role: 'Estudiante · Ing. de Sistemas, UPC',
    },
    {
      text: 'Las flashcards del grupo me salvaron en los parciales. Repasamos juntos todas las noches antes del examen.',
      role: 'Estudiante · Ing. de Software, UPC',
    },
    {
      text: 'Como tutora puedo organizar mis sesiones, compartir guías y ver cómo avanza cada estudiante.',
      role: 'Tutora · Física I, UPC',
    },
  ];
  readonly contact = [
    { icon: 'email', label: 'Correo de contacto', value: 'yachani.soporte@gmail.com' },
    { icon: 'location', label: 'Ubicación', value: 'Lima, Perú' },
    { icon: 'social', label: 'Redes sociales', value: '@yachani.pe' },
  ];
}
