import { Routes } from '@angular/router';
export const RECURSOS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/recursos-grupo/recursos-grupo').then((m) => m.RecursosGrupo),
    children: [
      {
        path: 'temas',
        title: 'Temas y materiales | Yachani',
        loadComponent: () => import('./pages/temas/temas').then((m) => m.Temas),
      },
      {
        path: 'temas/crear',
        title: 'Temas y materiales | Yachani',
        loadComponent: () =>
          import('./pages/tema-formulario/tema-formulario').then((m) => m.TemaFormulario),
      },
      {
        path: 'materiales',
        title: 'Temas y materiales | Yachani',
        loadComponent: () => import('./pages/materiales/materiales').then((m) => m.Materiales),
      },
      {
        path: 'materiales/subir',
        title: 'Temas y materiales | Yachani',
        loadComponent: () =>
          import('./pages/subir-materiales/subir-materiales').then((m) => m.SubirMateriales),
      },
      {
        path: 'materiales/:idMaterial/eliminar',
        title: 'Temas y materiales | Yachani',
        loadComponent: () =>
          import('./pages/eliminar-material/eliminar-material').then((m) => m.EliminarMaterial),
      },
      {
        path: 'temas/:idTema/editar',
        title: 'Temas y materiales | Yachani',
        loadComponent: () =>
          import('./pages/tema-formulario/tema-formulario').then((m) => m.TemaFormulario),
      },
      {
        path: 'temas/:idTema/materiales',
        title: 'Temas y materiales | Yachani',
        loadComponent: () => import('./pages/materiales/materiales').then((m) => m.Materiales),
      },
      {
        path: 'materiales/:idMaterial',
        title: 'Temas y materiales | Yachani',
        loadComponent: () =>
          import('./pages/material-detalle/material-detalle').then((m) => m.MaterialDetalle),
      },
      {
        path: 'materiales/:idMaterial/cambiar-tema',
        title: 'Temas y materiales | Yachani',
        loadComponent: () => import('./pages/cambiar-tema/cambiar-tema').then((m) => m.CambiarTema),
      },
    ],
  },
];
