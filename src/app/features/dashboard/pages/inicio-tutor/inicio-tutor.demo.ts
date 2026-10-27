import { crearInicioTutorVacio, DatosInicioTutor } from './inicio-tutor.models';

// Información exclusivamente visual: no representa usuarios ni actividad reales.
export const USUARIO_TUTOR_DEMOSTRACION = { nombre: 'Tutor de demostración' };
export function crearDatosTutorDemostracion(): DatosInicioTutor {
  const datos = crearInicioTutorVacio();
  const valores = { grupos: 3, estudiantes: 15, solicitudes: 4, calificacion: 4.8 };
  datos.estadisticas = datos.estadisticas.map(item => ({ ...item, estado: 'listo', valor: valores[item.clave] }));
  datos.sesiones = { estado: 'listo', datos: [
    { id: 'limites', titulo: 'Límites y continuidad', grupo: 'Dominando Cálculo', mes: 'OCT', dia: '21', horario: 'Hoy, 7:00 p. m.', modalidad: 'Virtual' },
    { id: 'sql', titulo: 'Consultas SQL y subconsultas', grupo: 'Base de Datos UPC', mes: 'OCT', dia: '23', horario: '6:30 p. m.', modalidad: 'Presencial' },
    { id: 'dinamica', titulo: 'Repaso de dinámica', grupo: 'Física en equipo', mes: 'OCT', dia: '25', horario: '5:00 p. m.', modalidad: 'Virtual' },
  ] };
  datos.solicitudes = { estado: 'listo', datos: [
    { id: 'solicitud-1', nombre: 'Lucía Castro', grupo: 'Dominando Cálculo' },
    { id: 'solicitud-2', nombre: 'Mateo Rojas', grupo: 'Base de Datos UPC' },
    { id: 'solicitud-3', nombre: 'Sofía Pérez', grupo: 'Dominando Cálculo' },
  ] };
  datos.grupos = { estado: 'listo', datos: [
    { id: 'calculo', titulo: 'Dominando Cálculo', tema: 'Límites y derivadas', icono: 'calculate', miembros: ['AL', 'JM', 'CP'], estudiantes: 5, cupo: 6, activo: true },
    { id: 'datos', titulo: 'Base de Datos UPC', tema: 'SQL y modelado', icono: 'database', miembros: ['LR', 'MS', 'DR'], estudiantes: 4, cupo: 6, activo: true },
    { id: 'fisica', titulo: 'Física en equipo', tema: 'Dinámica y energía', icono: 'science', miembros: ['AV', 'FM', 'RG'], estudiantes: 6, cupo: 6, activo: true },
  ] };
  return datos;
}
