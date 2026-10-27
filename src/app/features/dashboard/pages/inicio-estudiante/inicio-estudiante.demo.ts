import { DatosInicioEstudiante } from './inicio-estudiante.models';

// Datos exclusivamente de demostración. No representan una sesión autenticada,
// recomendaciones de IA ni actividad real de un usuario.
export const USUARIO_DEMOSTRACION = { nombre: 'Estudiante de demostración' };
export function crearDatosDemostracion(): DatosInicioEstudiante {
  return {
    sesion: { estado: 'listo', datos: { titulo: 'Cálculo I — Límites y continuidad', grupo: 'Dominando Cálculo', horario: 'Hoy, 7:00 p. m.', duracionMinutos: 60, modalidad: 'Virtual' } },
    grupos: { estado: 'listo', datos: [
      { id: 'calculo', titulo: 'Dominando Cálculo', tema: 'Límites y derivadas', icono: 'calculate', miembros: ['AL', 'JM', 'CP'], integrantes: 5, sinLeer: 4 },
      { id: 'datos', titulo: 'Base de Datos UPC', tema: 'SQL y modelado', icono: 'database', miembros: ['LR', 'MS', 'DR'], integrantes: 4, sinLeer: 2 },
      { id: 'fisica', titulo: 'Física en equipo', tema: 'Dinámica y energía', icono: 'science', miembros: ['AV', 'FM', 'RG'], integrantes: 6, sinLeer: null },
    ] },
    recomendaciones: { estado: 'listo', datos: [
      { id: 'algoritmos', titulo: 'Algoritmos sin miedo', descripcion: 'Práctica colaborativa de estructuras de datos.', compatibilidad: 95, etiquetas: ['Algoritmos', 'Virtual'] },
      { id: 'estadistica', titulo: 'Estadística aplicada', descripcion: 'Ejercicios y preparación para evaluaciones.', compatibilidad: 89, etiquetas: ['Estadística', 'Mixta'] },
      { id: 'web', titulo: 'Programación Web', descripcion: 'Proyectos y resolución de dudas en equipo.', compatibilidad: 84, etiquetas: ['Desarrollo web', 'Presencial'] },
    ] },
    avisos: { estado: 'listo', datos: [
      { id: 'horario', texto: 'La sesión de Base de Datos cambió de horario', fecha: 'Hace 20 minutos' },
      { id: 'mensajes', texto: 'Tienes 4 mensajes nuevos en Dominando Cálculo', fecha: 'Hace 1 hora' },
      { id: 'solicitud', texto: 'Tu solicitud para Algoritmos sin miedo fue enviada', fecha: 'Ayer' },
    ] },
    flashcards: { estado: 'listo', datos: [
      { id: 'sql', titulo: 'Conceptos de SQL', completadas: 18, total: 30 },
      { id: 'derivadas', titulo: 'Fórmulas de derivadas', completadas: 12, total: 20 },
      { id: 'conceptos', titulo: 'Conceptos de física', completadas: 9, total: 25 },
    ] },
  };
}
