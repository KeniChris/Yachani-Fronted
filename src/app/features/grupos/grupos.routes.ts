import { Routes } from '@angular/router';
import { RolGrupo } from './grupos.models';

// rolVista solo indica la variante visual. El backend deberá autorizar el rol real en el grupo.
// Cada hija repite rolVista porque AppLayout lee los datos de la ruta más profunda.
function pestanasGrupo(rol: RolGrupo): Routes {
  const data = { rolVista: rol };
  const pestanas: Routes = [
    { path: '', pathMatch: 'full', redirectTo: 'chat' },
    { path: 'chat', title: 'Chat del grupo | Yachani', data, loadComponent: () => import('./pages/grupo-chat/grupo-chat').then(m => m.GrupoChat) },
    // Temas y materiales (módulo de recursos): la pestaña 'temas' también queda activa en 'materiales'.
    { path: 'temas', data, loadChildren: () => import('../recursos/recursos.routes').then(m => m.TEMAS_ROUTES) },
    { path: 'materiales', data, loadChildren: () => import('../recursos/recursos.routes').then(m => m.MATERIALES_ROUTES) },
    { path: 'sesiones', title: 'Sesiones del grupo | Yachani', data, loadComponent: () => import('./pages/grupo-sesiones/grupo-sesiones').then(m => m.GrupoSesiones) },
    { path: 'avisos', title: 'Avisos del grupo | Yachani', data, loadComponent: () => import('./pages/grupo-avisos/grupo-avisos').then(m => m.GrupoAvisos) },
    { path: 'flashcards', data, loadChildren: () => import('../flashcards/flashcards-grupo.routes').then(m => m.FLASHCARDS_GRUPO_ROUTES) },
    { path: 'integrantes', title: 'Integrantes del grupo | Yachani', data, loadComponent: () => import('./pages/grupo-integrantes/grupo-integrantes').then(m => m.GrupoIntegrantes) },
  ];
  if (rol === 'tutor') {
    pestanas.push({ path: 'solicitudes', title: 'Solicitudes de ingreso | Yachani', data, loadComponent: () => import('./pages/grupo-solicitudes/grupo-solicitudes').then(m => m.GrupoSolicitudes) });
  }
  return pestanas;
}

// Pantallas exclusivas del tutor. Van antes del espacio del grupo para que 'editar' no se lea como pestaña.
const rutasTutor: Routes = [
  { path: 'tutor/crear-grupo', title: 'Crear grupo | Yachani', data: { rolVista: 'tutor', modo: 'crear' }, loadComponent: () => import('./pages/formulario-grupo/formulario-grupo').then(m => m.FormularioGrupo) },
  { path: 'tutor/crear-grupo-ia', title: 'Crear grupo con IA | Yachani', data: { rolVista: 'tutor' }, loadComponent: () => import('./pages/crear-grupo-ia/crear-grupo-ia').then(m => m.CrearGrupoIa) },
  { path: 'tutor/grupos/:grupoId/editar', title: 'Editar grupo | Yachani', data: { rolVista: 'tutor', modo: 'editar' }, loadComponent: () => import('./pages/formulario-grupo/formulario-grupo').then(m => m.FormularioGrupo) },
  { path: 'tutor/solicitudes', title: 'Solicitudes de ingreso | Yachani', data: { rolVista: 'tutor' }, loadComponent: () => import('./pages/solicitudes-tutor/solicitudes-tutor').then(m => m.SolicitudesTutor) },
];

export const rutasGrupos: Routes = [...rutasTutor, ...(['estudiante', 'tutor'] as const).flatMap((rol): Routes => [
  {
    path: `${rol}/grupos`,
    title: 'Mis grupos | Yachani',
    data: { rolVista: rol },
    loadComponent: () => import('./pages/mis-grupos/mis-grupos').then(m => m.MisGrupos),
  },
  {
    path: `${rol}/grupos/:grupoId`,
    data: { rolVista: rol },
    loadComponent: () => import('./pages/espacio-grupo/espacio-grupo').then(m => m.EspacioGrupo),
    children: pestanasGrupo(rol),
  },
  // El repaso usa todo el ancho, sin el encabezado del grupo. Va después del espacio del grupo
  // para que 'flashcards/elegir' no se lea como un mazo.
  {
    path: `${rol}/grupos/:grupoId/flashcards/:idMazo`,
    data: { rolVista: rol },
    loadChildren: () => import('../flashcards/flashcards-grupo.routes').then(m => m.REPASO_ROUTES),
  },
  {
    path: `${rol}/notificaciones`,
    title: 'Notificaciones | Yachani',
    data: { rolVista: rol },
    loadComponent: () => import('../notificaciones/pages/notificaciones/notificaciones').then(m => m.Notificaciones),
  },
])];
