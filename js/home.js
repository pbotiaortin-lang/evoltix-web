/* Portada: casa y garaje comunitario o empresa (abre el catálogo filtrado), proceso, atajo de mantenimiento y destacados */
(function () {
  const $ = id => document.getElementById(id);
  const D = window.EVX_CATALOGO;
  // Los datos del catálogo están sin IVA; el precio principal se muestra con IVA (21 %) y el sin IVA al lado
  const eur = v => { const n = Math.round(v * 100) / 100, d = Math.abs(n % 1) > 0.004 ? 2 : 0, [i, c] = n.toFixed(d).split("."); return i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (c ? "," + c : "") + " €"; };
  const eurIva = v => eur(Math.round(v * 121) / 100);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const img = f => (window.EVX_IMG && window.EVX_IMG[f]) || `img/productos/${f}`;
  const model = id => D && D.modelos.find(m => m.id === id);

  /* ---------- ¿Dónde vas a cargar? Casa y garaje comunitario, o empresa: abre el catálogo filtrado ---------- */
  const TXT = {
    casa: { k: "Casa y garaje comunitario", t: "Cargadores para tu casa o tu plaza de garaje",
      p: "Los mismos cargadores sirven en casa y en el garaje comunitario: lo que cambia es si cargas un coche (1 toma) o dos (2 tomas). Filtra por lo que necesitas y pide el precio con instalación." },
    empresa: { k: "Empresas", t: "Cargadores y torres de recarga para empresas",
      p: "Equipos con tarjetas RFID, gestión remota por OCPP y reparto de potencia, y torres para aparcamientos al aire libre. Filtra por lo que necesitas y te preparamos la propuesta." }
  };
  const cases = document.querySelectorAll(".case[data-ambito]"), sec = $("cargadores");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function choose(key, scroll) {
    if (!TXT[key] || !sec) return;
    cases.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.ambito === key)));
    Object.entries(TXT[key]).forEach(([k, v]) => { const el = sec.querySelector(`[data-hc="${k}"]`); if (el) el.textContent = v; });
    if (window.EVX_setAmbito) window.EVX_setAmbito(key);
    // En empresa, el formulario ya sale con ese tipo de instalación
    const u = $("ubicacion"); if (u && key === "empresa" && !u.value) u.value = "Empresa / nave / comercio";
    const first = sec.hidden; sec.hidden = false;
    if (first && !reduce) { sec.classList.add("in"); requestAnimationFrame(() => requestAnimationFrame(() => sec.classList.remove("in"))); }
    if (scroll) sec.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }
  cases.forEach(b => b.addEventListener("click", () => choose(b.dataset.ambito, true)));

  // index.html#casa, #comunidad y #empresa abren la portada con los cargadores de ese ámbito
  const HASH = { casa: "casa", comunidad: "casa", empresa: "empresa", cargadores: "casa" };
  const fromHash = () => { const k = HASH[location.hash.slice(1)]; if (k && cases.length) choose(k, true); };
  addEventListener("hashchange", fromHash);
  if (HASH[location.hash.slice(1)]) addEventListener("load", () => setTimeout(fromHash, 60));

  /* ---------- Proceso: avanza solo mientras se ve; al pulsar un paso se queda en él unos segundos ---------- */
  const proc = document.querySelector("[data-proc]");
  if (proc) {
    const items = [...proc.querySelectorAll("li")], btns = [...proc.querySelectorAll(".pstep")];
    const meter = document.querySelector(".proc-meter"), pct = document.querySelector("[data-pct]");
    let step = 0, timer = null, holdUntil = 0, visible = false;
    const show = i => {
      step = i;
      items.forEach((li, k) => { li.classList.toggle("done", k < i); li.classList.toggle("on", k === i); });
      btns.forEach((b, k) => k === i ? b.setAttribute("aria-current", "step") : b.removeAttribute("aria-current"));
      const p = items.length > 1 ? i / (items.length - 1) : 1;
      proc.style.setProperty("--p", p);
      if (meter) { meter.style.setProperty("--bp", (i + 1) / items.length); meter.classList.toggle("full", i === items.length - 1); }
      if (i === items.length - 1) holdUntil = Math.max(holdUntil, Date.now() + 2600);
      if (pct) pct.textContent = Math.round((i + 1) / items.length * 100) + "\u00a0%";
    };
    const tick = () => {
      if (!visible || Date.now() < holdUntil) return;
      show(step === items.length - 1 ? 0 : step + 1);
    };
    btns.forEach((b, k) => {
      b.addEventListener("click", () => { holdUntil = Date.now() + 8000; show(k); });
      b.addEventListener("focus", () => { holdUntil = Date.now() + 8000; show(k); });
    });
    if (reduce) show(items.length - 1);
    else {
      show(0);
      new IntersectionObserver(es => es.forEach(e => {
        visible = e.isIntersecting;
        if (visible && !timer) timer = setInterval(tick, 2400);
        if (!visible && timer) { clearInterval(timer); timer = null; }
      }), { threshold: 0.35 }).observe(proc);
    }
  }

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
    box.innerHTML = ids.map(model).filter(Boolean).map(m => `<a class="fcard" href="catalogo.html#p-${m.id}">
        <span class="im">${m.imagen ? `<img src="${img(m.imagen)}" alt="${esc(m.marca)} ${esc(m.modelo)}" loading="lazy" width="500" height="500">` : ""}</span>
        <span class="tx"><span class="br">${esc(m.marca)}</span><h3>${esc(m.modelo)}</h3>
        <span class="pr"><span>Equipo</span>${m.desde ? `<b>desde ${eurIva(m.desde)}</b><small>IVA incluido · ${eur(m.desde)} sin IVA</small>` : "<b>Consultar</b>"}</span></span></a>`).join("");
  }
})();
