import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ContextoGrupo } from './contexto-grupo';
import { RolGrupo } from './grupos.models';

// Proveedores para probar una pestaña del grupo fuera de EspacioGrupo.
export function proveedoresPestana(rol: RolGrupo, grupoId = 'dominando-calculo') {
  const params = convertToParamMap({ grupoId });
  return [
    { provide: ActivatedRoute, useValue: { snapshot: { data: { rolVista: rol }, paramMap: params }, paramMap: of(params) } },
    ContextoGrupo,
  ];
}
