# Integración de Temas, Materiales y Flashcards

Base: `develop` del frontend (`b0578b0`), incluida la sesión JWT de Anabella. El backend de referencia es `KeniChris/Yachani`, `develop` (`cb25d00`).

## Puesta en marcha

1. Iniciar el backend y comprobar que `src/environments/environment.ts` apunta a su URL, incluido `/api`. El valor de desarrollo es `http://localhost:8080/api`.
2. Incorporar [el PR 27 del backend](https://github.com/KeniChris/Yachani/pull/27) para habilitar `GET /api/mazos/{idMazo}/publicaciones`. Las demás pantallas utilizan endpoints ya presentes en `develop`. Este PR no necesita migraciones de base de datos.
3. Ejecutar `npm ci` y `npm start`. Iniciar sesión con una cuenta real y configuración inicial completa.
4. Abrir un grupo propio desde Mis grupos. También se puede usar `/recursos/temas` para elegir uno de los grupos devueltos por la API. Las rutas emplean identificadores numéricos reales.

No hay cuentas, grupos ni mazos de demostración en estos componentes. La identidad procede de `AuthService.usuario()`. Se conservan el servicio de autenticación, interceptor, modelos de sesión, guards y configuración de rutas de Anabella.

## Pantallas y peticiones

| Pantalla                   | Peticiones principales                                                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Temas                      | `GET/POST /grupos/{grupo}/temas`, `PATCH /grupos/{grupo}/temas/{tema}`                                                                            |
| Materiales                 | `GET/POST /grupos/{grupo}/materiales`, `PATCH /grupos/{grupo}/materiales/{material}/tema`, `GET .../{material}/descarga`, `DELETE .../{material}` |
| Mis mazos y datos          | `GET/POST /mazos`, `GET/PUT /mazos/{mazo}`                                                                                                        |
| Tarjetas                   | `POST /mazos/{mazo}/tarjetas`, `PUT/DELETE .../tarjetas/{tarjeta}`                                                                                |
| Compartir                  | `GET /grupos/mis-grupos`, `GET /grupos/{grupo}/temas`, `PUT /grupos/{grupo}/mazos/{mazo}`                                                         |
| Mazos del grupo            | `GET /grupos/{grupo}/mazos`, `GET /grupos/{grupo}/mazos/{mazo}`                                                                                   |
| Dónde se comparte          | `GET /mazos/{mazo}/publicaciones`, `DELETE /grupos/{grupo}/mazos/{mazo}`                                                                          |
| Retirar publicación global | `DELETE /mazos/{mazo}/publicacion`                                                                                                                |
| Repaso personal            | `GET /mazos/{mazo}/progreso`, `PUT /mazos/{mazo}/tarjetas/{tarjeta}/progreso`                                                                     |

Todas las rutas anteriores se resuelven respecto de la base `/api`. Las operaciones de escritura de Flashcards devuelven `{ mensaje, datos }`; el servicio extrae `datos`.

Materiales usa `FormData` con una entrada `archivos` por archivo y, si se selecciona, `idTema`. El navegador define el boundary; no se impone `Content-Type`. Se admiten hasta cinco archivos, cada uno no vacío y de hasta 10 MB, con las extensiones que acepta el backend. La descarga usa el enlace firmado mediante navegación y no envía el token a Storage.

Las páginas de Materiales usan los campos `contenido/pagina/tamano/totalElementos/totalPaginas`. Grupos utiliza `content/page/size/totalElements/totalPages/last`. El adaptador de grupos recorre todas las páginas y conserva los arrays que consumen las pantallas existentes, evitando que el resto del equipo tenga que cambiar sus componentes por este contrato.

## Permisos y estados

- El administrador se identifica comparando el usuario autenticado con `idCreador`; la pertenencia se comprueba con los integrantes reales. Los parámetros de demostración `rol`, `permiso`, `autoria`, `contexto` y `publicaciones` no conceden permisos.
- Solo el administrador gestiona temas en un grupo de tutor. En grupos entre estudiantes pueden hacerlo sus integrantes.
- Publica el administrador, un integrante de grupo entre estudiantes o un integrante de grupo de tutor con `permitirPublicaciones=true`.
- Cerrar publicaciones conserva la consulta de materiales y el repaso de mazos publicados.
- Solo el autor mueve sus materiales de tema. Autor y administrador pueden eliminarlos según el acceso que valide el backend.
- Compartir un mazo exige tarjetas y un tema del grupo. Retirar la publicación global lo devuelve a borrador. No se inventa un endpoint para eliminar el mazo personal.
- No se permite borrar la última tarjeta de un mazo publicado: debe retirarse antes su publicación.
- Las respuestas de repaso avanzan únicamente después de que el servidor confirme el guardado. Ante un error permanecen la tarjeta, la respuesta y la opción de reintentar. Los contadores reflejan el progreso devuelto para esa cuenta.

La interfaz ayuda a presentar las acciones disponibles; la autorización definitiva sigue siendo responsabilidad del backend.

## Home y cabecera

Se completan los bloques de cifras y testimonios del diseño, identificados como contenido de muestra. El videotutorial queda como **Próximamente** hasta disponer de un video real. Contacto prepara un correo en la aplicación del usuario: no afirma que se haya enviado un mensaje.

La cabecera reutiliza los SVG de Figma, muestra método y creador, usa pestañas con desplazamiento horizontal en escritorio y un selector Material Menu en móvil. Solicitudes solo aparece para el administrador real.

## Validación

- `npm run build`: compilación de producción con los presupuestos existentes.
- `npx playwright install chromium --only-shell`: preparar el navegador de pruebas.
- Con Angular sirviendo en `http://127.0.0.1:4201`, ejecutar `npm run test:integracion`. Puede configurarse `TEST_BASE_URL` y, opcionalmente, `CHROMIUM_PATH`.
- GitHub Actions realiza el build y las pruebas en Chromium y conserva capturas, geometría de imágenes y logs como artefacto `revision-recursos-frontend`.

Las pruebas de navegador interceptan HTTP con fixtures basadas en los DTO del backend. Verifican los contratos y las interacciones de Angular; no sustituyen una prueba contra Supabase ni validan una firma JWT real.

Antes de la demostración TB3 queda una prueba con dos cuentas reales: subir un PDF a un grupo, abrirlo desde la otra cuenta, compartir un mazo y comprobar que el repaso se conserva al recargar. Requiere backend, PostgreSQL/Storage y cuentas del equipo disponibles.
