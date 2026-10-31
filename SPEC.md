# Yachani — SPEC de interfaces

Documento común para construir las pantallas de Yachani con Codex o Claude Code.

## Datos

- Proyecto: Angular standalone, TypeScript, HTML, CSS y Angular Material. Conservar las versiones instaladas.
- Repositorio: [Yachani-Fronted · develop](https://github.com/KeniChris/Yachani-Fronted/tree/develop).
- Figma: [Yachani](https://www.figma.com/design/3Dl2ksR7TPkmonQWVzl3H2/Yachani).
- Guía visual: frame **Yachani-guia-estilos-detallado · 1440×1024px**, ubicado en la [página de la guía](https://www.figma.com/design/3Dl2ksR7TPkmonQWVzl3H2/Yachani?node-id=0-1).
- Pantallas y flujos: hoja [Diagrama de flujo keni](https://www.figma.com/design/3Dl2ksR7TPkmonQWVzl3H2/Yachani?node-id=6-321):
  - 01–05: temas, materiales, mazos, tarjetas, compartir, repaso y progreso.
  - 07–14: inicio, perfiles, resúmenes, reseñas, descubrimiento/IA, grupos, chat, sesiones y notificaciones/avisos.
  - 15: inicio de sesión.
  - 16: registro.
  - 17: recuperación de contraseña.
  - 18: configuración inicial de estudiante y tutor.
- Componentes compartidos: secciones **00 · Recursos · Componentes** y **06 · App compartidos · Componentes**, en esa misma hoja. Utilizar las variantes de estudiante/tutor y escritorio/móvil correspondientes.
- Landing: [Web](https://www.figma.com/design/3Dl2ksR7TPkmonQWVzl3H2/Yachani?node-id=1-30827) y [Móvil](https://www.figma.com/design/3Dl2ksR7TPkmonQWVzl3H2/Yachani?node-id=1-31312).
- Referencias técnicas: [Angular Material](https://material.angular.dev/components/categories), [Reactive Forms](https://angular.dev/guide/forms/reactive-forms) y [Control flow](https://angular.dev/guide/templates/control-flow).

## Estructura

```text
src/
├── app/
│   ├── app.ts · app.html · app.css
│   ├── app.config.ts
│   ├── app.routes.ts
│   │
│   ├── home/
│   │   └── home.ts · home.html · home.css
│   │
│   ├── layout/
│   │   ├── auth-layout/
│   │   ├── configuracion-layout/
│   │   ├── app-layout/
│   │   └── grupo-layout/
│   │
│   └── pages/
│       ├── auth/
│       │   └── auth.routes.ts
│       │
│       ├── configuracion-inicial/
│       │   ├── configuracion-inicial.routes.ts
│       │   ├── configuracion-estudiante/
│       │   └── configuracion-tutor/
│       │
│       ├── inicio/
│       │   ├── inicio.routes.ts
│       │   ├── inicio-estudiante/
│       │   └── inicio-tutor/
│       │
│       ├── perfiles/
│       │   ├── perfiles.routes.ts
│       │   ├── estudiante/
│       │   └── tutor/
│       │
│       ├── grupos/
│       │   ├── grupos.routes.ts
│       │   ├── descubrimiento/
│       │   ├── gestion/
│       │   ├── solicitudes/
│       │   ├── integrantes/
│       │   ├── chat/
│       │   └── sesiones/
│       │
│       ├── recursos/
│       │   ├── recursos.routes.ts
│       │   ├── temas/
│       │   └── materiales/
│       │
│       ├── flashcards/
│       │   ├── flashcards.routes.ts
│       │   ├── flashcards-grupo.routes.ts
│       │   ├── mis-mazos/
│       │   ├── mazos-grupo/
│       │   ├── tarjetas/
│       │   ├── compartir-mazo/
│       │   └── repaso/
│       │
│       └── notificaciones/
│           └── notificaciones.routes.ts
│
├── styles.css
└── material-theme.scss
```

Cada área principal de `pages/` contiene su archivo `*.routes.ts` y las carpetas de sus pantallas. `app.routes.ts` enlaza la landing y carga las áreas con `loadChildren`. Los recursos estáticos van en `public/`.

- `home/`: landing en `/`, con cabecera y pie propios, sin layout ni rutas hijas.
- `auth/`: inicio de sesión, registro y recuperación de contraseña, según las secciones 15–17 de Figma.
- `configuracion-inicial/`: configuración del estudiante y del tutor en `configuracion-estudiante/` y `configuracion-tutor/`, según la sección 18.
- `inicio/`: vistas diferenciadas en `inicio-estudiante/` e `inicio-tutor/`.
- `perfiles/`: pantallas organizadas en `estudiante/` y `tutor/`. Incluye perfil propio y ajeno, edición, cursos, preferencias, resúmenes del estudiante y reseñas del tutor.
- `grupos/`: organiza sus pantallas en `descubrimiento/`, `gestion/`, `solicitudes/`, `integrantes/`, `chat/` y `sesiones/`. Los avisos pertenecen al contexto del grupo. Las recomendaciones con IA corresponden al estudiante; la creación de grupos con IA, al tutor.
- `recursos/`: pantallas organizadas en `temas/` y `materiales/`.
- `flashcards/`: mazos personales y compartidos, tarjetas, publicación en grupos, repaso y progreso. `flashcards.routes.ts` define el recorrido personal y `flashcards-grupo.routes.ts`, el recorrido dentro de un grupo.
- `notificaciones/`: bandeja de notificaciones y recordatorios.

Los layouts se encuentran en `layout/`:

- `auth-layout/`: estructura común de las pantallas de acceso.
- `configuracion-layout/`: estructura común de la configuración inicial.
- `app-layout/`: sidebar, topbar, navegación móvil y `router-outlet` de la aplicación, con las variantes necesarias por rol.
- `grupo-layout/`: cabecera, nombre y pestañas del grupo, junto con un `router-outlet` para mostrar Chat, Recursos, Flashcards, Sesiones y las demás secciones. La cabecera no se repite dentro de cada página.

Separar pantallas por rol cuando cambien su contenido o formulario. Si únicamente cambian las acciones disponibles, reutilizar la misma pantalla con su variante de permisos.

`styles.css` contiene los estilos y variables globales; `material-theme.scss`, el tema de Angular Material.

Los servicios, modelos, utilidades y `src/environments/` se incorporarán cuando la integración los requiera.

## Alcance

Construir las interfaces asignadas y su navegación. Figma define contenido, campos, opciones y valores de ejemplo; no consultar el backend para esta tarea.

- **Permitido:** configuración del componente, imports, listas con datos fijos, formularios con validaciones simples y navegación con `routerLink`. La clase TypeScript puede estar vacía cuando no necesite propiedades ni formularios.
- **Fuera de alcance:** funciones propias para ejecutar acciones, cálculos, búsquedas, filtros, servicios, modelos/interfaces, HTTP, autenticación, persistencia y simulaciones de IA o backend. No añadir `signal`, `computed`, `inject()` ni el servicio `Router` en las páginas generadas.
- Buscadores, contadores y progreso muestran los valores del diseño. Se permite el comportamiento nativo de los controles Material, como abrir un menú, seleccionar una opción o marcar un checkbox.

## Reglas

- **Componentes:** standalone; un `.ts`, `.html` y `.css` por pantalla, con nombres en minúsculas y guiones. No generar `*.spec.ts` ni nuevos archivos Markdown.
- **Control flow:** usar `@if`, `@for` siempre con `track` y `@switch`. No usar `*ngIf`, `*ngFor` ni `ngSwitch`.
- **UI:** utilizar Angular Material. No crear componentes auxiliares ni carpetas `components/` para cada sección de una página; reutilizar los elementos compartidos de la base.
- **Controles:** fechas con `mat-datepicker` y listas largas con `mat-paginator`, configurados donde se utilizan.
- **Formularios:** Reactive Forms con `FormGroup`, `[formGroup]` y `formControlName`. Toda entrada del usuario pertenece al grupo. No usar `ngModel` ni Signal Forms.
- **Validaciones:** simples y según Figma, como `required`, `email`, `minLength` y los límites indicados. Cada campo validado lleva su `mat-error`, visible cuando se haya tocado y sea inválido. El botón de continuar lleva `[disabled]="form.invalid"`.
- **Cobertura y navegación:** construir todas las pantallas asignadas y conectarlas mediante `routerLink` y las rutas acordadas. Los botones de continuar permiten recorrer las vistas con datos de ejemplo. Las operaciones reales y la conexión con el backend se implementarán después.
- **Estados:** las variantes de una pantalla son estados del mismo componente, no rutas ni componentes adicionales. Por ahora implementar los errores de formulario; los demás estados de Figma quedan como referencia.
- **Estilos:** seguir la guía visual, centralizar las variables en `styles.css` y el tema Material en `material-theme.scss`. Usar Roboto y Material Symbols Rounded.
- **Responsive:** una misma página se adapta a escritorio y móvil, con etiquetas, foco visible y sin desbordes horizontales.
- **Recursos gráficos:** utilizar los logos, imágenes e iconos aprobados en Figma y guardar los archivos necesarios en `public/`, evitando enlaces temporales. Reconstruir las pantallas con HTML y Material; no utilizar capturas completas del frame como interfaz.
- **Roles y permisos:** representar las variantes previstas en Figma mediante datos de ejemplo y acciones visibles según el contexto. Reutilizar las pantallas comunes. En esta fase no implementar autenticación ni comprobaciones reales de permisos. Siempre debes decirme que files agregaste o modificaste.
- **Librerías:** instalar con npm únicamente las necesarias que falten, en versiones compatibles. Si se solicita un gráfico, dejar el bloque «Aquí irá un gráfico», sin programarlo.
- **Diseño incompleto:** si falta una referencia o hay una ambigüedad, consultar. No inventar pantallas, campos ni contenido.
- **Fidelidad de los elementos compartidos:** reproducir los componentes aprobados de las secciones 00 y 06 de Figma, con sus variantes por rol y dispositivo. Respetar dimensiones, tipografía, iconos, espaciados, textos y estados. Incluir todos sus elementos, como ayuda y datos del usuario; no sustituirlos por versiones simplificadas.

## Forma de trabajo

1. **Base común:** cuando se solicite, preparar estructura, rutas, layouts, tema y componentes compartidos previstos una sola vez en `develop`, sin generar las pantallas de cada funcionalidad.
2. **Pantallas:** trabajar en una rama `feature/...` creada desde la base de `develop`. Revisar los cambios locales y localizar el frame mediante el MCP de Figma. Si el nombre se repite, usar el enlace con nodo; si falta acceso, informar.
3. Implementar únicamente la pantalla solicitada, registrar su ruta en el archivo de rutas de su área y conservar los cambios ajenos. Reutilizar los componentes compartidos. Consultar antes de modificar la estructura común, las rutas generales, los layouts o el tema. Modificar Figma solo si se solicita expresamente.
4. Ejecutar `npm run build` y revisar con `npm start`. Comparar con Figma en escritorio y móvil, comprobar la navegación y los errores de formulario. Informar las comprobaciones que no se hayan podido realizar.
5. Entregar en el chat la ruta para abrir la pantalla, los archivos creados/modificados y los pendientes. Los PR se dirigen a `develop`. No hacer commit, push o merge sin que se solicite.

