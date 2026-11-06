const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { mkdir, writeFile } = require('node:fs/promises');
const { chromium } = require('playwright');
const { crearEstado, instalarApi } = require('./api-fixture.cjs');
const base = process.env.TEST_BASE_URL ?? 'http://127.0.0.1:4201';
let browser;
before(async () => {
  browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  });
  await mkdir('test-results', { recursive: true });
});
after(async () => {
  await browser?.close();
});
async function esperar(fn, mensaje = 'La condición no se cumplió') {
  const limite = Date.now() + 12000;
  while (Date.now() < limite) {
    if (await fn()) return;
    await new Promise((r) => setTimeout(r, 80));
  }
  assert.fail(mensaje);
}
async function ver(locator) {
  await locator.waitFor({ state: 'visible', timeout: 12000 });
}
async function sesion(t, opciones = {}, viewport = { width: 1440, height: 1000 }) {
  const s = crearEstado(opciones),
    context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  await instalarApi(context, s);
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  const errores = [];
  page.on('pageerror', (e) => errores.push(e.message));
  t.after(async () => {
    const nombre = t.name.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 80);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    await page.screenshot({ path: `test-results/${nombre}.png`, fullPage: true }).catch(() => {});
    const geometria = await page
      .evaluate(() => ({
        url: location.href,
        ancho: innerWidth,
        documento: document.documentElement.scrollWidth,
        cabecera: document
          .querySelector('app-grupo-layout .group-card')
          ?.getBoundingClientRect()
          .toJSON(),
        imagenes: [...document.images]
          .filter((i) => i.getClientRects().length && i.getBoundingClientRect().width)
          .map((i) => ({
            src: i.currentSrc,
            natural: [i.naturalWidth, i.naturalHeight],
            css: [getComputedStyle(i).width, getComputedStyle(i).height],
            rect: i.getBoundingClientRect().toJSON(),
          })),
      }))
      .catch(() => null);
    await writeFile(`test-results/${nombre}.json`, JSON.stringify({ geometria, errores }, null, 2));
    await context.close();
  });
  return { s, context, page, errores };
}
async function login(page, s) {
  await page.goto(`${base}/auth/iniciar-sesion`);
  await page.getByLabel('Correo institucional', { exact: true }).fill(s.usuario.correo);
  await page.getByLabel('Contraseña', { exact: true }).fill('ClaveDePrueba123');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await page.waitForURL(/\/inicio\?/);
}
async function ir(page, path) {
  await page.goto(base + path);
}
async function seleccionar(page, label, opcion) {
  const dialog = page.getByRole('dialog');
  await ver(dialog);
  const root = dialog;
  await root.getByRole('combobox', { name: label, exact: true }).click();
  await page.getByRole('option', { name: opcion, exact: true }).click();
}
const cuerpo = (s, path, method) =>
  s.llamadas.filter((r) => r.path === path && r.method === method).at(-1)?.body;

