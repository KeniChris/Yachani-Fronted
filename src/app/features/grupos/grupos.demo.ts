import { DatosGrupos, IntegranteGrupo, RolGrupo } from './grupos.models';
import { formatearHora, textoCambioSesion } from './grupos.formato';

// Activar solo para revisar el diseño. Los cambios viven en memoria y no se envían al backend.
export const MODO_PREVISUALIZACION_GRUPOS = true;

// Información exclusivamente visual: no representa usuarios ni actividad reales.
export const USUARIOS_DEMOSTRACION: Record<RolGrupo, { id: string; nombre: string; carrera: string; ciclo: string }> = {
  tutor: { id: 'carlos-rios', nombre: 'Carlos Ríos', carrera: 'Ing. de Software', ciclo: '9.º ciclo' },
  estudiante: { id: 'anabella-huaman', nombre: 'Anabella Huamán', carrera: 'Ing. de Sistemas', ciclo: '3.er ciclo' },
};

const MINUTO = 60_000;

function enDias(base: Date, dias: number, horas: number, minutos = 0): Date {
  const fecha = new Date(base);
  fecha.setDate(fecha.getDate() + dias);
  fecha.setHours(horas, minutos, 0, 0);
  return fecha;
}

export function crearDatosGruposDemostracion(ahora = new Date()): DatosGrupos {
  const hace = (minutos: number) => new Date(ahora.getTime() - minutos * MINUTO);
  // La primera sesión empieza en 30 minutos para revisar el recordatorio.
  const proxima = new Date(Math.floor(ahora.getTime() / MINUTO) * MINUTO + 30 * MINUTO);
  const calculo = 'dominando-calculo';

  const integrante = (usuarioId: string, nombre: string, carrera: string, ciclo: string, dias: number, rol: RolGrupo = 'estudiante'): IntegranteGrupo =>
    ({ grupoId: calculo, usuarioId, nombre, carrera, ciclo, rol, fechaIngreso: dias === 0 ? hace(90) : enDias(ahora, -dias, 10) });

  const normalizacion = { inicio: enDias(ahora, 1, 18), anterior: enDias(ahora, 0, 17) };

  return {
    grupos: [
      { id: calculo, nombre: 'Dominando Cálculo', curso: 'Cálculo I', tema: 'Límites y derivadas', metodo: 'Resolución de ejercicios', icono: 'functions', modalidad: 'Virtual', capacidadMaxima: 10, tutorId: 'carlos-rios',
        descripcion: 'Resolvemos ejercicios de límites y derivadas paso a paso, con repasos antes de cada parcial.', horario: { dias: ['martes', 'jueves'], inicio: '19:00', fin: '20:30' } },
      { id: 'algebra-lineal', nombre: 'Álgebra lineal en equipo', curso: 'Álgebra Lineal', tema: 'Matrices y vectores', metodo: 'Participativo', icono: 'calculate', modalidad: 'Mixta', capacidadMaxima: 8, tutorId: 'carlos-rios',
        descripcion: 'Practicamos operaciones con matrices, sistemas de ecuaciones y espacios vectoriales.', horario: { dias: ['sabado'], inicio: '10:00', fin: '12:00' } },
      { id: 'base-datos-upc', nombre: 'Base de Datos UPC', curso: 'Base de Datos', tema: 'SQL y modelado', metodo: 'Participativo', icono: 'database', modalidad: 'Virtual', capacidadMaxima: 6, tutorId: 'valeria-torres',
        descripcion: 'Practicamos consultas SQL y normalización con casos reales.', horario: { dias: ['lunes', 'miercoles'], inicio: '18:00', fin: '20:00' } },
      { id: 'fisica-equipo', nombre: 'Física en equipo', curso: 'Física I', tema: 'Dinámica y energía', metodo: 'Práctico', icono: 'science', modalidad: 'Presencial', capacidadMaxima: 6, tutorId: 'carlos-mendoza',
        descripcion: 'Resolvemos problemas de dinámica y energía en el laboratorio.', horario: { dias: ['sabado'], inicio: '10:00', fin: '11:30' } },
    ],
    integrantes: [
      integrante('carlos-rios', 'Carlos Ríos', 'Ing. de Software', '9.º ciclo', 13, 'tutor'),
      integrante('anabella-huaman', 'Anabella Huamán', 'Ing. de Sistemas', '3.er ciclo', 13),
      integrante('lucia-paredes', 'Lucía Paredes', 'Ing. Industrial', '3.er ciclo', 12),
      integrante('diego-salas', 'Diego Salas', 'Ing. Civil', '2.º ciclo', 11),
      integrante('maria-vega', 'María Vega', 'Ing. de Software', '3.er ciclo', 10),
      integrante('jose-quispe', 'José Quispe', 'Ing. Electrónica', '4.º ciclo', 9),
      integrante('rosa-mendoza', 'Rosa Mendoza', 'Ing. de Sistemas', '3.er ciclo', 8),
      integrante('ana-torres', 'Ana Torres', 'Ing. Industrial', '2.º ciclo', 0),
      { ...integrante('carlos-rios', 'Carlos Ríos', 'Ing. de Software', '9.º ciclo', 20, 'tutor'), grupoId: 'algebra-lineal' },
      { ...integrante('maria-vega', 'María Vega', 'Ing. de Software', '3.er ciclo', 18), grupoId: 'algebra-lineal' },
      { ...integrante('jose-quispe', 'José Quispe', 'Ing. Electrónica', '4.º ciclo', 15), grupoId: 'algebra-lineal' },
      { ...integrante('valeria-torres', 'Valeria Torres', 'Ing. de Sistemas', '10.º ciclo', 30, 'tutor'), grupoId: 'base-datos-upc' },
      { ...integrante('anabella-huaman', 'Anabella Huamán', 'Ing. de Sistemas', '3.er ciclo', 20), grupoId: 'base-datos-upc' },
      { ...integrante('lucia-paredes', 'Lucía Paredes', 'Ing. Industrial', '3.er ciclo', 19), grupoId: 'base-datos-upc' },
      { ...integrante('carlos-mendoza', 'Carlos Mendoza', 'Ing. Mecánica', '10.º ciclo', 25, 'tutor'), grupoId: 'fisica-equipo' },
      { ...integrante('anabella-huaman', 'Anabella Huamán', 'Ing. de Sistemas', '3.er ciclo', 16), grupoId: 'fisica-equipo' },
    ],
    temas: [
      { id: 'limites-continuidad', grupoId: calculo, nombre: 'Límites y continuidad' },
      { id: 'reglas-derivacion', grupoId: calculo, nombre: 'Reglas de derivación' },
      { id: 'aplicaciones-derivada', grupoId: calculo, nombre: 'Aplicaciones de la derivada' },
      { id: 'integrales-definidas', grupoId: calculo, nombre: 'Integrales definidas' },
      { id: 'matrices', grupoId: 'algebra-lineal', nombre: 'Matrices y determinantes' },
      { id: 'sistemas-ecuaciones', grupoId: 'algebra-lineal', nombre: 'Sistemas de ecuaciones' },
      { id: 'normalizacion', grupoId: 'base-datos-upc', nombre: 'Normalización' },
      { id: 'dinamica-energia', grupoId: 'fisica-equipo', nombre: 'Dinámica y energía' },
    ],
    mensajes: [
      { id: 'm1', grupoId: calculo, autorId: 'lucia-paredes', contenido: '¿Alguien resolvió el ejercicio 5 de límites laterales?', adjunto: null, fechaEnvio: hace(6), eliminado: false },
      { id: 'm2', grupoId: calculo, autorId: 'anabella-huaman', contenido: 'Sí, ya lo tengo. Les comparto mi solución', adjunto: null, fechaEnvio: hace(5), eliminado: false },
      { id: 'm3', grupoId: calculo, autorId: 'anabella-huaman', contenido: '', adjunto: { nombre: 'Limites_ejercicio5.pdf', tamanoBytes: 1_258_291, extension: 'pdf', temaId: 'limites-continuidad' }, fechaEnvio: hace(4), eliminado: false },
      { id: 'm4', grupoId: calculo, autorId: 'diego-salas', contenido: '', adjunto: null, fechaEnvio: hace(3), eliminado: true },
      { id: 'm5', grupoId: calculo, autorId: 'carlos-rios', contenido: `Perfecto. Revisamos ese ejercicio en la sesión de hoy a las ${formatearHora(proxima)}.`, adjunto: null, fechaEnvio: hace(2), eliminado: false },
      { id: 'm6', grupoId: calculo, autorId: 'anabella-huaman', contenido: 'Nos vemos en la sesión', adjunto: null, fechaEnvio: new Date(ahora.getTime() - 28_000), eliminado: false },
      { id: 'm7', grupoId: calculo, autorId: 'lucia-paredes', contenido: '', adjunto: { nombre: 'Resumen_derivadas.pptx', tamanoBytes: 3_145_728, extension: 'pptx', temaId: 'reglas-derivacion' }, fechaEnvio: enDias(ahora, -1, 19, 20), eliminado: false },
    ],
    sesiones: [
      { id: 'limites', grupoId: calculo, titulo: 'Límites y continuidad', temaId: 'limites-continuidad', inicio: proxima, fin: new Date(proxima.getTime() + 60 * MINUTO), modalidad: 'virtual', enlaceLugar: 'meet.google.com/abc-defg-hij', descripcion: 'Límites laterales y continuidad en un punto.', estado: 'programada', anterior: null, recordatorioMinutos: 30 },
      { id: 'derivadas', grupoId: calculo, titulo: 'Base de ejercicios – Derivadas', temaId: 'reglas-derivacion', inicio: enDias(ahora, 2, 18), fin: enDias(ahora, 2, 19, 30), modalidad: 'virtual', enlaceLugar: 'Aula virtual', descripcion: 'Práctica de regla de la cadena, producto y cociente.', estado: 'modificada', anterior: { inicio: enDias(ahora, 2, 17), fin: enDias(ahora, 2, 18, 30) }, recordatorioMinutos: 30 },
      { id: 'repaso', grupoId: calculo, titulo: 'Repaso de derivadas', temaId: 'aplicaciones-derivada', inicio: enDias(ahora, 4, 10), fin: enDias(ahora, 4, 11, 30), modalidad: 'presencial', enlaceLugar: 'Biblioteca UPC, sala 3 (2.º piso)', descripcion: 'Repaso final antes del parcial.', estado: 'programada', anterior: null, recordatorioMinutos: 30 },
      { id: 'integrales', grupoId: calculo, titulo: 'Integrales – Introducción', temaId: 'integrales-definidas', inicio: enDias(ahora, 5, 19), fin: enDias(ahora, 5, 20), modalidad: 'virtual', enlaceLugar: 'meet.google.com/abc-defg-hij', descripcion: 'Introducción a la integral definida y sumas de Riemann.', estado: 'cancelada', anterior: null, recordatorioMinutos: 30 },
      { id: 'normalizacion', grupoId: 'base-datos-upc', titulo: 'Normalización (1FN a 3FN)', temaId: 'normalizacion', inicio: normalizacion.inicio, fin: new Date(normalizacion.inicio.getTime() + 90 * MINUTO), modalidad: 'virtual', enlaceLugar: 'meet.google.com/bdu-norm-123', descripcion: '', estado: 'modificada', anterior: { inicio: normalizacion.anterior, fin: new Date(normalizacion.anterior.getTime() + 90 * MINUTO) }, recordatorioMinutos: 30 },
      { id: 'dinamica', grupoId: 'fisica-equipo', titulo: 'Dinámica y energía', temaId: 'dinamica-energia', inicio: enDias(ahora, 3, 10), fin: enDias(ahora, 3, 11, 30), modalidad: 'presencial', enlaceLugar: 'Laboratorio de Física', descripcion: '', estado: 'programada', anterior: null, recordatorioMinutos: 30 },
    ],
    avisos: [
      { id: 'a1', grupoId: calculo, autorId: 'carlos-rios', titulo: 'Cambio de aula para el repaso final', contenido: 'El repaso del domingo será en la Biblioteca UPC, sala 3 (2.º piso). Lleven su guía de derivadas impresa.', prioridad: 'importante', fijado: true, fechaEnvio: hace(25), editado: false },
      { id: 'a2', grupoId: calculo, autorId: 'carlos-rios', titulo: 'Nueva fecha para la sesión de derivadas', contenido: 'La sesión de derivadas se movió a las 6:00 p. m. por cruce con exámenes parciales.', prioridad: 'normal', fijado: false, fechaEnvio: enDias(ahora, -6, 18, 10), editado: true },
      { id: 'a3', grupoId: calculo, autorId: 'carlos-rios', titulo: 'Bienvenida al grupo', contenido: 'Recuerden revisar los materiales del tema «Límites y continuidad» antes de cada sesión.', prioridad: 'normal', fijado: false, fechaEnvio: enDias(ahora, -13, 9), editado: false },
    ],
    solicitudes: [
      { id: 's1', grupoId: calculo, estudianteId: 'jorge-lazo', nombre: 'Jorge Lazo', carrera: 'Ing. de Sistemas', ciclo: '3.er ciclo', estado: 'pendiente', fechaSolicitud: hace(10), fechaRespuesta: null, mensaje: 'Hola, quiero reforzar límites para el parcial. Puedo los martes y jueves en la noche.' },
      { id: 's2', grupoId: calculo, estudianteId: 'ana-torres', nombre: 'Ana Torres', carrera: 'Ing. Industrial', ciclo: '2.º ciclo', estado: 'aceptada', fechaSolicitud: hace(180), fechaRespuesta: hace(90), mensaje: 'Me interesa practicar ejercicios de derivadas con el grupo.' },
      { id: 's4', grupoId: 'algebra-lineal', estudianteId: 'rosa-mendoza', nombre: 'Rosa Mendoza', carrera: 'Ing. de Sistemas', ciclo: '3.er ciclo', estado: 'pendiente', fechaSolicitud: hace(45), fechaRespuesta: null, mensaje: 'Me cuesta resolver sistemas de ecuaciones y quisiera practicar en grupo.' },
      { id: 's3', grupoId: calculo, estudianteId: 'pedro-castro', nombre: 'Pedro Castro', carrera: 'Ing. Civil', ciclo: '5.º ciclo', estado: 'rechazada', fechaSolicitud: enDias(ahora, -1, 16), fechaRespuesta: enDias(ahora, -1, 18), mensaje: 'Quisiera unirme solo para las sesiones de los sábados.' },
    ],
    notificaciones: [
      { id: 'n1', tipo: 'cambio_sesion', sesionId: 'normalizacion', texto: textoCambioSesion('Base de Datos UPC', normalizacion.inicio, ahora), fecha: hace(20), leida: false },
      { id: 'n2', tipo: 'recordatorio', sesionId: 'dinamica', texto: 'Recordatorio programado: Física en equipo', fecha: hace(120), leida: false },
    ],
  };
}
