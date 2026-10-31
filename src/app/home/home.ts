import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
export class Home {
  readonly audience = new FormGroup({
    rol: new FormControl('estudiante', { nonNullable: true }),
  });
  readonly contactForm = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: Validators.required }),
    correo: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    asunto: new FormControl('', { nonNullable: true, validators: Validators.required }),
    mensaje: new FormControl('', { nonNullable: true, validators: Validators.required }),
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
    { time: '0:00', label: 'Regístrate' },
    { time: '0:35', label: 'Busca un grupo' },
    { time: '1:10', label: 'Únete y aprende' },
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
  readonly testimonials = [
    {
      text: '“Antes coordinábamos todo por WhatsApp y se perdían los archivos. Con Yachani encontré un grupo de Cálculo y aprobé con 16.”',
      role: 'Estudiante · Ing. de Sistemas, UPC',
    },
    {
      text: '“Las flashcards del grupo me salvaron en los parciales. Repasamos juntos todas las noches antes del examen.”',
      role: 'Estudiante · Ing. de Software, UPC',
    },
    {
      text: '“Como tutora puedo organizar mis sesiones, compartir guías y ver cómo avanza cada estudiante.”',
      role: 'Tutora · Física I, UPC',
    },
  ];
  // Los frames solo contienen los encabezados cerrados; no se inventan respuestas.
  readonly questions = [
    '¿Yachani es gratis?',
    '¿Quién puede ser tutor?',
    '¿Cómo puedo unirme a un grupo de estudio?',
    '¿Cómo funciona la recomendación con IA?',
    '¿Qué formatos de archivo puedo subir?',
  ];
  readonly contact = [
    { icon: 'email', label: 'Correo de contacto', value: 'contacto@yachani.pe' },
    { icon: 'location', label: 'Ubicación', value: 'Lima, Perú' },
    { icon: 'social', label: 'Redes sociales', value: '@yachani.pe' },
  ];
}
