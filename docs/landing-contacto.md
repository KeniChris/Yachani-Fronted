# Landing: tutoriales y contacto

## Tutoriales

| Rol | Video |
| --- | --- |
| Estudiante | [Tutorial de estudiante](https://youtu.be/BKrl1zL8zDU) |
| Tutor | [Tutorial de tutor](https://youtu.be/kwnOnu7YtMQ) |

El selector de tutoriales y el de la cabecera comparten el rol. El reproductor se incorpora después de pulsar **Reproducir tutorial**; al cambiar de rol se elimina el reproductor anterior para detener su audio. Se usa el dominio de reproducción `youtube-nocookie.com`, sin cargar miniaturas ni el reproductor de YouTube antes del clic. Cada rol también tiene un enlace para abrir su video directamente en YouTube.

Los IDs están definidos en `src/app/home/tutorial-landing/tutorial-landing.ts`. Son valores del equipo, no entradas del visitante. El iframe permite pantalla completa y utiliza `strict-origin-when-cross-origin` como política de referente. Los videos deben permitir inserción en la configuración de YouTube. Las pruebas verifican el selector y los enlaces con un iframe simulado; la reproducción y disponibilidad de YouTube se comprueban manualmente.

## Contacto

El formulario utiliza `ContactoService` para enviar un JSON a `POST /api/contacto`, sin JWT. No requiere iniciar sesión ni abrir una aplicación de correo. Nombre, correo, asunto y mensaje son obligatorios; sus límites coinciden con el backend: 100, 254, 150 y 5000 caracteres.

Durante el envío se bloquean los campos y se evita una segunda solicitud. Solo se muestra confirmación y se limpia el formulario tras recibir una respuesta correcta. Ante un error de validación, límite, red o SMTP se muestra el error y se conservan los datos para reintentar.

El backend necesita el endpoint de contacto y la configuración SMTP existente:

- `MAIL_USERNAME`: cuenta que envía los correos.
- `MAIL_PASSWORD`: credencial SMTP que ya usa recuperación de contraseña.
- `CONTACT_MAIL_TO`: bandeja de consultas; de forma predeterminada, `yachani.soporte@gmail.com`.

Al responder desde la bandeja de consultas, `Reply-To` dirige la respuesta al visitante. El correo visible en Home debe coincidir con la bandeja de soporte del equipo. No se envía una segunda confirmación automática por correo al visitante.

No requiere cambios SQL. Integrar primero el PR de contacto del backend y comprobar la URL de la API en `src/environments/`.

## Comprobación

```bash
npm run build
npx playwright install chromium --only-shell
npm start -- --host 127.0.0.1 --port 4201
```

Con Angular iniciado, en otra terminal:

```bash
npm run test:integracion
npm run test:landing
```

GitHub Actions ejecuta ambos conjuntos. Las pruebas de landing comprueban los dos roles en escritorio y móvil, confirmación de envío, datos conservados tras errores, solicitudes duplicadas, validaciones y exclusión del JWT. Las llamadas de correo y YouTube se simulan: no sustituyen el envío a una bandeja real ni comprueban reproducción externa.

Para la aceptación final: reproducir ambos videos, cambiar de rol mientras se reproduce uno y comprobar que se detiene; enviar una consulta real desde Home, revisar su recepción y responder al correo del visitante.
