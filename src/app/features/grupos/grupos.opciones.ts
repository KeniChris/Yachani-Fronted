import { DiaSemana } from './grupos.models';

// Pendiente de confirmar con backend: catálogos de método, modalidad y límites de capacidad.
export const METODOS_ESTUDIO = ['Resolución de ejercicios', 'Participativo', 'Práctico', 'Teórico'];
export const MODALIDADES_GRUPO = ['Virtual', 'Presencial', 'Mixta'];
export const CAPACIDAD_MINIMA = 2;
export const CAPACIDAD_MAXIMA = 30;
export const MAX_TEMAS_INICIALES = 10;

export const DIAS_SEMANA: { valor: DiaSemana; corto: string; etiqueta: string }[] = [
  { valor: 'lunes', corto: 'Lun', etiqueta: 'Lunes' },
  { valor: 'martes', corto: 'Mar', etiqueta: 'Martes' },
  { valor: 'miercoles', corto: 'Mié', etiqueta: 'Miércoles' },
  { valor: 'jueves', corto: 'Jue', etiqueta: 'Jueves' },
  { valor: 'viernes', corto: 'Vie', etiqueta: 'Viernes' },
  { valor: 'sabado', corto: 'Sáb', etiqueta: 'Sábado' },
  { valor: 'domingo', corto: 'Dom', etiqueta: 'Domingo' },
];

export const ICONOS_GRUPO: { valor: string; etiqueta: string }[] = [
  { valor: 'functions', etiqueta: 'Matemática' },
  { valor: 'calculate', etiqueta: 'Cálculo' },
  { valor: 'database', etiqueta: 'Base de datos' },
  { valor: 'code', etiqueta: 'Programación' },
  { valor: 'science', etiqueta: 'Ciencias' },
  { valor: 'psychology', etiqueta: 'Humanidades' },
  { valor: 'translate', etiqueta: 'Idiomas' },
  { valor: 'menu_book', etiqueta: 'General' },
];
