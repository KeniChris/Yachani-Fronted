const elementosRevelar = document.querySelectorAll("#quienes-somos .reveal");

if ("IntersectionObserver" in window) {
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visible");
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  elementosRevelar.forEach((elemento) => observador.observe(elemento));
} else {
  elementosRevelar.forEach((elemento) => elemento.classList.add("visible"));
}
