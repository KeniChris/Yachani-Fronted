// Contratos obtenidos de los DTO y controllers de Yachani/develop.
// No conecta con PostgreSQL, Storage ni un servidor de autenticación real.
const fecha = '2026-11-04T08:00:00';
function pagina(items, page = 0, size = 100) {
  return {
    content: items.slice(page * size, (page + 1) * size),
    page,
    size,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
    last: (page + 1) * size >= items.length,
  };
}
function crearEstado({
  estudiante = false,
  cerrado = false,
  mazo = false,
  materiales = 0,
  grupos = 1,
} = {}) {
  const usuarios = {
    1: {
      idUsuario: 1,
      nombres: 'Carlos',
      apellidos: 'Ríos',
      correo: 'carlos@upc.edu.pe',
      tipoUsuario: 'TUTOR',
      configuracionCompletada: true,
    },
    2: {
      idUsuario: 2,
      nombres: 'Ana',
      apellidos: 'Pérez',
      correo: 'ana@upc.edu.pe',
      tipoUsuario: 'ESTUDIANTE',
      configuracionCompletada: true,
    },
  };
  const grupo = {
    idGrupo: 7,
    nombre: 'Dominando Cálculo',
    descripcion: 'Grupo de estudio',
    metodoEstudio: 'Resolución de ejercicios',
    capacidadMaxima: 20,
    integrantesActuales: 1,
    estado: 'ACTIVO',
    tipoGrupo: 'TUTOR',
    idCreador: 1,
    nombreCreador: 'Carlos Ríos',
    tipoCreador: 'TUTOR',
    permitirPublicaciones: !cerrado,
    cuposDisponibles: 19,
    mensaje: null,
  };
  const tema = {
    idTema: 21,
    idGrupo: 7,
    nombre: 'Derivadas',
    descripcion: 'Practiquemos juntos.',
    idCreador: 1,
    fechaCreacion: fecha,
  };
  const deck = {
    idMazo: 40,
    idAutor: 1,
    autor: 'Carlos Ríos',
    titulo: 'Derivadas esenciales',
    descripcion: 'Repaso de Cálculo.',
    estado: 'PUBLICADO',
    cantidadTarjetas: 2,
    fechaCreacion: fecha,
  };
  return {
    usuarios,
    usuario: usuarios[estudiante ? 2 : 1],
    grupo,
    grupos: [
      grupo,
      ...Array.from({ length: grupos - 1 }, (_, i) => ({
        ...grupo,
        idGrupo: 100 + i,
        nombre: `Grupo adicional ${i + 1}`,
      })),
    ],
    temas: [tema],
    solicitudes: [],
    sesiones: [],
    fallarCancelarSesion: 0,
    mazos: mazo ? [deck] : [],
    tarjetas: mazo
      ? {
          40: [
            { idTarjeta: 51, pregunta: '¿Cuál es la derivada de x²?', respuesta: '2x', orden: 1 },
            {
              idTarjeta: 52,
              pregunta: '¿Cuál es la derivada de sen(x)?',
              respuesta: 'cos(x)',
              orden: 2,
            },
          ],
        }
      : {},
    publicaciones: mazo
      ? [
          {
            idCompartido: 60,
            idGrupo: 7,
            idTema: 21,
            nombreTema: 'Derivadas',
            idMazo: 40,
            fechaCompartido: fecha,
          },
        ]
      : [],
    materiales: Array.from({ length: materiales }, (_, i) => ({
      idMaterial: 100 + i,
      idGrupo: 7,
      idTema: 21,
      nombreTema: 'Derivadas',
      idAutor: 1,
      autor: 'Carlos Ríos',
      nombreArchivo: `Guía ${i + 1}.pdf`,
      tipoArchivo: 'application/pdf',
      tamanoArchivo: 1024,
      fechaPublicacion: fecha,
    })),
    progreso: {},
    llamadas: [],
    fallarTema: 0,
    fallarProgreso: 0,
    fallarEliminar: 0,
  };
}
function progreso(s, id) {
  const tarjetas = s.tarjetas[id] ?? [];
  const estados = s.progreso[`${s.usuario.idUsuario}:${id}`] ?? {};
  const vistas = tarjetas.filter((t) => estados[t.idTarjeta]?.vista).length;
  return {
    idMazo: id,
    totalTarjetas: tarjetas.length,
    tarjetasVistas: vistas,
    tarjetasAprendidas: tarjetas.filter((t) => estados[t.idTarjeta]?.aprendida).length,
    porcentajeRevisado: tarjetas.length ? (vistas * 100) / tarjetas.length : 0,
    completado: tarjetas.length > 0 && vistas === tarjetas.length,
    idSiguienteTarjeta: tarjetas.find((t) => !estados[t.idTarjeta]?.vista)?.idTarjeta ?? null,
    tarjetas: tarjetas.map((t) => ({
      idTarjeta: t.idTarjeta,
      vista: false,
      aprendida: false,
      fechaUltimaPractica: null,
      ...estados[t.idTarjeta],
    })),
  };
}
async function instalarApi(context, s) {
  await context.route('**/api/**', async (route) => {
    const req = route.request(),
      url = new URL(req.url()),
      path = url.pathname.replace(/^\/api/, ''),
      method = req.method();
    const body = req.postData() ?? '';
    let json = null;
    try {
      json = JSON.parse(body);
    } catch {}
    s.llamadas.push({
      method,
      path,
      query: url.search,
      body: json ?? body,
      authorization: req.headers().authorization,
      contentType: req.headers()['content-type'],
    });
    const responder = (data, status = 200) =>
      route.fulfill({
        status,
        headers: {
          'content-type': 'application/json',
          'access-control-allow-origin': '*',
          'access-control-allow-headers': 'authorization,content-type',
          'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        },
        body: status === 204 ? '' : JSON.stringify(data),
      });
    const operacion = (data) => responder({ mensaje: 'Operación completada', datos: data });
    const error = () => responder({ mensaje: 'Fallo temporal de prueba' }, 503);
    if (method === 'OPTIONS') return responder(null, 204);
    if (path === '/auth/login') {
      const payload = Buffer.from(
        JSON.stringify({
          sub: String(s.usuario.idUsuario),
          exp: Math.floor(Date.now() / 1000) + 3600,
        }),
      ).toString('base64url');
      return responder({
        ...s.usuario,
        accessToken: `eyJhbGciOiJIUzI1NiJ9.${payload}.firma-de-prueba`,
        tokenType: 'Bearer',
        expiresIn: 3600,
      });
    }
    if (path === '/auth/me') return responder(s.usuario);
    if (
      path === '/grupos/mis-grupos' ||
      path === '/grupos' ||
      path === '/grupos/buscar' ||
      path === '/grupos/filtrar'
    )
      return responder(
        pagina(
          s.grupos,
          Number(url.searchParams.get('page') ?? 0),
          Number(url.searchParams.get('size') ?? 100),
        ),
      );
    if (path === '/grupos/7') return responder(s.grupo);
    if (path === '/grupos/solicitudes' && method === 'GET')
      return responder(pagina(s.solicitudes, Number(url.searchParams.get('page') ?? 0), 100));
    if (path === '/grupos/7/solicitudes' && method === 'POST') {
      const solicitud = { idSolicitud: 90, idGrupo: 7, estado: 'PENDIENTE', mensaje: 'Solicitud enviada' };
      s.solicitudes.push(solicitud);
      return responder(solicitud, 201);
    }
    if (path === '/grupos/7/sesiones') {
      if (method === 'GET') return responder(s.sesiones.filter((item) => item.estado === 'PROGRAMADA'));
      const nueva = { ...json, idSesion: 100 + s.sesiones.length, idGrupo: 7, estado: 'PROGRAMADA' };
      s.sesiones.push(nueva);
      return responder(nueva, 201);
    }
    const sesionMatch = path.match(/^\/grupos\/7\/sesiones\/(\d+)(\/cancelar)?$/);
    if (sesionMatch) {
      const actual = s.sesiones.find((item) => item.idSesion === Number(sesionMatch[1]));
      if (sesionMatch[2]) {
        if (s.fallarCancelarSesion > 0) { s.fallarCancelarSesion--; return error(); }
        actual.estado = 'CANCELADA';
      } else Object.assign(actual, json);
      return responder(actual);
    }
    if (path === '/grupos/7/integrantes')
      return responder(
        Object.values(s.usuarios).map((u) => ({
          idUsuario: u.idUsuario,
          nombreCompleto: `${u.nombres} ${u.apellidos}`,
          correo: u.correo,
          tipoUsuario: u.tipoUsuario,
          administrador: u.idUsuario === 1,
        })),
      );
    if (path === '/grupos/7/temas') {
      if (method === 'GET') return responder(s.temas);
      if (s.fallarTema > 0) {
        s.fallarTema--;
        return error();
      }
      const t = {
        idTema: 22 + s.temas.length,
        idGrupo: 7,
        ...json,
        idCreador: s.usuario.idUsuario,
        fechaCreacion: fecha,
      };
      s.temas.push(t);
      return responder(t, 201);
    }
    let match = path.match(/^\/grupos\/7\/temas\/(\d+)$/);
    if (match && method === 'PATCH') {
      const t = s.temas.find((t) => t.idTema === Number(match[1]));
      Object.assign(t, json);
      return responder(t);
    }
    if (path === '/grupos/7/materiales') {
      if (method === 'GET') {
        const todos = s.materiales.filter(
            (m) =>
              !url.searchParams.has('idTema') ||
              m.idTema === Number(url.searchParams.get('idTema')),
          ),
          page = Number(url.searchParams.get('page') ?? 0),
          size = Number(url.searchParams.get('size') ?? 10);
        return responder({
          contenido: todos.slice(page * size, (page + 1) * size),
          pagina: page,
          tamano: size,
          totalElementos: todos.length,
          totalPaginas: Math.ceil(todos.length / size),
        });
      }
      const idTema = body.match(/name="idTema"\r\n\r\n(\d+)/)?.[1];
      const nuevos = [...body.matchAll(/name="archivos"; filename="([^"]+)"/g)].map((m, i) => ({
        idMaterial: 500 + s.materiales.length + i,
        idGrupo: 7,
        idTema: idTema ? Number(idTema) : null,
        nombreTema: s.temas.find((t) => t.idTema === Number(idTema))?.nombre ?? null,
        idAutor: s.usuario.idUsuario,
        autor: `${s.usuario.nombres} ${s.usuario.apellidos}`,
        nombreArchivo: m[1],
        tipoArchivo: 'application/pdf',
        tamanoArchivo: 1234,
        fechaPublicacion: fecha,
      }));
      s.materiales.push(...nuevos);
      return responder({ mensaje: 'Materiales publicados', materiales: nuevos }, 201);
    }
    match = path.match(/^\/grupos\/7\/materiales\/(\d+)(\/tema|\/descarga)?$/);
    if (match) {
      const material = s.materiales.find((m) => m.idMaterial === Number(match[1]));
      if (method === 'DELETE') {
        if (s.fallarEliminar > 0) {
          s.fallarEliminar--;
          return error();
        }
        s.materiales = s.materiales.filter((m) => m !== material);
        return responder(null, 204);
      }
      if (match[2] === '/tema') {
        Object.assign(material, json, {
          nombreTema: s.temas.find((t) => t.idTema === json.idTema)?.nombre ?? null,
        });
        return responder(material);
      }
      if (match[2] === '/descarga')
        return responder({
          url: 'https://storage.example.test/guia.pdf?firma=prueba',
          venceEn: '2026-11-04T09:00:00Z',
        });
    }
    const mazoActual = (id) => {
      const m = s.mazos.find((m) => m.idMazo === id);
      if (m) m.cantidadTarjetas = (s.tarjetas[id] ?? []).length;
      return m;
    };
    const publicaciones = () =>
      s.publicaciones.map((p) => {
        const { idMazo, ...resto } = p;
        return { ...resto, mazo: mazoActual(idMazo) };
      });
    if (path === '/mazos') {
      if (method === 'GET')
        return responder(
          s.mazos.filter((m) => m.idAutor === s.usuario.idUsuario).map((m) => mazoActual(m.idMazo)),
        );
      const m = {
        idMazo: 40 + s.mazos.length,
        idAutor: s.usuario.idUsuario,
        autor: `${s.usuario.nombres} ${s.usuario.apellidos}`,
        ...json,
        estado: 'BORRADOR',
        cantidadTarjetas: 0,
        fechaCreacion: fecha,
      };
      s.mazos.push(m);
      s.tarjetas[m.idMazo] = [];
      return operacion(m);
    }
    match = path.match(/^\/mazos\/(\d+)(?:\/(.*))?$/);
    if (match) {
      const id = Number(match[1]),
        m = mazoActual(id),
        accion = match[2] ?? '';
      if (!m) return responder({ mensaje: 'Mazo no encontrado' }, 404);
      if (!accion) {
        if (method === 'PUT') {
          Object.assign(m, json);
          return operacion(m);
        }
        return responder({ mazo: m, tarjetas: s.tarjetas[id] });
      }
      if (accion === 'progreso') return responder(progreso(s, id));
      if (accion === 'publicaciones')
        return responder(
          m.estado === 'PUBLICADO' ? publicaciones().filter((p) => p.mazo.idMazo === id) : [],
        );
      if (accion === 'publicacion') {
        m.estado = 'BORRADOR';
        return operacion(m);
      }
      if (accion === 'tarjetas' && method === 'POST') {
        const t = {
          idTarjeta: 51 + s.tarjetas[id].length,
          ...json,
          orden: s.tarjetas[id].length + 1,
        };
        s.tarjetas[id].push(t);
        return operacion(t);
      }
      const tarjeta = accion.match(/^tarjetas\/(\d+)(\/progreso)?$/);
      if (tarjeta) {
        const tid = Number(tarjeta[1]);
        if (tarjeta[2]) {
          if (s.fallarProgreso > 0) {
            s.fallarProgreso--;
            return error();
          }
          const key = `${s.usuario.idUsuario}:${id}`;
          s.progreso[key] ??= {};
          s.progreso[key][tid] = {
            vista: true,
            aprendida: json.aprendida,
            fechaUltimaPractica: fecha,
          };
          return operacion(progreso(s, id));
        }
        if (method === 'DELETE') {
          s.tarjetas[id] = s.tarjetas[id].filter((t) => t.idTarjeta !== tid);
          return responder(null, 204);
        }
        const t = s.tarjetas[id].find((t) => t.idTarjeta === tid);
        Object.assign(t, json);
        return operacion(t);
      }
    }
    if (path === '/grupos/7/mazos' && method === 'GET')
      return responder(
        publicaciones().filter(
          (p) =>
            p.mazo.estado === 'PUBLICADO' &&
            (!url.searchParams.has('idTema') ||
              p.idTema === Number(url.searchParams.get('idTema'))),
        ),
      );
    match = path.match(/^\/grupos\/7\/mazos\/(\d+)$/);
    if (match) {
      const id = Number(match[1]),
        m = mazoActual(id);
      if (method === 'GET') return responder({ mazo: m, tarjetas: s.tarjetas[id] });
      if (method === 'DELETE') {
        s.publicaciones = s.publicaciones.filter((p) => p.idMazo !== id);
        return responder(null, 204);
      }
      m.estado = 'PUBLICADO';
      const p = {
        idCompartido: 60 + s.publicaciones.length,
        idGrupo: 7,
        idTema: json.idTema,
        nombreTema: s.temas.find((t) => t.idTema === json.idTema).nombre,
        idMazo: id,
        fechaCompartido: fecha,
      };
      s.publicaciones.push(p);
      return operacion(publicaciones().find((p) => p.mazo.idMazo === id));
    }
    // Otras pantallas del layout son ajenas al alcance de estas pruebas.
    return responder([], 200);
  });
}
module.exports = { crearEstado, instalarApi };
