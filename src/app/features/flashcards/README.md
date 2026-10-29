# Flashcards · entrega visual

Implementación sobre `feature/temas-materiales`, con Angular 22 y Angular Material existentes. Se conservan Temas y Materiales y el shell del equipo. No se instalaron dependencias ni se modificó Figma o el backend.

## Archivos

- `pages/`: 13 componentes standalone con archivos `.ts`, `.html` y `.css`: `mis-mazos`, `mazo-formulario`, `mazo-detalle`, `tarjeta-formulario`, `tarjeta-eliminar`, `mazos-grupo`, `elegir-mazo`, `compartir-mazo`, `retirar-mazo`, `repaso-inicio`, `repaso-tarjeta`, `repaso-pausa` y `repaso-resultado`.
- `flashcards.css`: composición del bloque con los tokens existentes; cada página reutiliza también `recursos.css`. No hay un segundo tema.
- `flashcards.routes.ts` y `flashcards-grupo.routes.ts`: rutas personales, del grupo y del repaso.
- Conexiones en `app.routes.ts`, `recursos.routes.ts`, cabecera de `recursos-grupo` y enlace Ver mazo de `materiales.html`. El sidebar existente reconoce `/app/flashcards` sin cambios en su código.

## Diseño consultado

Cuenta comprobada previamente mediante `whoami`: `u20231e777@upc.edu.pe`, conexión `link_6ade4e0159988191a71034e4c198a1b6`. Se creó una sesión para esta tarea y se pasó el mismo `sessionId` en todas las consultas.

Se obtuvieron los contextos y capturas de las 17 referencias principales en web y móvil de `FLASHCARDS-ANGULAR.md` (34 frames), más C12 como referencia de la retirada por administrador. Se reutilizaron los fundamentos de la guía detallada `1:497` ya consultados. Archivo: `3Dl2ksR7TPkmonQWVzl3H2`. Todas las operaciones en Figma fueron de lectura.

Los iconos del diseño son Material Symbols Rounded con los mismos nombres de la base; se reutilizan mediante `mat-icon`. No se usan capturas como interfaz ni URLs temporales de assets de Figma.

## Abrir las vistas

Servidor: `npm start -- --host 127.0.0.1`. Se reutilizó el servidor activo en el puerto 4200.

| Vista | URL |
| --- | --- |
| Biblioteca | http://127.0.0.1:4200/app/flashcards |
| Crear mazo | http://127.0.0.1:4200/app/flashcards/crear |
| Detalle personal | http://127.0.0.1:4200/app/flashcards/1 |
| Editar datos | http://127.0.0.1:4200/app/flashcards/1/editar |
| Agregar tarjeta | http://127.0.0.1:4200/app/flashcards/1/tarjetas/agregar |
| Editar tarjeta | http://127.0.0.1:4200/app/flashcards/1/tarjetas/1/editar |
| Confirmar eliminación | http://127.0.0.1:4200/app/flashcards/1/tarjetas/1/eliminar |
| Mazos del grupo | http://127.0.0.1:4200/app/grupos/1/flashcards |
| Elegir mazo propio | http://127.0.0.1:4200/app/grupos/1/flashcards/elegir |
| Seleccionar grupo y tema | http://127.0.0.1:4200/app/grupos/1/flashcards/compartir/1 |
| Confirmar retirada del grupo | http://127.0.0.1:4200/app/grupos/1/flashcards/1/retirar |
| Confirmar retirada de publicación | http://127.0.0.1:4200/app/flashcards/1/retirar-publicacion |
| Detalle grupal / reanudar | http://127.0.0.1:4200/app/grupos/1/flashcards/1 |
| Pregunta | http://127.0.0.1:4200/app/grupos/1/flashcards/1/repaso/pregunta |
| Respuesta | http://127.0.0.1:4200/app/grupos/1/flashcards/1/repaso/respuesta |
| Pausa / salida | http://127.0.0.1:4200/app/grupos/1/flashcards/1/repaso/pausa |
| Resultado | http://127.0.0.1:4200/app/grupos/1/flashcards/1/repaso/resultado |