test(
  'Temas: conserva el formulario tras un fallo y permite crear y editar',
  { timeout: 60000 },
  async (t) => {
    const { s, page } = await sesion(t);
    s.fallarTema = 1;
    await login(page, s);
    await ir(page, '/grupos/7/recursos/temas');
    await page.getByRole('button', { name: 'Crear tema', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByLabel('Nombre del tema').fill('Integrales');
    await dialog.getByLabel('Descripción (opcional)').fill('Técnicas de integración');
    await dialog.getByRole('button', { name: 'Guardar tema', exact: true }).click();
    await ver(dialog.getByRole('alert'));
    assert.equal(await dialog.getByLabel('Nombre del tema').inputValue(), 'Integrales');
    assert.equal(s.temas.length, 1);
    await dialog.getByRole('button', { name: 'Guardar tema', exact: true }).click();
    await ver(page.getByRole('heading', { name: 'Integrales', exact: true }));
    await page.getByRole('button', { name: 'Editar Integrales', exact: true }).click();
    await dialog.getByLabel('Nombre del tema').fill('Integrales definidas');
    await dialog.getByRole('button', { name: 'Guardar tema', exact: true }).click();
    await ver(page.getByRole('heading', { name: 'Integrales definidas', exact: true }));
    assert.deepEqual(cuerpo(s, '/grupos/7/temas/23', 'PATCH'), {
      nombre: 'Integrales definidas',
      descripcion: 'Técnicas de integración',
    });
  },
);

test(
  'Materiales: sube archivos reales en multipart y permite moverlos a Sin tema',
  { timeout: 60000 },
  async (t) => {
    const { s, page } = await sesion(t);
    await login(page, s);
    await ir(page, '/grupos/7/recursos/materiales?idTema=21');
    await page.getByRole('button', { name: 'Subir materiales', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('input[type=file]').setInputFiles([
      {
        name: 'apuntes.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 apuntes de prueba'),
      },
      {
        name: 'ejercicios.pdf',
        mimeType: 'application/pdf',
        buffer: Buffer.from('%PDF-1.4 ejercicios de prueba'),
      },
    ]);
    await dialog.getByRole('button', { name: 'Publicar 2 archivos', exact: true }).click();
    await ver(page.getByRole('button', { name: /apuntes\.pdf/ }).first());
    const envio = s.llamadas.find((r) => r.path === '/grupos/7/materiales' && r.method === 'POST');
    assert.match(envio.contentType, /multipart\/form-data; boundary=/);
    assert.equal((envio.body.match(/name="archivos";/g) ?? []).length, 2);
    assert.match(envio.body, /name="idTema"\r\n\r\n21/);
    await page.getByRole('button', { name: 'Opciones de apuntes.pdf', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Cambiar tema', exact: true }).click();
    await seleccionar(page, 'Tema', 'Sin tema');
    await dialog.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
    await esperar(() => s.materiales[0].idTema === null);
    assert.deepEqual(cuerpo(s, '/grupos/7/materiales/500/tema', 'PATCH'), { idTema: null });
    assert.ok(envio.authorization.startsWith('Bearer '));
  },
);

test(
  'Materiales: rechaza formatos inválidos antes de llamar a la API',
  { timeout: 60000 },
  async (t) => {
    const { s, page } = await sesion(t);
    await login(page, s);
    await ir(page, '/grupos/7/recursos/materiales');
    await page.getByRole('button', { name: 'Subir materiales', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.locator('input[type=file]').setInputFiles({
      name: 'programa.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('archivo de prueba'),
    });
    await ver(dialog.getByRole('alert'));
    assert.equal(
      await dialog.getByRole('button', { name: 'Publicar archivo', exact: true }).isDisabled(),
      true,
    );
    assert.equal(
      s.llamadas.some((r) => r.path === '/grupos/7/materiales' && r.method === 'POST'),
      false,
    );
  },
);

test(
  'Materiales: mantiene la página si falla borrar y vuelve a la anterior tras borrar',
  { timeout: 60000 },
  async (t) => {
    const { s, page } = await sesion(t, { materiales: 11 });
    s.fallarEliminar = 1;
    await login(page, s);
    await ir(page, '/grupos/7/recursos/materiales');
    await page.getByRole('button', { name: 'Página siguiente', exact: true }).click();
    await page.getByRole('button', { name: 'Opciones de Guía 11.pdf', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Eliminar material', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Eliminar material', exact: true }).click();
    await ver(dialog.getByRole('alert'));
    await ver(page.getByText('11–11 de 11', { exact: true }));
    assert.equal(s.materiales.length, 11);
    await dialog.getByRole('button', { name: 'Eliminar material', exact: true }).click();
    await ver(page.getByText('1–10 de 10', { exact: true }));
    assert.equal(s.materiales.length, 10);
  },
);

test(
  'Flashcards: crea un mazo, agrega una tarjeta, edita datos y lo comparte',
  { timeout: 60000 },
  async (t) => {
    const { s, page } = await sesion(t);
    await login(page, s);
    await ir(page, '/flashcards/crear');
    await page.getByLabel('Título del mazo').fill('Integrales para repasar');
    await page.getByLabel('Descripción (opcional)').fill('Para el parcial');
    await page.getByRole('button', { name: 'Crear y agregar tarjetas', exact: true }).click();
    await page.waitForURL(/\/flashcards\/40\?editor=agregar/);
    await page.getByLabel('Pregunta', { exact: true }).fill('¿Integral de 2x?');
    await page.getByLabel('Respuesta', { exact: true }).fill('x² + C');
    await page
      .locator('form')
      .getByRole('button', { name: 'Agregar tarjeta', exact: true })
      .click();
    await ver(page.getByText('¿Integral de 2x?', { exact: true }));
    await page.getByRole('link', { name: 'Editar datos', exact: true }).click();
    await page.getByLabel('Título del mazo').fill('Integrales esenciales');
    await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
    await ver(page.getByRole('heading', { name: 'Integrales esenciales', exact: true }));
    await page.getByRole('button', { name: 'Compartir en un grupo', exact: true }).click();
    await seleccionar(page, 'Grupo', 'Dominando Cálculo');
    await seleccionar(page, 'Tema del grupo', 'Derivadas');
    await page
      .getByRole('dialog')
      .getByRole('button', { name: 'Compartir mazo', exact: true })
      .click();
    await ver(page.getByRole('link', { name: 'Ver dónde se comparte', exact: true }));
    assert.equal(s.mazos[0].estado, 'PUBLICADO');
    assert.deepEqual(cuerpo(s, '/grupos/7/mazos/40', 'PUT'), { idTema: 21 });
    await page.getByRole('link', { name: 'Ver dónde se comparte', exact: true }).click();
    await ver(page.getByRole('heading', { name: 'Dominando Cálculo', exact: true }));
    await ver(page.getByText('Tema: Derivadas', { exact: true }));
  },
);

test(
  'Repaso: reintenta el guardado sin saltar tarjetas y muestra el progreso confirmado',
  { timeout: 60000 },
  async (t) => {
    const { s, page } = await sesion(t, { estudiante: true, mazo: true });
    s.fallarProgreso = 1;
    await login(page, s);
    await ir(page, '/grupos/7/flashcards/40');
    await page.getByRole('button', { name: 'Continuar repaso', exact: true }).click();
    await page.getByRole('button', { name: 'Mostrar respuesta', exact: true }).click();
    await page.getByRole('button', { name: 'La aprendí', exact: true }).click();
    await ver(page.getByRole('alert'));
    await ver(page.getByRole('heading', { name: '2x', exact: true }));
    assert.equal(s.progreso['2:40'], undefined);
    await page.getByRole('button', { name: 'La aprendí', exact: true }).click();
    await ver(page.getByRole('heading', { name: '¿Cuál es la derivada de sen(x)?', exact: true }));
    await page.getByRole('button', { name: 'Mostrar respuesta', exact: true }).click();
    await page.getByRole('button', { name: 'Aún no', exact: true }).click();
    await ver(page.getByRole('heading', { name: '¡Repaso completado!', exact: true }));
    await ver(page.getByText('50 %', { exact: true }));
    assert.equal(Object.keys(s.progreso['2:40']).length, 2);
    assert.equal(s.progreso['1:40'], undefined);
    assert.deepEqual(cuerpo(s, '/mazos/40/tarjetas/52/progreso', 'PUT'), { aprendida: false });
    await page.reload();
    await ver(page.getByRole('heading', { name: '2 de 2 revisadas · 1 aprendidas', exact: true }));
  },
);

test(
  'Permisos: publicaciones cerradas conservan la consulta y los parámetros no elevan permisos',
  { timeout: 60000 },
  async (t) => {
    const { s, page } = await sesion(t, {
      estudiante: true,
      cerrado: true,
      mazo: true,
      materiales: 1,
    });
    await login(page, s);
    const query = '?rol=tutor&permiso=administrador&contexto=estudiantes&publicaciones=todos';
    await ir(page, '/grupos/7/recursos/temas' + query);
    await ver(page.getByRole('heading', { name: 'Derivadas', exact: true }));
    assert.equal(await page.getByRole('button', { name: 'Crear tema', exact: true }).count(), 0);
    assert.equal(
      await page
        .locator('.desktop-sections')
        .getByRole('link', { name: 'Solicitudes', exact: true })
        .count(),
      0,
    );
    await ir(page, '/grupos/7/recursos/materiales' + query);
    await ver(page.getByRole('button', { name: 'Opciones de Guía 1.pdf', exact: true }));
    assert.equal(
      await page.getByRole('button', { name: 'Subir materiales', exact: true }).count(),
      0,
    );
    await ir(page, '/grupos/7/flashcards' + query);
    await ver(page.getByRole('heading', { name: 'Derivadas esenciales', exact: true }));
    assert.equal(
      await page.getByRole('button', { name: 'Compartir un mazo', exact: true }).count(),
      0,
    );
    await page.getByRole('link', { name: 'Ver mazo', exact: true }).click();
    await ver(page.getByRole('button', { name: 'Continuar repaso', exact: true }));
  },
);

test(
  'Móvil: selector del grupo navega y sus iconos mantienen 24 px',
  { timeout: 60000 },
  async (t) => {
    const { s, page } = await sesion(
      t,
      { estudiante: true, mazo: true },
      { width: 390, height: 844 },
    );
    await login(page, s);
    await ir(page, '/grupos/7/recursos/temas');
    const selector = page.getByRole('button', { name: 'Cambiar sección del grupo', exact: true });
    await ver(selector);
    await selector.click();
    await page.getByRole('menuitem', { name: 'Flashcards', exact: true }).click();
    await page.waitForURL(/\/grupos\/7\/flashcards$/);
    await ver(page.getByRole('heading', { name: 'Derivadas esenciales', exact: true }));
    const medida = await page.locator('app-grupo-layout .group-card').evaluate((el) => ({
      ancho: el.getBoundingClientRect().width,
      imgs: [...el.querySelectorAll('img')]
        .filter((i) => i.getBoundingClientRect().width)
        .map((i) => ({ width: i.width, height: i.height, naturalWidth: i.naturalWidth })),
    }));
    assert.ok(medida.ancho <= 390);
    assert.ok(medida.imgs.every((i) => i.width === 24 && i.height === 24 && i.naturalWidth === 24));
    assert.equal(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      true,
    );
  },
);

test(
  'Grupos: recorre todas las páginas para elegir un grupo real',
  { timeout: 60000 },
  async (t) => {
    const { s, page } = await sesion(t, { grupos: 101 });
    await login(page, s);
    await ir(page, '/recursos/temas');
    await ver(page.getByRole('link', { name: 'Grupo adicional 100', exact: true }));
    assert.ok(
      s.llamadas.some(
        (r) => r.path === '/grupos/mis-grupos' && new URLSearchParams(r.query).get('page') === '1',
      ),
    );
  },
);

test(
  'Descarga: navega al enlace firmado sin enviar el JWT a Storage',
  { timeout: 60000 },
  async (t) => {
    const { s, context, page } = await sesion(t, { materiales: 1 });
    let cabeceras = null;
    await context.route('https://storage.example.test/**', async (route) => {
      cabeceras = route.request().headers();
      await route.fulfill({ contentType: 'text/plain', body: 'Archivo de prueba' });
    });
    await login(page, s);
    await ir(page, '/grupos/7/recursos/materiales');
    await page.getByRole('button', { name: 'Descargar Guía 1.pdf', exact: true }).click();
    await esperar(() => cabeceras !== null);
    assert.equal(cabeceras.authorization, undefined);
  },
);

for (const [nombre, viewport] of [
  ['escritorio', { width: 1440, height: 1000 }],
  ['móvil', { width: 390, height: 844 }],
]) {
  test(
    `Home ${nombre}: muestra secciones, video pendiente y contacto válido`,
    { timeout: 60000 },
    async (t) => {
      const { page } = await sesion(t, {}, viewport);
      await ir(page, '/');
      await ver(page.getByRole('heading', { name: /Aprende a tu ritmo/ }));
      await page.getByText('Estudiante tutor', { exact: true }).click();
      await ver(page.getByRole('heading', { name: /Enseña a tu ritmo/ }));
      await page.screenshot({
        path: `test-results/Home-${nombre === 'móvil' ? 'movil' : 'escritorio'}-tutor.png`,
        fullPage: true,
      });
      await page.locator('mat-button-toggle[value="estudiante"]').click();
      await ver(page.getByRole('heading', { name: /Aprende a tu ritmo/ }));
      assert.equal(await page.locator('.testimonials .panel').count(), 3);
      await ver(page.getByText('Videotutorial · Próximamente', { exact: true }));
      const correo = page.getByRole('button', { name: 'Preparar correo', exact: true });
      assert.equal(await correo.isDisabled(), true);
      await page.getByLabel('Nombre', { exact: true }).fill('Ana Pérez');
      await page.getByLabel('Correo', { exact: true }).fill('ana@upc.edu.pe');
      await page.getByLabel('Asunto', { exact: true }).fill('Consulta sobre materiales');
      await page
        .getByLabel('Mensaje', { exact: true })
        .fill('¿Cómo organizo los archivos de mi grupo?');
      assert.equal(await correo.isDisabled(), false);
      await page.getByText('¿Cómo puedo unirme a un grupo de estudio?', { exact: true }).click();
      await ver(page.getByText(/envía una solicitud para que quien administra/));
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      assert.equal(
        await page
          .locator('app-home')
          .evaluate((el) =>
            [...el.querySelectorAll('img')]
              .filter((i) => i.getBoundingClientRect().width)
              .every((i) => i.complete && i.naturalWidth > 0),
          ),
        true,
      );
    },
  );
}

// Un fallo en las flashcards del tema no debe ocultar los archivos disponibles.
test(
  'Materiales: conserva los archivos cuando falla la consulta de mazos del tema',
  { timeout: 60000 },
  async (t) => {
    const { s, context, page } = await sesion(t, { materiales: 1 });
    await context.route('**/api/grupos/7/mazos?*', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ mensaje: 'Fallo temporal' }),
      }),
    );
    await login(page, s);
    await ir(page, '/grupos/7/recursos/materiales?idTema=21');
    await ver(page.getByRole('button', { name: 'Opciones de Guía 1.pdf', exact: true }));
    await ver(page.getByRole('button', { name: 'Reintentar flashcards', exact: true }));
  },
);

test('Temas: permite editar el mismo tema tres veces y confirma cada guardado', { timeout: 60000 }, async (t) => {
  const { s, page } = await sesion(t);
  await login(page, s);
  await ir(page, '/grupos/7/recursos/temas');
  let nombre = 'Derivadas';
  for (const nuevo of ['Derivadas básicas', 'Derivadas avanzadas', 'Derivadas finales']) {
    await page.getByRole('button', { name: 'Editar ' + nombre, exact: true }).click();
    const dialog = page.getByRole('dialog');
    await ver(dialog);
    await dialog.getByLabel('Nombre del tema').fill(nuevo);
    await dialog.getByRole('button', { name: 'Guardar tema', exact: true }).click();
    await dialog.waitFor({ state: 'hidden' });
    await ver(page.getByRole('heading', { name: nuevo, exact: true }));
    await ver(page.getByText('Tema actualizado correctamente.', { exact: true }));
    nombre = nuevo;
  }
  assert.equal(s.temas.length, 1);
  assert.equal(s.llamadas.filter((r) => r.method === 'PATCH' && r.path === '/grupos/7/temas/21').length, 3);
});

test('Temas: muestra el límite del backend y conserva el formulario al rechazar el tema 31', { timeout: 60000 }, async (t) => {
  const { s, context, page } = await sesion(t);
  s.temas = Array.from({ length: 30 }, (_, i) => ({ ...s.temas[0], idTema: 21 + i, nombre: 'Tema ' + (i + 1) }));
  await context.route('**/api/grupos/7/temas', (route) =>
    route.request().method() === 'POST'
      ? route.fulfill({ status: 409, json: { mensaje: 'Este grupo alcanzó el límite de 30 temas' } })
      : route.fallback(),
  );
  await login(page, s);
  await ir(page, '/grupos/7/recursos/temas');
  await page.getByRole('button', { name: 'Crear tema', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Nombre del tema').fill('Tema adicional');
  await dialog.getByRole('button', { name: 'Guardar tema', exact: true }).click();
  await ver(dialog.getByRole('alert'));
  assert.match(await dialog.getByRole('alert').innerText(), /30 temas/);
  assert.equal(await dialog.getByLabel('Nombre del tema').inputValue(), 'Tema adicional');
  assert.equal(s.temas.length, 30);
});

test('Acceso: un usuario ajeno ve cómo solicitar ingreso en Temas, Materiales y Flashcards', { timeout: 60000 }, async (t) => {
  const { s, context, page } = await sesion(t, { estudiante: true });
  await context.route('**/api/grupos/7/integrantes', (route) =>
    route.fulfill({ status: 403, json: { mensaje: 'No perteneces a este grupo' } }),
  );
  await login(page, s);
  for (const ruta of ['/grupos/7/recursos/temas', '/grupos/7/recursos/materiales', '/grupos/7/flashcards']) {
    await ir(page, ruta);
    await ver(page.getByRole('heading', { name: 'Aún no perteneces a este grupo', exact: true }));
    await ver(page.getByRole('link', { name: 'Ver grupo y solicitar ingreso', exact: true }));
    assert.equal(await page.getByText(/Todavía no hay (temas|materiales|mazos)/).count(), 0);
  }
  assert.equal(s.llamadas.filter((r) => /^\/grupos\/7\/(temas|materiales|mazos)$/.test(r.path)).length, 0);
});

test('Ingreso: un grupo completo informa Sin cupos y no envía una solicitud', { timeout: 60000 }, async (t) => {
  const { s, page } = await sesion(t, { estudiante: true });
  s.grupos = [];
  Object.assign(s.grupo, { capacidadMaxima: 2, integrantesActuales: 2, cuposDisponibles: 0 });
  await login(page, s);
  await ir(page, '/grupos/descubrimiento/7');
  await ver(page.getByRole('button', { name: 'Sin cupos', exact: true }));
  await ver(page.getByText('Este grupo no tiene cupos', { exact: true }));
  assert.equal(await page.locator('.notice.warning').count(), 0);
  assert.equal(await page.getByText('Ya tienes una solicitud registrada', { exact: true }).count(), 0);
  assert.equal(s.llamadas.filter((r) => r.method === 'POST' && r.path === '/grupos/7/solicitudes').length, 0);
});

test('Ingreso: un fallo de red permite reintentar y no inventa una solicitud pendiente', { timeout: 60000 }, async (t) => {
  const { s, context, page } = await sesion(t, { estudiante: true });
  s.grupos = [];
  await context.route('**/api/grupos/7/solicitudes', (route) => route.abort('failed'));
  await login(page, s);
  await ir(page, '/grupos/descubrimiento/7');
  const boton = page.getByRole('button', { name: 'Solicitar ingreso', exact: true });
  await ver(boton);
  await boton.click();
  await ver(page.getByRole('alert'));
  assert.match(await page.getByRole('alert').innerText(), /conectar con el servidor/);
  assert.equal(await boton.isEnabled(), true);
  assert.equal(await page.getByText('Tu solicitud está pendiente', { exact: true }).count(), 0);
});

test('Ingreso: una solicitud pendiente real y una membresía muestran estados distintos', { timeout: 60000 }, async (t) => {
  const { s, page } = await sesion(t, { estudiante: true });
  s.grupos = [];
  s.solicitudes = [{ idSolicitud: 90, idGrupo: 7, estado: 'PENDIENTE', fechaSolicitud: '2026-11-06T12:00:00' }];
  await login(page, s);
  await ir(page, '/grupos/descubrimiento/7');
  await ver(page.getByText('Tu solicitud está pendiente', { exact: true }));
  s.grupos = [s.grupo];
  s.solicitudes = [];
  await page.reload();
  await ver(page.getByText('Ya formas parte de este grupo.', { exact: true }));
  await ver(page.getByRole('link', { name: 'Entrar al grupo', exact: true }));
});

test('Sesiones: muestra tres sesiones y permite editar repetidamente sin perder las demás', { timeout: 90000 }, async (t) => {
  const { s, page } = await sesion(t);
  const fecha = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  s.sesiones = [3, 1, 2].map((id) => ({
    idSesion: id, idGrupo: 7, tema: 'Sesión ' + id, descripcion: 'Repaso',
    fechaHoraInicio: fecha + 'T' + String(14 + id).padStart(2, '0') + ':00:00',
    duracionMinutos: 60, lugar: 'Aula virtual', estado: 'PROGRAMADA',
  }));
  await login(page, s);
  await ir(page, '/grupos/7/sesiones');
  await ver(page.getByRole('heading', { name: 'Sesión 1', exact: true }));
  assert.deepEqual(await page.locator('article.session h2').allTextContents(), ['Sesión 1', 'Sesión 2', 'Sesión 3']);
  let nombre = 'Sesión 1';
  for (const nuevo of ['Sesión actualizada', 'Sesión editada de nuevo']) {
    const tarjeta = page.locator('article.session').filter({ has: page.getByRole('heading', { name: nombre, exact: true }) });
    await tarjeta.getByRole('link', { name: 'Editar', exact: true }).click();
    const tema = page.getByLabel('Tema', { exact: true });
    await ver(tema);
    await esperar(async () => await tema.inputValue() === nombre);
    await tema.fill(nuevo);
    await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
    await ver(page.getByRole('heading', { name: nuevo, exact: true }));
    assert.equal(new URL(page.url()).searchParams.has('vista'), false);
    assert.equal(await page.locator('article.session').count(), 3);
    nombre = nuevo;
  }
  s.fallarCancelarSesion = 1;
  const segunda = page.locator('article.session').filter({ has: page.getByRole('heading', { name: 'Sesión 2', exact: true }) });
  await segunda.getByRole('button', { name: 'Cancelar', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await ver(dialog);
  await dialog.getByRole('button', { name: 'Cancelar sesión', exact: true }).click();
  await ver(dialog.getByRole('alert'));
  assert.equal(s.sesiones.filter((item) => item.estado === 'PROGRAMADA').length, 3);
  await dialog.getByRole('button', { name: 'Cancelar sesión', exact: true }).click();
  await dialog.waitFor({ state: 'hidden' });
  await esperar(async () => await page.locator('article.session').count() === 2);
});

