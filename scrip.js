// Efecto básico para formulario de contacto
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formContacto");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Gracias por tu mensaje. Te responderé pronto 🚀");
      form.reset();
    });
  }
});
