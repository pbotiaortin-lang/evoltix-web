/* Navegación, datos de contacto y formulario de presupuesto */
(function () {
  const C = window.EVX_CONFIG || {};
  const $ = (s, el = document) => el.querySelector(s);
  const fmtTel = t => !t ? "" : t.startsWith("34") && t.length === 11 ? t.slice(2).replace(/^(\d{3})(\d{2})(\d{2})(\d{2})$/, "$1 $2 $3 $4") : "+" + t;

  document.addEventListener("DOMContentLoaded", () => {
    // Menú móvil a pantalla completa
    const mnav = $("#mnav"), mbtn = $(".mainbar .menu-btn");
    const setM = o => {
      if (!mnav) return;
      const was = mnav.classList.contains("open");
      mnav.classList.toggle("open", o); mbtn && mbtn.setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : "";
      // El foco entra en el menú al abrir y vuelve al botón al cerrar
      if (o && !was) { const c = mnav.querySelector("[data-close]"); c && c.focus(); }
      if (!o && was && mbtn) mbtn.focus();
    };
    if (mbtn) mbtn.addEventListener("click", () => setM(true));
    if (mnav) mnav.addEventListener("click", e => { if (e.target.closest("[data-close]") || e.target.closest("a")) setM(false); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape") {
        setM(false);
        document.querySelectorAll(".dd-menu.open").forEach(m => { m.classList.remove("open"); const b = m.parentElement.querySelector("button"); b.setAttribute("aria-expanded", false); b.focus(); });
      }
      // Tab no sale del menú móvil mientras está abierto
      if (e.key === "Tab" && mnav && mnav.classList.contains("open")) {
        const f = [...mnav.querySelectorAll("a[href],button")].filter(el => el.offsetParent !== null);
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    // Desplegable "Soluciones" (clic y teclado; en escritorio también al pasar el ratón)
    document.querySelectorAll(".dd").forEach(dd => {
      const b = dd.querySelector("button"), m = dd.querySelector(".dd-menu");
      b.addEventListener("click", () => { const o = !m.classList.contains("open"); m.classList.toggle("open", o); b.setAttribute("aria-expanded", o); });
      dd.addEventListener("mouseleave", () => { m.classList.remove("open"); b.setAttribute("aria-expanded", false); });
      dd.addEventListener("focusout", e => { if (!dd.contains(e.relatedTarget)) { m.classList.remove("open"); b.setAttribute("aria-expanded", false); } });
      m.addEventListener("click", () => { m.classList.remove("open"); b.setAttribute("aria-expanded", false); });
    });
    // Sombra de la barra al hacer scroll
    const mb = $("#mainbar");
    if (mb) { const f = () => mb.classList.toggle("scrolled", scrollY > 40); addEventListener("scroll", f, { passive: true }); f(); }
    // Huecos de fotos reales: si existe la foto, se muestra
    document.querySelectorAll("[data-photo]").forEach(el => {
      const img = new Image(); img.alt = el.textContent.replace(/^Foto real · /, "");
      img.onload = () => { el.innerHTML = ""; el.classList.add("has"); el.style.border = "none"; el.style.padding = "0"; el.appendChild(img); };
      img.src = el.dataset.photo;
    });
    // Datos de contacto desde config.js
    document.querySelectorAll("[data-email]").forEach(el => { el.textContent = C.email; if (el.tagName === "A") el.href = "mailto:" + C.email; });
    document.querySelectorAll("[data-zona]").forEach(el => el.textContent = C.zona);
    document.querySelectorAll("[data-tel]").forEach(el => {
      if (!C.telefono) { (el.closest("[data-tel-wrap]") || el).hidden = true; return; }
      el.textContent = fmtTel(C.telefono); if (el.tagName === "A") el.href = "tel:+" + C.telefono;
      const w = el.closest("a[data-tel-wrap]"); if (w) w.href = "tel:+" + C.telefono;
    });
    if (C.whatsapp) {
      const a = document.createElement("a");
      a.className = "wa"; a.href = "https://wa.me/" + C.whatsapp + "?text=" + encodeURIComponent("Hola, quiero información sobre un cargador para coche eléctrico.");
      a.target = "_blank"; a.rel = "noopener"; a.setAttribute("aria-label", "Escríbenos por WhatsApp");
      a.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.6 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5.1-4.5-.1-.2-1.2-1.6-1.2-3.1s.8-2.2 1-2.5c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l2 .9c.3.1.5.2.5.3.1.2.1.8-.1 1.4Z"/></svg>';
      document.body.appendChild(a);
    }
    document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());
    // Uso desde enlaces de servicios
    document.querySelectorAll("[data-goto-uso]").forEach(a => a.addEventListener("click", () => window.EVX_setUso && window.EVX_setUso(a.dataset.gotoUso)));
    initForm();
  });
  // re-scroll: al llegar con #ancla desde otra página, recolocar cuando ya han cargado imágenes y bloques dinámicos
  addEventListener("load", () => {
    const id = location.hash.slice(1);
    if (!id || id.startsWith("p-") || id.startsWith("uso-")) return;
    const t = document.getElementById(id);
    if (t) setTimeout(() => t.scrollIntoView({ block: "start", behavior: "instant" }), 150);
  });

  /* ---------- Formulario ---------- */
  let selected = null;

  window.EVX_selectProduct = function (p) {
    selected = p;
    const box = $("#sel-box"); if (!box) return;
    $("#sel-modelo").textContent = p.modelo + (p.version && !p.version.startsWith(p.modelo.split(" ").slice(1).join(" ")) ? " · " + p.version : "");
    $("#sel-detalle").textContent = [p.detalle, "Equipo: " + p.precio].filter(Boolean).join(" · ");
    box.classList.add("on");
    const r = document.querySelector(`input[name="modalidad"][value="${p.modalidad}"]`); if (r) r.checked = true;
    const sum = $("#suministro");
    if (sum && /Mono|Tri/.test(p.fases || "") && !/\//.test(p.fases)) sum.value = /Tri/.test(p.fases) ? "Trifásico" : "Monofásico";
    toggleInstall();
    setTimeout(() => { const n = $("#nombre"); n && n.focus({ preventScroll: true }); }, 600);
  };

  function toggleInstall() {
    const eq = ($('input[name="modalidad"]:checked') || {}).value === "equipo";
    document.querySelectorAll("[data-inst]").forEach(el => el.hidden = eq);
  }

  function initForm() {
    const form = $("#quote"); if (!form) return;
    form.addEventListener("change", e => { if (e.target.name === "modalidad") toggleInstall(); });
    const clear = $("#sel-clear");
    if (clear) clear.onclick = () => { selected = null; $("#sel-box").classList.remove("on"); };

    form.addEventListener("submit", async e => {
      e.preventDefault();
      const msg = $("#form-msg"); msg.className = "form-msg"; msg.innerHTML = "";
      if (!validate(form)) return;
      if (form._honey && form._honey.value) return;
      const v = id => (form.elements[id] ? form.elements[id].value.trim() : "");
      const modalidad = ($('input[name="modalidad"]:checked') || {}).value === "equipo" ? "Solo equipo (sin instalación)" : "Con instalación";
      const cargador = selected ? selected.modelo : "Sin elegir: quiere asesoramiento";

      // Campos que recibe el script de Google (formulario-google/Codigo.gs)
      const payload = {
        modalidad,
        cargador,
        version: selected ? [selected.version, selected.detalle].filter(Boolean).join(" · ") : "",
        referencia: selected && selected.codigo ? selected.codigo : "",
        precio: selected ? selected.precio : "",
        nombre: v("nombre"),
        telefono: v("telefono"),
        email: v("email"),
        municipio: v("municipio"),
        ubicacion: v("ubicacion"),
        suministro: modalidad.startsWith("Con") ? v("suministro") : "",
        distancia: modalidad.startsWith("Con") ? v("distancia") : "",
        solar: v("solar"),
        mensaje: v("mensaje"),
        pagina: location.pathname,
        _honey: form._honey ? form._honey.value : "",
        _t: Math.round(performance.now())
      };

      const btn = form.querySelector('button[type="submit"]'); btn.disabled = true; btn.textContent = "Enviando…";
      try {
        if (!C.formEndpoint) throw new Error("Formulario sin configurar");
        // text/plain evita la petición previa de CORS que Apps Script no admite
        const res = await fetch(C.formEndpoint, {
          method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload)
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || out.ok !== true) throw new Error(out.error || "Error de envío");
        msg.className = "form-msg ok";
        const via = [v("telefono") && "por teléfono", v("email") && "por correo"].filter(Boolean).join(" o ");
        msg.innerHTML = `<b>Solicitud enviada.</b> Gracias, ${escapeHtml(v("nombre"))}. Te contactaremos ${via} en menos de 24 horas laborables.`;
        form.reset(); selected = null; $("#sel-box").classList.remove("on"); toggleInstall();
      } catch (err) {
        const body = Object.entries(payload).filter(([k, val]) => !k.startsWith("_") && k !== "pagina" && val).map(([k, val]) => `${k[0].toUpperCase() + k.slice(1)}: ${val}`).join("\n");
        msg.className = "form-msg err";
        msg.innerHTML = `<b>No se ha podido enviar el formulario.</b> Comprueba tu conexión e inténtalo de nuevo, o escríbenos a <b>${escapeHtml(C.email)}</b> (<a href="mailto:${C.email}?subject=${encodeURIComponent("Solicitud de presupuesto")}&body=${encodeURIComponent(body)}">abrir correo con tus datos</a>).`;
      } finally { btn.disabled = false; btn.textContent = "Enviar solicitud"; }
    });
    toggleInstall();
  }
  /* Validación con mensajes en español junto a cada campo */
  const MSG = {
    nombre: "Escribe tu nombre.",
    telefono: "Escribe un teléfono de 9 cifras, por ejemplo 600 123 456.",
    email: "Escribe un correo válido, por ejemplo nombre@correo.es.",
    municipio: "Escribe tu municipio.",
    ubicacion: "Elige una opción.",
    rgpd: "Marca la casilla para que podamos contestarte."
  };
  function setErr(el, msg) {
    const box = el.closest(".f") || el.closest(".consent");
    let e = box && box.querySelector(".err-msg");
    if (msg) {
      if (!e && box) { e = document.createElement("p"); e.className = "err-msg"; e.id = el.id + "-err"; box.appendChild(e); }
      if (e) e.textContent = msg;
      el.setAttribute("aria-invalid", "true"); el.setAttribute("aria-describedby", el.id + "-err");
    } else { if (e) e.remove(); el.removeAttribute("aria-invalid"); el.removeAttribute("aria-describedby"); }
  }
  const CONTACTO = "Déjanos un teléfono o un correo para poder contestarte.";
  // Mensaje de error de un campo, o "" si está bien. Del teléfono y el correo basta con uno.
  function check(el) {
    if (el.type === "checkbox") return el.checked ? "" : MSG[el.id];
    const val = el.value.trim();
    if (el.id === "telefono" || el.id === "email") {
      const other = document.getElementById(el.id === "telefono" ? "email" : "telefono");
      if (!val) return other && other.value.trim() ? "" : CONTACTO;
      return el.checkValidity() ? "" : MSG[el.id];
    }
    return el.checkValidity() && val ? "" : MSG[el.id];
  }
  function validate(form) {
    let first = null;
    Object.keys(MSG).forEach(id => {
      const el = form.querySelector("#" + id); if (!el) return;
      const m = check(el);
      setErr(el, m); if (m && !first) first = el;
    });
    if (first) { first.focus(); return false; }
    return true;
  }
  // Al corregir un campo con error se revisa de nuevo; teléfono y correo se revisan juntos
  ["input", "change"].forEach(t => document.addEventListener(t, e => {
    const el = e.target; if (!el.getAttribute || !MSG[el.id]) return;
    if (el.getAttribute("aria-invalid")) setErr(el, check(el));
    if (el.id === "telefono" || el.id === "email") {
      const other = document.getElementById(el.id === "telefono" ? "email" : "telefono");
      if (other && other.getAttribute("aria-invalid")) setErr(other, check(other));
    }
  }));

  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
})();
