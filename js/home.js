/* Portada: selector de caso (casa, comunidad, empresa), otros modelos del caso, atajo de mantenimiento y destacados */
(function () {
  const $ = id => document.getElementById(id);
  const D = window.EVX_CATALOGO;
  // Los datos del catálogo están sin IVA; el precio principal se muestra con IVA (21 %) y el sin IVA al lado
  const eur = v => { const n = Math.round(v * 100) / 100, d = Math.abs(n % 1) > 0.004 ? 2 : 0, [i, c] = n.toFixed(d).split("."); return i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (c ? "," + c : "") + " €"; };
  const eurIva = v => eur(Math.round(v * 121) / 100);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const img = f => (window.EVX_IMG && window.EVX_IMG[f]) || `img/productos/${f}`;
  const model = id => D && D.modelos.find(m => m.id === id);
  const tom = m => [...new Set([m.tomas, ...m.versiones.map(v => v.tomas)].join(" ").match(/\d+/g) || [])].sort();
  const tk = m => { const t = tom(m); return t.includes("2") ? (t.includes("1") ? 1 : 2) : 0; };
  const tomTxt = m => { const t = tom(m); return !t.length ? "" : t.length > 1 ? t.join(" o ") + " tomas" : t[0] === "1" ? "1 toma" : t[0] + " tomas"; };

  /* ---------- Selector de caso ---------- */
  const CASES = {
    casa: { id: "CIR-01", tags: ["domestico", "comunitario"], uso: "uso-casa", ubic: "Vivienda unifamiliar / chalet",
      why: "Fabricado en España, con balanceo dinámico para que no salte la luz y preparado para carga solar.",
      aid: "Recupera hasta 4.000 € en la renta con la deducción de la Región de Murcia.",
      steps: ["Nos mandas una foto de tu cuadro eléctrico", "Presupuesto cerrado en menos de 24 h", "Lo instalamos, programamos y legalizamos"],
      cta: "Pedir presupuesto para mi casa", nombre: "casa y garaje comunitario", mm: "Otros cargadores para tu casa, con 1 o 2 tomas", nota: "equipo; la instalación, según tu caso" },
    comunidad: { id: "WAL-02", tags: ["domestico", "comunitario"], uso: "uso-casa", ubic: "Plaza en garaje comunitario",
      why: "Con app, control de potencia y tarjeta RFID. La línea sale de tu contador, así que la luz la pagas tú.",
      aid: "No necesitas permiso de la junta: basta con comunicarlo por escrito. Te damos el modelo.",
      steps: ["Fotos del cuarto de contadores y de tu plaza", "Comunicación a la comunidad", "Línea, cargador y certificado CIE"],
      cta: "Pedir presupuesto para mi plaza", nombre: "casa y garaje comunitario", mm: "Otros cargadores para tu plaza, con 1 o 2 tomas", nota: "equipo; la instalación, según los metros hasta tu plaza" },
    empresa: { id: "CIR-03", tags: ["empresa", "exterior"], uso: "uso-empresa", ubic: "Empresa / nave / comercio",
      why: "Dos tomas, tarjetas RFID y gestión remota por OCPP para empleados, clientes o flota.",
      aid: "Reparto de potencia: varios coches cargan a la vez sin subir la potencia contratada.",
      steps: ["Visita y estudio de potencia", "Propuesta por puntos de carga", "Instalación, alta de usuarios y mantenimiento"],
      cta: "Pedir propuesta para mi empresa", nombre: "empresas", mm: "Otras soluciones para empresas", nota: "por equipo; la instalación, según el proyecto" }
  };
  let current = "casa";
  const cases = document.querySelectorAll(".case[data-case]");
  const set = (k, v, html) => document.querySelectorAll(`[data-r="${k}"]`).forEach(el => html ? el.innerHTML = v : el.textContent = v);

  function render(key) {
    const c = CASES[key], m = model(c.id); if (!c) return;
    // Casa y comunidad comparten cargadores (cambia el número de tomas): primero los de 1 toma, luego los de 2
    const all = D ? D.modelos.filter(x => x.tags.some(t => c.tags.includes(t))).sort((a, b) => tk(a) - tk(b)) : [];
    set("model", m ? `${m.marca} ${m.modelo}` : "");
    set("why", c.why);
    set("price", m && m.desde ? `desde ${eurIva(m.desde)}` : "Consultar");
    set("sub", m && m.desde ? `IVA incluido · ${eur(m.desde)} sin IVA · ${c.nota}` : "");
    set("aid", c.aid);
    set("steps", c.steps.map(s => `<li>${esc(s)}</li>`).join(""), true);
    set("cta", c.cta);
    set("mmtitle", c.mm);
    const ex = document.querySelector('[data-r="explore"]');
    if (ex) { ex.href = `catalogo.html#${c.uso}`; ex.firstChild.textContent = `Explorar los ${all.length} cargadores para ${c.nombre} `; }
    const rail = $("mm-rail");
    if (rail) rail.innerHTML = all.filter(x => x.id !== c.id).map(x => `<li><a href="catalogo.html#p-${esc(x.id)}">
        <span class="im"><img src="${img(x.imagen)}" alt="" width="500" height="500" loading="lazy"></span>
        <span><small class="tm">${esc(tomTxt(x))}${x.tags.includes("exterior") ? " · torre de exterior" : ""}</small><b>${esc(x.marca)} ${esc(x.modelo)}</b><small class="iva">${x.desde ? "desde " + eurIva(x.desde) : "Consultar"}</small><small>${x.desde ? "IVA incl. · " + eur(x.desde) + " sin IVA" : ""}</small></span></a></li>`).join("")
      + `<li class="all"><a href="catalogo.html#${c.uso}">Ver todos en el catálogo →</a></li>`;
  }

  function choose(key, animate) {
    if (!CASES[key]) return;
    current = key;
    cases.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.case === key)));
    const sw = document.querySelectorAll(".swap");
    if (!animate) { render(key); return; }
    sw.forEach(s => s.classList.add("out"));
    setTimeout(() => { render(key); sw.forEach(s => s.classList.remove("out")); }, 160);
  }
  cases.forEach(b => b.addEventListener("click", () => { if (b.dataset.case !== current) choose(b.dataset.case, true); }));
  if (cases.length) render(current);

  // El botón de presupuesto deja el formulario relleno con el cargador recomendado y el tipo de instalación
  document.querySelectorAll("[data-quote]").forEach(a => a.addEventListener("click", () => {
    const c = CASES[current], m = model(c.id);
    const u = $("ubicacion"); if (u) u.value = c.ubic;
    if (m && window.EVX_selectProduct) window.EVX_selectProduct({
      modelo: `${m.marca} ${m.modelo}`, version: "", codigo: "", detalle: `${m.potencias} kW · ${m.fases}`,
      precio: m.desde ? `desde ${eurIva(m.desde)} IVA incl.` : "Consultar", modalidad: "instalacion", fases: m.fases
    });
  }));

  // index.html#casa, #comunidad y #empresa abren la portada con ese caso elegido
  const fromHash = () => { const h = location.hash.slice(1); if (CASES[h] && cases.length) { choose(h, false); const s = $("caso"); if (s) s.scrollIntoView(); } };
  addEventListener("hashchange", fromHash); fromHash();


  /* ---------- Proceso: avanza solo mientras se ve; al pulsar un paso se queda en él unos segundos ---------- */
  const proc = document.querySelector("[data-proc]");
  if (proc) {
    const items = [...proc.querySelectorAll("li")], btns = [...proc.querySelectorAll(".pstep")];
    const meter = document.querySelector(".proc-meter"), pct = document.querySelector("[data-pct]");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
