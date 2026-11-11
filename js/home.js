/* Portada y páginas con destacados: precios del escaparate, cargadores destacados y atajo de mantenimiento */
(function () {
  const $ = id => document.getElementById(id);
  const D = window.EVX_CATALOGO;
  // Los datos del catálogo están sin IVA; en la web el precio principal es con IVA (21 %) y el sin IVA va al lado
  const eur = v => { const n = Math.round(v * 100) / 100, d = Math.abs(n % 1) > 0.004 ? 2 : 0, [i, c] = n.toFixed(d).split("."); return i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (c ? "," + c : "") + " €"; };
  const eurIva = v => eur(Math.round(v * 121) / 100);
  const priceHtml = m => m && m.desde
    ? `<b>desde ${eurIva(m.desde)}</b><small>IVA incluido · ${eur(m.desde)} sin IVA</small>`
    : "<b>Precio a consultar</b>";

  /* ---------- Escaparate del hero ---------- */
  if (D) {
    document.querySelectorAll("[data-shelf] [data-id]").forEach(a => {
      const m = D.modelos.find(x => x.id === a.dataset.id), em = a.querySelector("[data-price]");
      if (em) em.innerHTML = priceHtml(m);
    });
    const n = D.modelos.filter(m => !m.tags.includes("accesorio")).length;
    document.querySelectorAll("[data-count-ch]").forEach(c => { if (n) c.textContent = `Ver los ${n} cargadores`; });
  }

  /* ---------- Mantenimiento: preselecciona el formulario ---------- */
  const setMant = () => { const u = $("ubicacion"); if (u) u.value = "Mantenimiento o reparación de un cargador"; };
  document.querySelectorAll("[data-mant]").forEach(a => a.addEventListener("click", setMant));
  // index.html#mantenimiento lleva al formulario con la opción ya elegida
  const goMant = () => { if (location.hash !== "#mantenimiento") return; setMant(); const c = $("contacto"); if (c) c.scrollIntoView(); };
  addEventListener("hashchange", goMant);
  addEventListener("load", () => setTimeout(goMant, 150));

  /* ---------- Cargadores destacados ---------- */
  const box = $("featured");
  if (box && D) {
    const ids = (box.dataset.ids || "").split(",");
    box.innerHTML = ids.map(id => D.modelos.find(m => m.id === id)).filter(Boolean).map(m => {
      const f = m.imagen, src = (window.EVX_IMG && window.EVX_IMG[f]) || `img/productos/${f}`;
      return `<a class="fcard" href="catalogo.html#p-${m.id}">
        <span class="im">${f ? `<img src="${src}" alt="${m.marca} ${m.modelo}" loading="lazy" width="500" height="500">` : ""}</span>
        <span class="tx"><span class="br">${m.marca}</span><h3>${m.modelo}</h3>
        <span class="pr"><span>Equipo</span>${priceHtml(m)}</span></span></a>`;
    }).join("");
  }
})();
