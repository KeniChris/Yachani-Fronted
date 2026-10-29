import { DatosGrupo, DiaSemana } from '../../grupos.models';
import { formatearHorario } from '../../grupos.formato';
import { ICONOS_GRUPO, METODOS_ESTUDIO } from '../../grupos.opciones';

export type TamanoGrupo = 'pequeno' | 'mediano' | 'grande';
export interface FranjaDisponible { dia: DiaSemana; inicio: string; fin: string; }
export interface SolicitudPropuesta {
  curso: string; objetivo: string; metodo: string; modalidad: string; tamano: TamanoGrupo; franjas: FranjaDisponible[];
}
export interface PropuestaGrupo { datos: DatosGrupo; temas: string[]; motivos: string[]; }

export const TAMANOS: { valor: TamanoGrupo; etiqueta: string; detalle: string; capacidad: number }[] = [
  { valor: 'pequeno', etiqueta: '2–3', detalle: 'Grupo pequeño', capacidad: 3 },
  { valor: 'mediano', etiqueta: '4–6', detalle: 'Para compartir ideas', capacidad: 6 },
  { valor: 'grande', etiqueta: '7 o más', detalle: 'Más perspectivas', capacidad: 10 },
];

const PALABRAS_ICONO: [RegExp, string][] = [
  [/c[aá]lculo|deriva|integral|l[ií]mite|matem|[aá]lgebra|estad/i, 'functions'],
  [/sql|base de datos|datos/i, 'database'],
  [/program|software|c[oó]digo|algoritmo|web|uml/i, 'code'],
  [/f[ií]sica|qu[ií]mica|biolog/i, 'science'],
  [/ingl[eé]s|idioma|franc[eé]s/i, 'translate'],
];

const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

// Simulación local de la propuesta para revisar el flujo.
// Pendiente: reemplazar por la llamada al servicio de IA del backend con la misma entrada y salida.
export function generarPropuesta(solicitud: SolicitudPropuesta, variante = 0): PropuestaGrupo {
  const objetivo = solicitud.objetivo.trim().replace(/\.$/, '');
  const partes = objetivo.split(/,|;| y /i).map(parte => capitalizar(parte.trim())).filter(Boolean);
  const principal = partes[0] ?? capitalizar(objetivo);
  const nombres = [`${solicitud.curso}: ${principal.toLowerCase()} en equipo`, `Dominando ${principal.toLowerCase()}`, `${principal} paso a paso`];
  const metodo = solicitud.metodo || METODOS_ESTUDIO[variante % METODOS_ESTUDIO.length];
  const temas = [...partes.map(parte => `${parte}: conceptos clave`), `Ejercicios guiados de ${principal.toLowerCase()}`, 'Repaso y simulacro antes de la evaluación'].slice(0, 5);
  const franja = solicitud.franjas[0];
  const dias = [...new Set(solicitud.franjas.filter(item => item.inicio === franja.inicio && item.fin === franja.fin).map(item => item.dia))];
  const icono = PALABRAS_ICONO.find(([patron]) => patron.test(`${solicitud.curso} ${objetivo}`))?.[1] ?? ICONOS_GRUPO[ICONOS_GRUPO.length - 1].valor;
  const capacidad = TAMANOS.find(item => item.valor === solicitud.tamano)?.capacidad ?? 6;
  const horario = { dias, inicio: franja.inicio, fin: franja.fin };
  return {
    datos: {
      nombre: nombres[variante % nombres.length], curso: solicitud.curso, tema: principal, icono, metodo, modalidad: solicitud.modalidad, capacidadMaxima: capacidad, horario,
      descripcion: `Un espacio para practicar ${objetivo.toLowerCase()} con sesiones de ${metodo.toLowerCase()} y materiales organizados por tema.`,
    },
    temas,
    motivos: [
      `Organiza «${objetivo}» en ${temas.length} temas progresivos.`,
      `Usa tu disponibilidad: ${formatearHorario(horario)}.`,
      `Un grupo de hasta ${capacidad} integrantes permite que todos participen.`,
    ],
  };
}
