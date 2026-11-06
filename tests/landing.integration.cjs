// API y reproductor simulados: estas pruebas no envían correo ni reproducen videos reales.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { mkdir } = require('node:fs/promises');
const { chromium } = require('playwright');
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

async function esperar(condicion) {
  const hasta = Date.now() + 12000;
  while (Date.now() < hasta) {
    if (await condicion()) return;
    await new Promise((resolver) => setTimeout(resolver, 50));
  }
  assert.fail('No se alcanzó el estado esperado de la landing');
}

async function pagina(t, viewport = { width: 1440, height: 1000 }) {
  const context = await browser.newContext({ viewport, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(12000);
  const errores = [];
  page.on('pageerror', (error) => errores.push(error.message));
  t.after(async () => {
    const nombre = t.name.replace(/[^a-zA-Z0-9]/g, '-');
    await page.screenshot({ path: `test-results/${nombre}.png`, fullPage: true }).catch(() => {});
    await context.close();
    assert.deepEqual(errores, []);
  });
  return { context, page };
}

const cabeceras = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST,OPTIONS',
  'access-control-allow-headers': 'content-type,authorization',
};
async function responder(route, status, mensaje) {
  return route.fulfill({ status, headers: cabeceras, json: { mensaje } });
}
async function contacto(context, procesar) {
  await context.route('**/api/contacto', async (route) => {
    if (route.request().method() === 'OPTIONS')
      return route.fulfill({ status: 204, headers: cabeceras });
    return procesar(route);
  });
}
async function completar(page) {
  await page.getByLabel('Nombre', { exact: true }).fill('  Ana Pérez  ');
  await page.getByLabel('Correo', { exact: true }).fill('ana@example.com');
  await page.getByLabel('Asunto', { exact: true }).fill('  Consulta sobre grupos  ');
  await page
    .getByLabel('Mensaje', { exact: true })
    .fill('  Necesito ayuda para encontrar un grupo.  ');
}

for (const [nombre, viewport] of [
  ['escritorio', { width: 1440, height: 1000 }],
  ['movil', { width: 390, height: 844 }],
]) {
  test(
    `Landing ${nombre}: elige cada video y detiene el anterior al cambiar de rol`,
    { timeout: 60000 },
    async (t) => {
      const { context, page } = await pagina(t, viewport);
      const reproducciones = [];
      await context.route('https://www.youtube-nocookie.com/embed/**', async (route) => {
        reproducciones.push(route.request().url());
        await route.fulfill({
          contentType: 'text/html',
          body: '<html lang="es"><body>Reproductor de prueba</body></html>',
        });
      });
      await page.goto(base);
      const reproductor = page.locator('app-tutorial-landing iframe');
      const enlace = page.locator('app-tutorial-landing a');
      assert.equal(await reproductor.count(), 0);
      assert.equal(reproducciones.length, 0);
      assert.equal(
        await enlace.getAttribute('href'),
        'https://www.youtube.com/watch?v=BKrl1zL8zDU',
      );
      await page
        .getByRole('button', { name: 'Reproducir Yachani para estudiantes', exact: true })
        .press('Enter');
      await reproductor.waitFor({ state: 'visible' });
      assert.match(
        await reproductor.getAttribute('src'),
        /youtube-nocookie\.com\/embed\/BKrl1zL8zDU\?/,
      );
      await esperar(() => reproducciones.length === 1);
      await page.locator('app-tutorial-landing mat-button-toggle[value="tutor"]').click();
      await esperar(async () => (await reproductor.count()) === 0);
      await page.getByRole('heading', { name: /Enseña a tu ritmo/ }).waitFor({ state: 'visible' });
      assert.equal(
        await enlace.getAttribute('href'),
        'https://www.youtube.com/watch?v=kwnOnu7YtMQ',
      );
      await page
        .getByRole('button', { name: 'Reproducir Yachani para tutores', exact: true })
        .click();
      await reproductor.waitFor({ state: 'visible' });
      assert.match(
        await reproductor.getAttribute('src'),
        /youtube-nocookie\.com\/embed\/kwnOnu7YtMQ\?/,
      );
      await esperar(() => reproducciones.length === 2);
      await page.locator('.hero mat-button-toggle[value="estudiante"]').click();
      await esperar(async () => (await reproductor.count()) === 0);
      assert.equal(
        await enlace.getAttribute('href'),
        'https://www.youtube.com/watch?v=BKrl1zL8zDU',
      );
      assert.equal(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        true,
      );
      assert.equal(
        await page.getByText('Videotutorial · Próximamente', { exact: true }).count(),
        0,
      );
    },
  );
}

test(
  'Landing: contacto anónimo confirma el envío y evita solicitudes duplicadas',
  { timeout: 60000 },
  async (t) => {
    const { context, page } = await pagina(t);
    const recibidos = [];
    let liberar;
    const pendiente = new Promise((resolver) => {
      liberar = resolver;
    });
    t.after(() => liberar());
    await contacto(context, async (route) => {
      recibidos.push({
        datos: route.request().postDataJSON(),
        cabeceras: route.request().headers(),
      });
      await pendiente;
      return responder(
        route,
        200,
        'Tu mensaje fue enviado. Te responderemos al correo que indicaste.',
      );
    });
    await page.goto(base);
    await completar(page);
    await page.getByRole('button', { name: 'Enviar mensaje', exact: true }).click();
    const enviando = page.getByRole('button', { name: 'Enviando…', exact: true });
    await enviando.waitFor({ state: 'visible' });
    await esperar(() => recibidos.length === 1);
    assert.equal(await enviando.isDisabled(), true);
    assert.equal(
      await page.getByLabel('Mensaje', { exact: true }).evaluate((campo) => campo.readOnly),
      true,
    );
    await page
      .getByRole('form', { name: 'Formulario de contacto' })
      .evaluate((form) =>
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
      );
    assert.equal(recibidos.length, 1);
    assert.deepEqual(recibidos[0].datos, {
      nombre: 'Ana Pérez',
      correo: 'ana@example.com',
      asunto: 'Consulta sobre grupos',
      mensaje: 'Necesito ayuda para encontrar un grupo.',
    });
    assert.equal(recibidos[0].cabeceras.authorization, undefined);
    liberar();
    await page
      .getByRole('status')
      .filter({ hasText: 'Tu mensaje fue enviado.' })
      .waitFor({ state: 'visible' });
    assert.equal(await page.getByLabel('Mensaje', { exact: true }).inputValue(), '');
    assert.equal(
      await page.getByRole('button', { name: 'Enviar mensaje', exact: true }).isDisabled(),
      true,
    );
    assert.equal(await page.locator('mat-error:visible').count(), 0);
  },
);

test(
  'Landing: conserva el texto ante errores SMTP, límite y red para poder reintentar',
  { timeout: 60000 },
  async (t) => {
    const { context, page } = await pagina(t);
    let intento = 0;
    await contacto(context, async (route) => {
      intento++;
      if (intento === 1)
        return responder(
          route,
          503,
          'No fue posible enviar tu mensaje. Inténtalo de nuevo más tarde.',
        );
      if (intento === 2)
        return responder(
          route,
          429,
          'Has alcanzado el límite de mensajes. Inténtalo de nuevo en unos minutos.',
        );
      if (intento === 3) return route.abort('failed');
      return responder(route, 200, 'Tu mensaje fue enviado.');
    });
    await page.goto(base);
    await completar(page);
    for (const esperado of [
      /No fue posible enviar tu mensaje/,
      /Has alcanzado el límite/,
      /Conservamos tu mensaje/,
    ]) {
      await page.getByRole('button', { name: 'Enviar mensaje', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: esperado }).waitFor({ state: 'visible' });
      assert.equal(
        await page.getByLabel('Mensaje', { exact: true }).inputValue(),
        '  Necesito ayuda para encontrar un grupo.  ',
      );
      assert.equal(
        await page.getByRole('button', { name: 'Enviar mensaje', exact: true }).isDisabled(),
        false,
      );
    }
    await page.getByRole('button', { name: 'Enviar mensaje', exact: true }).click();
    await page
      .getByRole('status')
      .filter({ hasText: 'Tu mensaje fue enviado.' })
      .waitFor({ state: 'visible' });
    assert.equal(intento, 4);
  },
);

test(
  'Landing: contacto no envía JWT ni cierra una sesión existente si el endpoint falla con 401',
  { timeout: 60000 },
  async (t) => {
    const { context, page } = await pagina(t);
    await context.addInitScript(() =>
      sessionStorage.setItem(
        'yachani.sesion',
        JSON.stringify({
          accessToken: 'token-de-prueba',
          venceEn: Date.now() + 3600000,
          usuario: {
            idUsuario: 2,
            nombres: 'Ana',
            apellidos: 'Pérez',
            correo: 'ana@example.com',
            tipoUsuario: 'ESTUDIANTE',
            configuracionCompletada: true,
            mensaje: null,
          },
        }),
      ),
    );
    let autorizacion = null;
    await contacto(context, async (route) => {
      autorizacion = route.request().headers().authorization;
      return responder(route, 401, 'El formulario no está disponible.');
    });
    await page.goto(base);
    await completar(page);
    await page.getByRole('button', { name: 'Enviar mensaje', exact: true }).click();
    await page
      .getByRole('alert')
      .filter({ hasText: 'El formulario no está disponible.' })
      .waitFor({ state: 'visible' });
    assert.equal(autorizacion, undefined);
    assert.equal(new URL(page.url()).pathname, '/');
    assert.equal(
      await page.evaluate(() => JSON.parse(sessionStorage.getItem('yachani.sesion')).accessToken),
      'token-de-prueba',
    );
  },
);

test(
  'Landing: bloquea un formulario vacío, solo espacios o correo inválido',
  { timeout: 60000 },
  async (t) => {
    const { context, page } = await pagina(t);
    let llamadas = 0;
    await contacto(context, async (route) => {
      llamadas++;
      return responder(route, 200, 'Tu mensaje fue enviado.');
    });
    await page.goto(base);
    const enviar = page.getByRole('button', { name: 'Enviar mensaje', exact: true });
    assert.equal(await enviar.isDisabled(), true);
    await completar(page);
    await page.getByLabel('Nombre', { exact: true }).fill('   ');
    assert.equal(await enviar.isDisabled(), true);
    await page.getByLabel('Nombre', { exact: true }).fill('Ana');
    await page.getByLabel('Correo', { exact: true }).fill('correo-invalido');
    await page.getByLabel('Correo', { exact: true }).blur();
    await page
      .getByText('Ingresa un correo electrónico válido.', { exact: true })
      .waitFor({ state: 'visible' });
    assert.equal(await enviar.isDisabled(), true);
    assert.equal(llamadas, 0);
  },
);
