import { TestBed } from '@angular/core/testing';
import { GruposStore } from './grupos.store';

describe('GruposStore', () => {
  let store: GruposStore;
  const grupoId = 'dominando-calculo';

  beforeEach(() => {
    store = TestBed.inject(GruposStore);
  });

  it('no permite un límite menor que los integrantes actuales', () => {
    const total = store.integrantesDe(grupoId).length;
    expect(store.actualizarCapacidad(grupoId, total - 1)).toContain(`(${total})`);
    expect(store.actualizarCapacidad(grupoId, total + 2)).toBeNull();
    expect(store.grupo(grupoId)?.capacidadMaxima).toBe(total + 2);
  });

  it('al aceptar una solicitud agrega al integrante y no acepta si el grupo está lleno', () => {
    const total = store.integrantesDe(grupoId).length;
    store.actualizarCapacidad(grupoId, total);
    expect(store.responderSolicitud('s1', 'aceptada')).toContain('completo');
    store.actualizarCapacidad(grupoId, total + 1);
    expect(store.responderSolicitud('s1', 'aceptada')).toBeNull();
    expect(store.integrantesDe(grupoId).length).toBe(total + 1);
    expect(store.responderSolicitud('s1', 'rechazada')).toContain('respondida');
  });

  it('editar una sesión conserva el horario anterior y notifica el cambio', () => {
    const sesion = store.sesion('repaso')!;
    const inicio = new Date(sesion.inicio.getTime() + 3_600_000);
    store.editarSesion('repaso', { ...sesion, inicio, fin: new Date(sesion.fin.getTime() + 3_600_000) });
    expect(store.sesion('repaso')?.estado).toBe('modificada');
    expect(store.sesion('repaso')?.anterior?.inicio).toEqual(sesion.inicio);
    expect(store.notificaciones()[0].tipo).toBe('cambio_sesion');
  });

  it('una sesión cancelada deja de generar recordatorios', () => {
    store.cancelarSesion('limites');
    expect(store.recordatorios().some(item => item.id === 'limites')).toBe(false);
    expect(store.notificaciones()[0].tipo).toBe('cancelacion');
  });

  it('solo el autor puede eliminar su mensaje dentro de los 2 minutos', () => {
    expect(store.eliminarMensaje('m6', 'lucia-paredes')).toBe(false);
    expect(store.eliminarMensaje('m2', 'anabella-huaman')).toBe(false);
    expect(store.eliminarMensaje('m6', 'anabella-huaman')).toBe(true);
  });

  it('crea un grupo con el tutor como integrante y sus temas iniciales', () => {
    const grupo = store.crearGrupo({ nombre: 'Dominando Cálculo', curso: 'Cálculo I', tema: 'Límites', descripcion: '', icono: 'functions', metodo: 'Práctico', modalidad: 'Virtual', capacidadMaxima: 5, horario: null }, ['Límites laterales']);
    expect(grupo.id).toBe('dominando-calculo-2');
    expect(store.integrantesDe(grupo.id).map(item => item.rol)).toEqual(['tutor']);
    expect(store.temas().some(tema => tema.grupoId === grupo.id && tema.nombre === 'Límites laterales')).toBe(true);
    expect(store.gruposDe('tutor', 'carlos-rios').some(item => item.id === grupo.id)).toBe(true);
  });

  it('al editar no acepta una capacidad menor que los integrantes', () => {
    const grupo = store.grupo(grupoId)!;
    expect(store.editarGrupo(grupoId, { ...grupo, capacidadMaxima: 2 })).toContain('no puede ser menor');
    expect(store.editarGrupo(grupoId, { ...grupo, nombre: 'Cálculo avanzado' })).toBeNull();
    expect(store.grupo(grupoId)?.nombre).toBe('Cálculo avanzado');
  });

  it('el estudiante solo ve los grupos de los que es integrante', () => {
    expect(store.gruposDe('estudiante', 'anabella-huaman').map(grupo => grupo.id)).toEqual(['dominando-calculo', 'base-datos-upc', 'fisica-equipo']);
  });
});
