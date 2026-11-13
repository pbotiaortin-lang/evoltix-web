/* Portada y páginas de servicio: precios «desde» del catálogo, barra de marcas, atajo de mantenimiento y destacados */
(function () {
  const $ = id => document.getElementById(id);
  const D = window.EVX_CATALOGO;
  // Los datos del catálogo están sin IVA; el precio principal se muestra con IVA (21 %)
  const eur = v => { const n = Math.round(v * 100) / 100, d = Math.abs(n % 1) > 0.004 ? 2 : 0, [i, c] = n.toFixed(d).split("."); return i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (c ? "," + c : "") + " €"; };
  const eurIva = v => eur(Math.round(v * 121) / 100);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const img = f => (window.EVX_IMG && window.EVX_IMG[f]) || `img/productos/${f}`;
  const model = id => D && D.modelos.find(m => m.id === id);

  /* ---------- Precios «desde» por uso, calculados del catálogo (mismas reglas que el filtro Uso) ---------- */
  if (D) {
    const isAcc = m => m.tags.includes("accesorio"), isExt = m => m.tags.includes("exterior");
    const tomas = m => { const s = new Set(); [m.tomas, ...m.versiones.map(v => v.tomas)].forEach(t => (String(t || "").match(/\d+/g) || []).forEach(n => s.add(n))); return s; };
    const inUso = (m, u) => u === "min" ? !isAcc(m) : u === "exterior" ? isExt(m) : u === "accesorio" ? isAcc(m) : !isAcc(m) && !isExt(m) && tomas(m).has(u);
    document.querySelectorAll("[data-price]").forEach(el => {
      const u = el.dataset.price.replace(/^uso:/, "");
      const ps = D.modelos.filter(m => inUso(m, u) && m.desde).map(m => m.desde);
      if (ps.length) el.textContent = "desde " + eurIva(Math.min(...ps));
    });
  }

  /* ---------- Barra de marcas: 6 marcas. Un logo opcional (Simon, Schneider Electric) solo se pide
     cuando su marca ya tiene modelos en el catálogo, y si no existe no se muestra ---------- */
  const BRANDS = [
    { n: "Circutor", f: "circutor-logo.png", w: 452, h: 111 },
    { n: "Wallbox", f: "wallbox-logo.png", w: 223, h: 52, c: "wallbox" },
    { n: "Orbis", f: "orbis-logo.png", w: 222, h: 70, c: "orbis" },
    { n: "V2C", f: "v2c-logo.png", w: 400, h: 173 },
    { n: "Simon", f: "simon-logo.png", opt: true },
    { n: "Schneider Electric", f: "schneider-logo.png", opt: true }
  ];
  const tracks = document.querySelectorAll("[data-brands]");
  if (tracks.length) {
    const hasModels = n => D && D.modelos.some(m => m.marca === n);
    const li = (b, hidden) => `<li${hidden ? ' aria-hidden="true"' : ""}><img src="img/marcas/${b.f}" alt="${hidden ? "" : esc(b.n)}"${b.w ? ` width="${b.w}" height="${b.h}"` : ""}${b.c ? ` class="${b.c}"` : ""} loading="lazy"></li>`;
    const probe = b => new Promise(ok => { const i = new Image(); i.onload = () => { b.w = i.naturalWidth; b.h = i.naturalHeight; ok(b); }; i.onerror = () => ok(null); i.src = "img/marcas/" + b.f; });
    const fixed = BRANDS.filter(b => !b.opt);
    const paint = list => tracks.forEach(t => {
      // Un juego visible y tres copias ocultas para que el bucle no tenga huecos
      t.innerHTML = list.map(b => li(b)).join("") + [1, 2, 3].map(() => list.map(b => li(b, true)).join("")).join("");
      t.classList.add("run");
    });
    paint(fixed);
    const opt = BRANDS.filter(b => b.opt && hasModels(b.n));
    if (opt.length) Promise.all(opt.map(probe)).then(r => { const ok = r.filter(Boolean); if (ok.length) paint(fixed.concat(ok)); });
  }

  /* ---------- Enlaces antiguos de la portada (#casa, #empresa) ---------- */
  const OLD = { casa: "cargadores", empresa: "empresas" };
  const fromHash = () => { const t = OLD[location.hash.slice(1)]; const el = t && $(t); if (el) el.scrollIntoView(); };
  addEventListener("hashchange", fromHash);
  if (OLD[location.hash.slice(1)]) addEventListener("load", () => setTimeout(fromHash, 60));

  /* ---------- Mantenimiento: preselecciona el formulario ---------- */
  const setMant = () => { const u = $("ubicacion"); if (u) u.value = "Mantenimiento o reparación de un cargador"; };
  document.querySelectorAll("[data-mant]").forEach(a => a.addEventListener("click", setMant));
  const goMant = () => { if (location.hash !== "#mantenimiento") return; setMant(); const c = $("contacto"); if (c) c.scrollIntoView(); };
  addEventListener("hashchange", goMant);
  addEventListener("load", () => setTimeout(goMant, 150));

  /* ---------- Cargadores destacados (garaje comunitario) ---------- */
  const box = $("featured");
  if (box && D) {
    const ids = (box.dataset.ids || "").split(",");
    box.innerHTML = ids.map(model).filter(Boolean).map(m => `<li><a class="use" href="catalogo.html#p-${m.id}">
        <span class="ph">${m.imagen ? `<img src="${img(m.imagen)}" alt="" loading="lazy" width="500" height="500">` : ""}</span>
        <small>${esc(m.marca)}</small><b>${esc(m.modelo)}</b>
        <span class="row"><span>${m.desde ? `desde ${eurIva(m.desde)}` : "Consultar"}</span><span class="go" aria-hidden="true"><svg width="16" height="16"><use href="#i-arrow"/></svg></span></span></a></li>`).join("");
  }
})();
