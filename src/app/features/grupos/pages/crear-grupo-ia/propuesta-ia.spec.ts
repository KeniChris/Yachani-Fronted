import { generarPropuesta } from './propuesta-ia';

describe('generarPropuesta', () => {
  const solicitud = { curso: 'Cálculo I', objetivo: 'Límites, derivadas y integrales', metodo: '', modalidad: 'Virtual', tamano: 'mediano' as const,
    franjas: [{ dia: 'lunes' as const, inicio: '18:00', fin: '20:00' }, { dia: 'miercoles' as const, inicio: '18:00', fin: '20:00' }] };

  it('arma temas, capacidad y horario a partir de la solicitud', () => {
    const propuesta = generarPropuesta(solicitud);
    expect(propuesta.temas.length).toBeGreaterThanOrEqual(3);
    expect(propuesta.datos.capacidadMaxima).toBe(6);
    expect(propuesta.datos.horario).toEqual({ dias: ['lunes', 'miercoles'], inicio: '18:00', fin: '20:00' });
    expect(propuesta.datos.icono).toBe('functions');
  });

  it('cambia el nombre en otra variante', () => {
    expect(generarPropuesta(solicitud, 1).datos.nombre).not.toBe(generarPropuesta(solicitud, 0).datos.nombre);
  });
});
