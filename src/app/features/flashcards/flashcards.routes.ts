import { Routes } from '@angular/router';
export const FLASHCARDS_ROUTES: Routes = [
  {
    path: '',
    title: 'Flashcards | Yachani',
    loadComponent: () => import('./pages/mis-mazos/mis-mazos').then((m) => m.MisMazos),
  },
  {
    path: 'crear',
    title: 'Flashcards | Yachani',
    loadComponent: () =>
      import('./pages/mazo-formulario/mazo-formulario').then((m) => m.MazoFormulario),
  },
  {
    path: ':idMazo/editar',
    title: 'Flashcards | Yachani',
    data: { editando: true },
    loadComponent: () =>
      import('./pages/mazo-formulario/mazo-formulario').then((m) => m.MazoFormulario),
  },
  {
    path: ':idMazo/tarjetas/agregar',
    title: 'Flashcards | Yachani',
    loadComponent: () =>
      import('./pages/tarjeta-formulario/tarjeta-formulario').then((m) => m.TarjetaFormulario),
  },
  {
    path: ':idMazo/tarjetas/:idTarjeta/editar',
    title: 'Flashcards | Yachani',
    data: { editando: true },
    loadComponent: () =>
      import('./pages/tarjeta-formulario/tarjeta-formulario').then((m) => m.TarjetaFormulario),
  },
  {
    path: ':idMazo/tarjetas/:idTarjeta/eliminar',
    title: 'Flashcards | Yachani',
    loadComponent: () =>
      import('./pages/tarjeta-eliminar/tarjeta-eliminar').then((m) => m.TarjetaEliminar),
  },
  {
    path: ':idMazo/retirar-publicacion',
    title: 'Flashcards | Yachani',
    data: { publicacion: true },
    loadComponent: () => import('./pages/retirar-mazo/retirar-mazo').then((m) => m.RetirarMazo),
  },
  {
    path: ':idMazo',
    title: 'Flashcards | Yachani',
    loadComponent: () => import('./pages/mazo-detalle/mazo-detalle').then((m) => m.MazoDetalle),
  },
];
