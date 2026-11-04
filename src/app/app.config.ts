import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // El proyecto no tiene zone.js: sin este provider, el estado que cambia tras una
    // respuesta HTTP (fuera de un evento del DOM) nunca se vuelve a pintar.
    provideZonelessChangeDetection(),
    provideHttpClient(),
    // paramsInheritanceStrategy: 'always' hace que las pantallas dentro de un grupo
    // (chat, sesiones, integrantes…) reciban el :grupoId de su ruta padre como @Input().
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
    ),
  ],
};
