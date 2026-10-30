import { Routes } from '@angular/router';
import { rutaGrupoActual } from '../grupos/ruta-grupo-actual';

// Flashcards del grupo dentro de su espacio: /app/:rol/grupos/:grupoId/flashcards.
export const rutaFlashcardsGrupo = (): string => rutaGrupoActual('flashcards');

export const FLASHCARDS_GRUPO_ROUTES: Routes = [
  {
    path: '',
    title: 'Flashcards | Yachani',
    loadComponent: () => import('./pages/mazos-grupo/mazos-grupo').then((m) => m.MazosGrupo),
  },
  {
    path: 'elegir',
    title: 'Flashcards | Yachani',
    loadComponent: () => import('./pages/elegir-mazo/elegir-mazo').then((m) => m.ElegirMazo),
  },
  {
    path: 'compartir/:idMazo',
    title: 'Flashcards | Yachani',
    loadComponent: () =>
      import('./pages/compartir-mazo/compartir-mazo').then((m) => m.CompartirMazo),
  },
  {
    path: ':idMazo/retirar',
    title: 'Flashcards | Yachani',
    loadComponent: () => import('./pages/retirar-mazo/retirar-mazo').then((m) => m.RetirarMazo),
  },
];
export const REPASO_ROUTES: Routes = [
  {
    path: '',
    title: 'Flashcards | Yachani',
    loadComponent: () => import('./pages/repaso-inicio/repaso-inicio').then((m) => m.RepasoInicio),
  },
  {
    path: 'repaso/pregunta',
    title: 'Flashcards | Yachani',
    loadComponent: () =>
      import('./pages/repaso-tarjeta/repaso-tarjeta').then((m) => m.RepasoTarjeta),
  },
  {
    path: 'repaso/respuesta',
    title: 'Flashcards | Yachani',
    data: { respuesta: true },
    loadComponent: () =>
      import('./pages/repaso-tarjeta/repaso-tarjeta').then((m) => m.RepasoTarjeta),
  },
  {
    path: 'repaso/pausa',
    title: 'Flashcards | Yachani',
    loadComponent: () => import('./pages/repaso-pausa/repaso-pausa').then((m) => m.RepasoPausa),
  },
  {
    path: 'repaso/resultado',
    title: 'Flashcards | Yachani',
    loadComponent: () =>
      import('./pages/repaso-resultado/repaso-resultado').then((m) => m.RepasoResultado),
  },
];
