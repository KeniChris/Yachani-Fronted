import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppLayout } from '../../layouts/app-layout/app-layout';
import { RolGrupo } from './grupos.models';
import { rutaGrupo } from './grupos.formato';

// Los datos de ejemplo de Temas, Materiales y Flashcards pertenecen a Dominando Cálculo;
// se usa al abrir esas pantallas fuera de un grupo (p. ej. desde la biblioteca de mazos).
const GRUPO_DEMOSTRACION = 'dominando-calculo';

// Ruta del grupo abierto (/app/:rol/grupos/:grupoId[/pestana]) para las pantallas de otros
// módulos que se muestran dentro del espacio del grupo. Llamar en un inicializador de campo.
export function rutaGrupoActual(pestana?: string): string {
  const rutas = [...inject(ActivatedRoute).snapshot.pathFromRoot].reverse();
  const grupoId = rutas.map(ruta => ruta.paramMap.get('grupoId')).find(Boolean) ?? GRUPO_DEMOSTRACION;
  const rolRuta = rutas.map(ruta => ruta.data['rolVista']).find(Boolean);
  const rol: RolGrupo = rolRuta === 'tutor' || rolRuta === 'estudiante'
    ? rolRuta
    : inject(AppLayout, { optional: true })?.role ?? 'estudiante';
  return rutaGrupo(rol, grupoId, pestana);
}
