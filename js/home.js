/* Home: aparición al hacer scroll, contadores y cargadores destacados */
(function () {
  const $ = id => document.getElementById(id);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Precios con IVA incluido (21 %)
  const eurIva = v => { const n = Math.round(v * 121) / 100, d = Math.abs(n % 1) > 0.004 ? 2 : 0, [i, c] = n.toFixed(d).split("."); return i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (c ? "," + c : "") + "\u00a0€"; };

  /* ---------- Escaparate del hero: precios y número de cargadores desde el catálogo ---------- */
  (function () {
    const D = window.EVX_CATALOGO; if (!D) return;
    document.querySelectorAll(".sc-item[data-id]").forEach(a => {
      const m = D.modelos.find(x => x.id === a.dataset.id), em = a.querySelector("[data-price]");
      if (m && em) em.innerHTML = m.desde ? '<span class="eq">Equipo </span>desde ' + eurIva(m.desde) + ' <span class="pl">IVA incl.</span>' : "Precio a consultar";
    });
    const n = D.modelos.filter(m => !m.tags.includes("accesorio")).length, c = document.querySelector("[data-count-ch]");
    if (c && n) c.textContent = `Ver los ${n} cargadores`;
  })();

  /* ---------- Aparición suave al hacer scroll (el estado en reposo ya es visible) ---------- */
  const els = [...document.querySelectorAll(".rv")];
  if ("IntersectionObserver" in window && !reduce) {
    const vh = innerHeight;
    els.forEach(el => { if (el.getBoundingClientRect().top > vh * 0.95) el.classList.add("pre"); });
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.remove("pre"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -8% 0px" });
    els.forEach(el => io.observe(el));
  }

  /* ---------- Línea de tiempo y contadores ---------- */
  const tl = $("tl");
  const once = (el, fn) => {
    if (!el) return;
    if (!("IntersectionObserver" in window) || reduce) return fn();
    const o = new IntersectionObserver(es => { if (es[0].isIntersecting) { fn(); o.disconnect(); } }, { threshold: .35 });
    o.observe(el);
  };
  once(tl, () => tl.classList.add("in"));
  document.querySelectorAll("[data-count]").forEach(el => {
    const to = +el.dataset.count;
    once(el, () => {
      if (reduce) return;
      const t0 = performance.now(), d = 1200;
      const step = t => { const k = Math.min(1, (t - t0) / d); el.textContent = "+" + Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
    });
  });

  /* ---------- Mantenimiento: preselecciona el formulario ---------- */
  const setMant = () => { const u = document.getElementById("ubicacion"); if (u) u.value = "Mantenimiento o reparación de un cargador"; };
  const mants = document.querySelectorAll("[data-mant]");
  mants.forEach(a => a.addEventListener("click", setMant));
  // Enlace del menú: index.html#mantenimiento lleva al formulario con la opción ya elegida
  const goMant = () => { if (location.hash !== "#mantenimiento") return; setMant(); const c = $("contacto"); if (c) c.scrollIntoView(); };
  addEventListener("hashchange", goMant);
  addEventListener("load", () => setTimeout(goMant, 150));

  /* ---------- Cargadores destacados ---------- */
  const box = $("featured"), D = window.EVX_CATALOGO;
  if (box && D) {
    const ids = (box.dataset.ids || "").split(",");
    box.innerHTML = ids.map(id => D.modelos.find(m => m.id === id)).filter(Boolean).map(m => {
      const f = m.imagen, src = (window.EVX_IMG && window.EVX_IMG[f]) || `img/productos/${f}`;
      return `<a class="fcard rv" href="catalogo.html#p-${m.id}">
        <span class="im">${f ? `<img src="${src}" alt="${m.marca} ${m.modelo}" loading="lazy" width="500" height="500">` : ""}</span>
        <span class="tx"><span class="br">${m.marca}</span><h3>${m.modelo}</h3>
        <span class="pr"><span>Equipo desde</span>${m.desde ? `<b>${eurIva(m.desde)} <small>IVA incl.</small></b>` : "<b>Consultar</b>"}</span></span></a>`;
    }).join("");
    const n = D.modelos.filter(m => !m.tags.includes("accesorio")).length;
    const cta = document.querySelector(".feat-cta a"); if (cta) cta.textContent = cta.textContent.replace("{N}", n);
  }
})();