Las tarjetas 2, 3 y 4 tienen los mismos formularios reutilizados con su pregunta y respuesta literal al sustituir el ID de tarjeta en editar/eliminar. No son componentes ni rutas distintos por registro. Los enlaces de esta entrega usan el mazo 1 y el grupo 1 de referencia.

## Comportamiento y adaptaciones

- Reactive Forms: título obligatorio, hasta 120; descripción opcional, hasta 500; pregunta y respuesta obligatorias, hasta 1000. Labels persistentes, errores de Material tras interactuar y botón deshabilitado si el formulario es inválido.
- Crear, guardar, compartir, eliminar y retirar solo navegan. Los ejemplos no cambian ni se muestra éxito de persistencia. Los filtros tampoco modifican la lista.
- La biblioteca personal y el listado del grupo son distintos. Solo el mazo principal tiene recorrido completo. Los botones de los mazos secundarios permanecen deshabilitados para evitar abrir un detalle contradictorio. El borrador figura como tal en la biblioteca, sin tarjetas ni progreso.
- Los formularios y las confirmaciones que Figma muestra como diálogos se presentan como vistas con `mat-card`, siguiendo la adaptación autorizada de Temas/Materiales. No hay controladores de MatDialog.
- Se conserva el sidebar/topbar del equipo: no se añadió la barra inferior móvil, el avatar ni la ruta contextual de las capturas de Figma. Las pestañas de grupo siguen teniendo desplazamiento horizontal en móvil. Detalle grupal y repaso usan directamente el shell, como en R01–R07.
- La variante mostrada es la autora Leicy. Las propiedades literales `esAutor` y `esAdministrador` y sus `@if` separan editar de retirar; no representan autenticación. C12 se consultó como referencia, sin crear una ruta de permisos o un control de depuración.
- La cuarta tarjeta es la regla de la cadena. Pregunta y respuesta muestran 3/4 revisadas, 75 %. Ambos botones de autoevaluación abren el mismo resultado literal: 4 revisadas, 3 aprendidas, 1 por repasar; 100 % revisado y 75 % aprendido. Repasar otra vez vuelve a la cuarta tarjeta de referencia, sin motor de repaso ni borrado de progreso.
- Pausar muestra el último avance de ejemplo y permite seguir o volver al grupo. No existe guardado real ni historial de sesiones.

## Verificación

- `npm run build`: compilación correcta. Requiere acceso a Google Fonts para incrustar Roboto. Las advertencias corresponden al presupuesto del bundle inicial y CSS preexistente en dashboard, landing, configuración de tutor y auth-layout; no se cambiaron sus presupuestos.
- Chrome: se recorrieron 19 URLs (18 ejemplos de Flashcards y la conexión desde Materiales) a 1440 y 390 px, sin errores de ejecución de la aplicación ni desbordamiento horizontal. Se inspeccionaron capturas de biblioteca, formulario, compartir, pregunta y resultado.
- Se verificaron los mensajes `required` y `maxLength` de los campos de mazo y tarjeta, además de los estados inválido/válido y la navegación entre biblioteca, detalle, compartir, grupo, pregunta, respuesta y resultado.
- `git diff --check` sin errores. Los cambios ajenos, incluida la edición local de `.gitignore`, se conservaron.

## Pendientes

CRUD, persistencia, autenticación y permisos reales, carga de registros, filtros, contratos del backend y progreso real quedan fuera de esta entrega visual. El formulario de compartir muestra el grupo de ejemplo y sus temas fijos.

«Ver dónde se comparte» permanece deshabilitado: C14 necesita el contrato de publicaciones personales (`GET /api/mazos/{idMazo}/publicaciones`, propuesto). US21 requiere integrar notificaciones al publicar; no se afirma que se haya enviado ninguna. No hay eliminación definitiva de mazos, reinicio persistente del progreso ni política operativa «solo el tutor publica».

No se realizó commit, push, merge ni despliegue.
