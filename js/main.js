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
      // Los botones "Quiero este show" dejan el cursor listo en el formulario
      if (a.closest(".section__cta") || a.closest(".heart")) {
        setTimeout(() => form.querySelector("input").focus({ preventScroll: true }), 900);
      }
    });
  });

  // Video del hero: asegurar reproducción automática sin audio
  const video = document.querySelector(".hero__video");
  if (video) {
    video.muted = true;
    const play = video.play();
    if (play) play.catch(() => {});
  }

  // Video de la galería: se reproduce con sonido al llegar a la sección.
  // Los navegadores solo permiten sonido automático después de que el visitante
  // interactúa con la página; si aún no lo hizo, arranca sin sonido y el botón
  // (o el primer clic/toque en cualquier parte) lo activa.
  const gVideo = document.getElementById("gallery-video");
  const soundBtn = document.getElementById("sound-toggle");
  let gVisible = false;
  let userMuted = false;
  const syncSoundBtn = () => {
    const on = !gVideo.muted;
    soundBtn.setAttribute("aria-pressed", String(on));
    soundBtn.setAttribute("aria-label", on ? "Silenciar" : "Activar sonido");
  };
  const playGallery = () => {
    gVideo.muted = userMuted;
    gVideo.play().catch(() => {
      gVideo.muted = true;
      gVideo.play().catch(() => {});
    }).finally(syncSoundBtn);
  };
  new IntersectionObserver(([entry]) => {
    gVisible = entry.isIntersecting;
    if (gVisible) playGallery(); else gVideo.pause();
  }, { threshold: 0.45 }).observe(gVideo);
  soundBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    gVideo.muted = !gVideo.muted;
    userMuted = gVideo.muted;
    if (gVideo.paused) gVideo.play().catch(() => {});
    syncSoundBtn();
  });
  const unlockSound = (ev) => {
    if (soundBtn.contains(ev.target)) return;
    if (gVisible && gVideo.muted && !userMuted) {
      gVideo.muted = false;
      syncSoundBtn();
    }
  };
  ["pointerdown", "keydown", "touchend"].forEach((t) => document.addEventListener(t, unlockSound));
  gVideo.addEventListener("volumechange", syncSoundBtn);

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
  document.querySelectorAll("a.gallery__item").forEach((item) => {
    item.addEventListener("click", (ev) => {
      ev.preventDefault();
      lbImg.src = item.getAttribute("href");
      lbImg.alt = item.querySelector("img").alt;
      lightbox.hidden = false;
    });
  });
  lightbox.addEventListener("click", (ev) => { if (ev.target !== lbImg) closeLb(); });
  document.addEventListener("keydown", (ev) => { if (ev.key === "Escape") closeLb(); });

  // Formulario: arma el mensaje y abre WhatsApp con todo prellenado
  const WHATSAPP = "525533045300";
  const form = document.getElementById("contact-form");
  const note = document.getElementById("form-note");
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.nombre.trim()) {
      note.textContent = "Por favor completa tu nombre.";
      form.elements.nombre.focus();
      return;
    }
    const fecha = d.fecha ? d.fecha.split("-").reverse().join("/") : "";
    const details = [
      `*Nombre:* ${d.nombre.trim()}`,
      d.email && `*Email:* ${d.email}`,
      d.telefono && `*Teléfono:* ${d.telefono}`,
      `*Tipo de evento:* ${d.evento}`,
      fecha && `*Fecha:* ${fecha}`,
      d.lugar && `*Lugar:* ${d.lugar}`,
    ].filter(Boolean);
    const text = ["¡Hola Deluxxe! Quiero cotizar un show 🎤✨", "", ...details];
    if (d.mensaje.trim()) text.push("", d.mensaje.trim());
    const url = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text.join("\n"))}`;
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url;
    note.textContent = "¡Gracias! Se abrirá WhatsApp con tu mensaje listo para enviar.";
  });

  document.getElementById("year").textContent = new Date().getFullYear();
})();
