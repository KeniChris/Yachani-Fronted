"use strict";

// Leicy: cambia solo esta dirección cuando la app web esté publicada.
// Usa la URL que entregue el equipo del frontend, incluida su ruta de acceso.
// Ejemplo local: "http://localhost:4200". No se añade una ruta /login inventada.
(() => {
  const APP_WEB_URL = "";

  const CONTENIDO_POR_PERFIL = {
    "estudiante": {
        "label": "UN BUEN GRUPO CAMBIA CÓMO APRENDES",
        "heading": "Aprende a tu ritmo.",
        "accent": "Avanza en equipo.",
        "description": "Encuentra tu grupo por curso o tema, comparte materiales y resuelve dudas con compañeros y tutores que entienden lo que estás aprendiendo.",
        "cta": "Encontrar mi grupo",
        "ctaNote": "Tu próximo paso empieza en la app web de Yachani.",
        "value1": "Conecta",
        "detail1": "con tus compañeros",
        "value2": "Comparte",
        "detail2": "lo que aprendes",
        "value3": "Avanza",
        "detail3": "con tu comunidad",
        "aiTitle": "Conexiones con ayuda de IA",
        "aiDescription": "Encuentra afinidad para estudiar",
        "sceneLabel": "UN TEMA EN COMÚN. MÁS IDEAS.",
        "cardTitle": "Las dudas se resuelven mejor juntos.",
        "cardDescription": "Un espacio para repasar, preguntar y compartir distintas formas de entender.",
        "community": "Compañeros que aprenden contigo",
        "chatLabel": "Una pregunta abre la conversación",
        "chatMessage": "¿Repasamos los diagramas de clases hoy?",
        "flashLabel": "UN CONCEPTO A LA VEZ",
        "flashTitle": "Entender. Practicar. Recordar."
    },
    "tutor": {
        "label": "LO QUE SABES PUEDE AYUDAR A ALGUIEN MÁS",
        "heading": "Enseña a tu ritmo.",
        "accent": "Crece en equipo.",
        "description": "Crea tu grupo de estudio, organiza tus sesiones y acompaña a otros estudiantes con tu propia forma de enseñar. Tu conocimiento también puede abrir caminos.",
        "cta": "Empezar como tutor",
        "ctaNote": "Tu próximo paso empieza en la app web de Yachani.",
        "value1": "Guía",
        "detail1": "con tu propio estilo",
        "value2": "Organiza",
        "detail2": "tus grupos de estudio",
        "value3": "Comparte",
        "detail3": "tu conocimiento",
        "aiTitle": "Organiza ideas con ayuda de IA",
        "aiDescription": "Da forma al próximo repaso",
        "sceneLabel": "TU CONOCIMIENTO PUEDE SUMAR.",
        "cardTitle": "Una explicación puede cambiarlo todo.",
        "cardDescription": "Guía el repaso y ayuda a tu grupo a conectar las ideas, paso a paso.",
        "community": "Una comunidad que aprende contigo",
        "chatLabel": "Tú propones. El grupo participa.",
        "chatMessage": "Hoy practicamos diagramas de clases. ¿Empezamos?",
        "flashLabel": "REFUERZA LO QUE ENSEÑAS",
        "flashTitle": "Explicar. Practicar. Acompañar."
    }
};

  function iniciarLanding() {
    const hero = document.querySelector("[data-yl-inicio]");
    const navbar = document.querySelector("[data-yl-navbar]");
    if (!hero || !navbar) return;

    const botonMenu = navbar.querySelector("[data-yl-menu]");
    const vistaMovil = window.matchMedia("(max-width: 1100px)");
    const estadoApp = hero.querySelector("#acceso-app");
    const perfilInicial = hero.dataset.perfil === "tutor" ? "tutor" : "estudiante";

    // El selector cambia la presentación; no cambia el rol de una cuenta real.
    function cambiarPerfil(perfil) {
      const perfilValido = perfil === "tutor" ? "tutor" : "estudiante";
      const contenido = CONTENIDO_POR_PERFIL[perfilValido];
      hero.dataset.perfil = perfilValido;

      hero.querySelectorAll("[data-yl-text]").forEach((elemento) => {
        const clave = elemento.dataset.ylText;
        if (Object.hasOwn(contenido, clave)) elemento.textContent = contenido[clave];
      });

      hero.querySelectorAll("[data-yl-perfil]").forEach((enlace) => {
        const activo = enlace.dataset.ylPerfil === perfilValido;
        if (activo) enlace.setAttribute("aria-current", "page");
        else enlace.removeAttribute("aria-current");
      });

      document.title = perfilValido === "tutor"
        ? "Yachani | Comparte lo que sabes"
        : "Yachani | Aprende y avanza en equipo";

      hero.dispatchEvent(new CustomEvent("yachani:perfil-cambiado", {
        bubbles: true, detail: { perfil: perfilValido }
      }));
    }

    // Permite abrir enlaces directos: ?perfil=estudiante o ?perfil=tutor.
    function perfilDeLaDireccion() {
      const parametro = new URLSearchParams(window.location.search).get("perfil");
      return parametro === "estudiante" || parametro === "tutor"
        ? parametro
        : perfilInicial;
    }

    hero.querySelectorAll("[data-yl-perfil]").forEach((enlace) => {
      enlace.addEventListener("click", (event) => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        const perfil = enlace.dataset.ylPerfil;
        cambiarPerfil(perfil);

        // El cambio sigue funcionando aunque el navegador limite el historial local.
        try {
          const direccion = new URL(window.location.href);
          direccion.searchParams.set("perfil", perfil);
          window.history.pushState(null, "", direccion);
        } catch { /* La presentación ya se actualizó. */ }
      });
    });

    window.addEventListener("popstate", () => cambiarPerfil(perfilDeLaDireccion()));
    cambiarPerfil(perfilDeLaDireccion());

    // El menú móvil mantiene aria-expanded sincronizado con su estado visual.
    function mostrarMenu(abierto) {
      navbar.dataset.menuAbierto = String(abierto);
      botonMenu.setAttribute("aria-expanded", String(abierto));
      botonMenu.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
    }

    botonMenu.addEventListener("click", () => {
      mostrarMenu(navbar.dataset.menuAbierto !== "true");
    });

    navbar.querySelectorAll(".yl-nav-link").forEach((enlace) => {
      enlace.addEventListener("click", () => {
        mostrarMenu(false);
        navbar.querySelectorAll(".yl-nav-link").forEach((otro) => otro.removeAttribute("aria-current"));
        enlace.setAttribute("aria-current", "location");
      });
    });

    document.addEventListener("click", (event) => {
      if (!navbar.contains(event.target)) mostrarMenu(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navbar.dataset.menuAbierto === "true") {
        mostrarMenu(false);
        botonMenu.focus();
      }
    });

    vistaMovil.addEventListener("change", () => mostrarMenu(false));

    // Los dos llamados a la acción llevan a la app existente, sin crear un login aquí.
    function direccionDeApp() {
      if (!APP_WEB_URL.trim()) return null;
      try {
        const url = new URL(APP_WEB_URL.trim());
        return ["https:", "http:"].includes(url.protocol) ? url.href : null;
      } catch { return null; }
    }

    const direccion = direccionDeApp();
    document.querySelectorAll("[data-yl-app-link]").forEach((enlace) => {
      if (direccion) {
        enlace.href = direccion;
        return;
      }

      // Estado temporal mientras el equipo define la dirección de la app.
      enlace.addEventListener("click", (event) => {
        event.preventDefault();
        estadoApp.hidden = false;
        estadoApp.textContent = "El acceso a la app web estará disponible pronto. Mientras tanto, conoce cómo funciona Yachani.";
        if (vistaMovil.matches) {
          const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          estadoApp.scrollIntoView({ block: "nearest", behavior: reducirMovimiento ? "auto" : "smooth" });
        }
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciarLanding, { once: true });
  } else {
    iniciarLanding();
  }
})();
