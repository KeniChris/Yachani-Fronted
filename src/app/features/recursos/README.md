# Temas y materiales: entrega visual

Se consultaron los frames actualizados de Figma indicados en la especificación (escritorio y móvil), con la cuenta u20231e777@upc.edu.pe, y los fundamentos de la guía 1:497. No se modificó Figma.

El acceso se volvió a comprobar mediante `whoami`: la cuenta UPC corresponde a `link_6ade4e0159988191a71034e4c198a1b6` (Primary). Se creó una sesión y se reutilizó su identificador en las consultas. `get_design_context` del archivo `3Dl2ksR7TPkmonQWVzl3H2`, nodo `21:284`, devolvió código y captura correctamente. También se consultaron los 22 frames de la tabla de referencias y las secciones de fundamentos, botones y formularios de la guía detallada.

Las páginas standalone reutilizan AppLayout, sidebar, topbar, tema, tokens y Material Symbols Rounded. Los diálogos se adaptan a vistas de mat-card de 600 px como permite la especificación; no se incorporó MatDialog. Los botones de crear, guardar, publicar y eliminar únicamente navegan. Los datos literales vuelven a aparecer sin cambios. Los selectores no filtran; el paginador muestra tres elementos en una sola página. Seleccionar, quitar y descargar archivos son controles visuales sin manejadores.

## Abrir las vistas

Con `npm start -- --host 127.0.0.1`, la base es `http://127.0.0.1:4200/app/grupos/1/`:

- `temas`
- `temas/crear`
- `temas/2/editar` (también IDs 1 y 3)
- `materiales`
- `temas/2/materiales`
- `materiales/subir`
- `materiales/1` (propio), `materiales/2` y `materiales/3` (ajenos, sin eliminar)
- `materiales/1/cambiar-tema`
- `materiales/1/eliminar`

Los IDs corresponden únicamente a los ejemplos de la especificación; no hay carga de registros reales, autenticación ni permisos calculados.

## Adaptaciones y pendientes

- El shell existente muestra su propia topbar y menú lateral desplegable en móvil; no se añadió la barra inferior del Figma ni se alteró la navegación de otras integrantes.
- Las pestañas de grupo cuyos módulos aún no tienen rutas se presentan sin navegación. El mazo es ilustrativo y Ver mazo está deshabilitado hasta disponer de su ruta.
- Se conserva el tema global: su borde de campo es #7C6A88, frente al token CSS #7C6A8B de la especificación. No se cambió el tema compartido.
- En el detalle de escritorio de Figma hay botones con ancho 1344 px que desbordan una tarjeta de 600 px. Aquí se ajustan al ancho de la tarjeta, como en móvil.
- El PNG usa la fecha 27 oct 2026 de los datos acordados; su detalle en Figma indica 28 oct 2026.
- Pendientes: backend, permisos reales, persistencia, filtrado y paginación funcional, lectura/validación/subida y descarga de archivos, eliminación real, diálogos e integración con flashcards.

## Verificación local · 29 oct 2026

- `npm run build` termina correctamente. Advierte del presupuesto del bundle inicial y de CSS en dashboard, landing, configuración de tutor y auth-layout; no se modificaron esos módulos ni sus presupuestos.
- Servidor iniciado con `npm start -- --host 127.0.0.1`, puerto 4200.
- Chrome: 11 vistas a 1440 y 390 px, sin errores de ejecución ni desbordamiento horizontal de la página. Capturas revisadas de Temas, Materiales, subida y detalle. Se corrigieron el ancho del botón de cerrar que comprimía los títulos móviles, la tipografía y el orden vertical de las acciones.
- Validaciones verificadas: nombre obligatorio, nombre de más de 100 caracteres y descripción de más de 300; los errores de Material son visibles después de interactuar y guardar permanece deshabilitado mientras el formulario es inválido.
- Con nombre y descripción válidos, el botón se habilita y navega al listado; los tres temas originales se mantienen, como corresponde a esta fase sin persistencia.
- El detalle propio ofrece eliminar; los detalles ajenos de los ejemplos 2 y 3 lo ocultan. Es una variante visual fija, sin autorización real.
- Los iconos reutilizan Material Symbols Rounded de la base, identificados con esos mismos nombres en Figma. No hay URLs temporales de assets de Figma en la interfaz.
