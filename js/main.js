(() => {
  const header = document.getElementById("header");
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");

  // Header: fondo sólido al hacer scroll
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 60);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Menú móvil
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    header.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  burger.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

  // Navegación: centra el contenido de cada sección en la pantalla (debajo del header)
  const HEADER_H = 70;
  const docTop = (el) => {
    let t = 0;
    for (let n = el; n; n = n.offsetParent) t += n.offsetTop;
    return t;
  };
  const scrollToSection = (section) => {
    if (section.id === "inicio") return window.scrollTo({ top: 0, behavior: "smooth" });
    // Bloque de contenido real: desde el primer al último hijo visible (sin decoraciones)
    const kids = [...section.children].filter((c) => !c.classList.contains("spots") && c.offsetHeight);
    const top = docTop(kids[0]);
    const last = kids[kids.length - 1];
    const height = docTop(last) + last.offsetHeight - top;
    const avail = window.innerHeight - HEADER_H;
    const target = height <= avail - 40
      ? top - HEADER_H - (avail - height) / 2
      : top - HEADER_H - 24;
    window.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
  };
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (ev) => {
      const section = document.getElementById(a.getAttribute("href").slice(1));
      if (!section) return;
      ev.preventDefault();
      scrollToSection(section);
      history.replaceState(null, "", a.getAttribute("href"));
    });
  });

  // Video del hero: asegurar reproducción automática sin audio
  const video = document.querySelector(".hero__video");
  if (video) {
    video.muted = true;
    const play = video.play();
    if (play) play.catch(() => {});
  }

  // Animaciones al aparecer
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("is-visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  // Lightbox de galería
  const lightbox = document.getElementById("lightbox");
  const lbImg = lightbox.querySelector("img");
  const closeLb = () => { lightbox.hidden = true; };
  document.querySelectorAll(".gallery__item").forEach((item) => {
    item.addEventListener("click", (ev) => {
      ev.preventDefault();
      lbImg.src = item.getAttribute("href");
      lbImg.alt = item.querySelector("img").alt;
      lightbox.hidden = false;
    });
  });
  lightbox.addEventListener("click", (ev) => { if (ev.target !== lbImg) closeLb(); });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") closeLb(); });

  // Formulario: abre el correo con los datos prellenados
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.nombre || !d.email) {
      note.textContent = "Por favor completa tu nombre y email.";
      return;
    }
    const body = [
      `Nombre: ${d.nombre}`,
      `Email: ${d.email}`,
      `Teléfono: ${d.telefono || "-"}`,
      `Tipo de evento: ${d.evento}`,
      `Fecha: ${d.fecha || "-"}`,
      `Lugar: ${d.lugar || "-"}`,
      "",
      d.mensaje || "",
    ].join("\n");
    const subject = `Cotización Deluxxe Show - ${d.evento}`;
    window.location.href = `mailto:deluxxeshow@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.textContent = "¡Gracias! Se abrirá tu correo para enviar la solicitud.";
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
