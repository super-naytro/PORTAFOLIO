

  // Efecto hover en los enlaces de navegación
  const enlaces = document.querySelectorAll('nav a');
  enlaces.forEach(enlace => {
    enlace.addEventListener('mouseenter', () => {
      enlace.style.transform = 'scale(1.08)';
      enlace.style.boxShadow = '0 2px 12px rgba(33,150,243,0.2)';
        enlace.style.textDecoration = 'underline';
        enlace.style.textDecorationColor = '#6a1b9a';
        enlace.style.textDecorationThickness = '3px';
    });
    enlace.addEventListener('mouseleave', () => {
      enlace.style.transform = 'scale(1)';
      enlace.style.boxShadow = 'none';
        enlace.style.textDecoration = 'none';
    });
  });

    // Ocultar/mostrar barra de navegación al hacer scroll
    let lastScroll = 0;
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      if (header) {
        if (currentScroll > lastScroll && currentScroll > 80) {
          header.style.transform = 'translateY(-100%)';
          header.style.transition = 'transform 0.4s';
        } else {
          header.style.transform = 'translateY(0)';
          header.style.transition = 'transform 0.4s';
        }
      }
      lastScroll = currentScroll;
    });

  // Animación de entrada para el contenido principal
  const main = document.querySelector('main');
  if (main) {
    main.style.opacity = 0;
    main.style.transform = 'translateY(30px)';
    setTimeout(() => {
      main.style.transition = 'opacity 1s, transform 1s';
      main.style.opacity = 1;
      main.style.transform = 'translateY(0)';
    }, 500);
  }

  // Efecto de botón pulsado
  const botones = document.querySelectorAll('button');
  botones.forEach(boton => {
    boton.addEventListener('mousedown', () => {
      boton.style.transform = 'scale(0.96)';
    });
    boton.addEventListener('mouseup', () => {
      boton.style.transform = 'scale(1)';
    });
  });

  // Efecto básico para formulario de contacto
  const form = document.getElementById("formContacto");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("Gracias por tu mensaje. Te responderé pronto 🚀");
      form.reset();
    });
  }
