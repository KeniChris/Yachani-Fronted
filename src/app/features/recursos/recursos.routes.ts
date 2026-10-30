import { Routes } from '@angular/router';

// Se montan como pestaña "Temas y materiales" del espacio del grupo (grupos.routes.ts):
// /app/:rol/grupos/:grupoId/temas/... y /app/:rol/grupos/:grupoId/materiales/...
const recursosGrupo = () =>
  import('./pages/recursos-grupo/recursos-grupo').then((m) => m.RecursosGrupo);

export const TEMAS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: recursosGrupo,
    children: [
      {
        path: '',
        title: 'Temas y materiales | Yachani',
        loadComponent: () => import('./pages/temas/temas').then((m) => m.Temas),
      },
      {
        path: 'crear',
        title: 'Temas y materiales | Yachani',
        loadComponent: () =>
          import('./pages/tema-formulario/tema-formulario').then((m) => m.TemaFormulario),
      },
      {
        path: ':idTema/editar',
        title: 'Temas y materiales | Yachani',
        loadComponent: () =>
          import('./pages/tema-formulario/tema-formulario').then((m) => m.TemaFormulario),
      },
      {
        path: ':idTema/materiales',
        title: 'Temas y materiales | Yachani',
        loadComponent: () => import('./pages/materiales/materiales').then((m) => m.Materiales),
      },
    ],
  },
];

export const MATERIALES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: recursosGrupo,
    children: [
      {
        path: '',
        title: 'Temas y materiales | Yachani',
        loadComponent: () => import('./pages/materiales/materiales').then((m) => m.Materiales),
      },
      {
        path: 'subir',
        title: 'Temas y materiales | Yachani',
        loadComponent: () =>
          import('./pages/subir-materiales/subir-materiales').then((m) => m.SubirMateriales),
      },
      {
        path: ':idMaterial/eliminar',
        title: 'Temas y materiales | Yachani',
        loadComponent: () =>
          import('./pages/eliminar-material/eliminar-material').then((m) => m.EliminarMaterial),
      },
      {
        path: ':idMaterial/cambiar-tema',
        title: 'Temas y materiales | Yachani',
        loadComponent: () => import('./pages/cambiar-tema/cambiar-tema').then((m) => m.CambiarTema),
      },
      {
        path: ':idMaterial',
        title: 'Temas y materiales | Yachani',
        loadComponent: () =>
          import('./pages/material-detalle/material-detalle').then((m) => m.MaterialDetalle),
      },
    ],
  },
];
