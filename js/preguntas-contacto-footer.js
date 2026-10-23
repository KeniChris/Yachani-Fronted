// Preguntas frecuentes
const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const button = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  button.addEventListener("click", () => {
    const estabaAbierta = item.classList.contains("open");

    // Cierra todas las preguntas.
    faqItems.forEach((otroItem) => {
      otroItem.classList.remove("open");

      const otraRespuesta = otroItem.querySelector(".faq-answer");
      otraRespuesta.style.maxHeight = null;
    });

    // Abre únicamente la pregunta seleccionada.
    if (!estabaAbierta) {
      item.classList.add("open");
      answer.style.maxHeight = `${answer.scrollHeight}px`;
    }
  });
});

// Formulario de contacto
const formulario = document.getElementById("contactForm");
const mensajeFormulario = document.getElementById("formMessage");

formulario.addEventListener("submit", (event) => {
  event.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const asunto = document.getElementById("asunto").value;
  const mensaje = document.getElementById("mensaje").value.trim();

  const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);

  // Elimina los mensajes anteriores.
  mensajeFormulario.className = "form-message";

  // Comprueba que todos los campos estén completos.
  if (!nombre || !correo || !asunto || !mensaje) {
    mensajeFormulario.textContent =
      "Por favor, completa todos los campos antes de enviar.";

    mensajeFormulario.classList.add("error");
    return;
  }

  // Comprueba que el correo tenga un formato válido.
  if (!correoValido) {
    mensajeFormulario.textContent =
      "Ingresa un correo válido para poder responderte.";

    mensajeFormulario.classList.add("error");
    return;
  }

  // Muestra el mensaje de confirmación.
  mensajeFormulario.textContent =
    "¡Mensaje enviado correctamente! Te responderemos pronto.";

  mensajeFormulario.classList.add("success");

  // Limpia los campos después de enviar.
  formulario.reset();
});