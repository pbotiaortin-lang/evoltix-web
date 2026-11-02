/* Catálogo EVOLTIX: filtros con contadores, tarjetas, ficha de producto con foto por versión,
   documentación, accesorios compatibles y configurador V2C */
(function () {
  const DATA = window.EVX_CATALOGO || { modelos: [], v2c: {} };
  // Si una foto falla, se sustituye por su icono (sin atributos en línea, por la CSP)
  document.addEventListener("error", e => { const t = e.target; if (t.tagName === "IMG" && t.dataset.ph) t.outerHTML = t.dataset.ph; }, true);
  const $ = (s, el = document) => el.querySelector(s);
  // Precios en la web: se muestran con IVA; los datos del catálogo están sin IVA. Decimales solo si los hay.
  const eur = (n, dec) => {
    if (n == null) return "";
    if (dec == null) dec = Math.abs(n % 1) > 0.004 ? 2 : 0;
    const neg = n < 0, [i, d] = Math.abs(n).toFixed(dec).split(".");
    return (neg ? "-" : "") + i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (d ? "," + d : "") + "\u00a0€";
  };
  const IVA = 1.21;
  const conIva = n => eur(Math.round(n * IVA * 100) / 100);
  const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const ICON = {
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    doc: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/></svg>',
    charger: '<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="22" y="10" width="40" height="58" rx="9"/><circle cx="42" cy="34" r="8"/><path d="M38 52h8M62 44c10 0 12 8 12 16v14c0 6 4 10 10 10" stroke-linecap="round"/><rect x="34" y="68" width="16" height="10" rx="2"/></svg>',
    rfid: '<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="18" y="26" width="60" height="40" rx="6"/><path d="M28 54h18M28 46h10"/><path d="M60 40a8 8 0 0 1 0 12M65 36a14 14 0 0 1 0 20" stroke-linecap="round"/></svg>',
    cable: '<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="12" y="34" width="20" height="26" rx="5"/><rect x="64" y="34" width="20" height="26" rx="5"/><path d="M32 47c12 0 10 22 22 22s4-22 10-22"/></svg>',
    pole: '<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="36" y="8" width="24" height="18" rx="3"/><path d="M48 26v58M30 86h36"/></svg>'
  };
  const USO = { domestico: "Vivienda", comunitario: "Garaje comunitario", empresa: "Empresa", poste: "Poste exterior", accesorio: "Accesorio" };
  const BRANDS = ["Circutor", "Wallbox", "Orbis", "V2C"];
  const isAcc = m => m.tags.includes("accesorio");
  const byId = id => DATA.modelos.find(x => x.id === id);

  const state = { uso: "todos", marca: "todas", fase: "todas", extra: new Set(), orden: "rel", q: "" };
  const norm = t => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const hay = m => norm([m.marca, m.modelo, m.categoria, m.descripcion, m.conectividad, ...m.versiones.map(v => v.nombre + " " + v.codigo)].join(" "));
  const cmp = new Set();

  /* ---------- Filtros ---------- */
  function matchExcept(m, skip) {
    if (state.q && !norm(state.q).split(/\s+/).every(w => hay(m).includes(w))) return false;
    if (skip !== "uso") {
      if (state.uso === "todos" ? false : !m.tags.includes(state.uso)) return false;
    }
    if (skip !== "marca" && state.marca !== "todas" && m.marca !== state.marca) return false;
    if (skip !== "fase") {
      if (state.fase === "mono" && !/Mono/.test(m.fases)) return false;
      if (state.fase === "tri" && !/Tri/.test(m.fases)) return false;
    }
    if (skip !== "extra") for (const x of state.extra) if (!m[x]) return false;
    return true;
  }
  const match = m => matchExcept(m, null);

  function countFor(key, v) {
    return DATA.modelos.filter(m => {
      if (!matchExcept(m, key)) return false;
      if (key === "uso") return v === "todos" ? !isAcc(m) || state.uso === "accesorio" : m.tags.includes(v);
      if (key === "marca") return v === "todas" || m.marca === v;
      if (key === "fase") return v === "todas" || (v === "mono" ? /Mono/.test(m.fases) : /Tri/.test(m.fases));
      if (key === "extra") return !!m[v];
      return true;
    }).length;
  }
  function paintCounts() {
    document.querySelectorAll("[data-filter] .fopt").forEach(b => {
      const key = b.closest("[data-filter]").dataset.filter;
      let n = countFor(key, b.dataset.v);
      if (key === "uso" && b.dataset.v === "todos") n = DATA.modelos.filter(m => matchExcept(m, "uso")).length;
      let c = b.querySelector(".n"); if (!c) { c = document.createElement("span"); c.className = "n"; b.insertBefore(c, b.querySelector(".ck")); }
      c.textContent = n;
      b.classList.toggle("zero", n === 0 && b.getAttribute("aria-pressed") !== "true");
    });
  }

  function buildFilters() {
    const marcas = BRANDS.filter(b => DATA.modelos.some(m => m.marca === b));
    $("#f-marca").innerHTML = ['<span class="flabel">Marca</span><button class="fopt" type="button" data-v="todas" aria-pressed="true"><span class="t">Todas</span></button>']
      .concat(marcas.map(m => `<button class="fopt" type="button" data-v="${esc(m)}" aria-pressed="false"><span class="t">${esc(m)}</span></button>`)).join("");
    document.querySelectorAll("[data-filter] .fopt").forEach(b => { if (!b.querySelector(".t")) { const t = document.createElement("span"); t.className = "t"; while (b.firstChild && !(b.firstChild.classList && b.firstChild.classList.contains("ck"))) t.appendChild(b.firstChild); b.prepend(t); } });
    document.querySelectorAll("[data-filter]").forEach(group => {
      group.addEventListener("click", e => {
        const b = e.target.closest(".fopt"); if (!b) return;
        const key = group.dataset.filter;
        if (key === "extra") {
          const on = b.getAttribute("aria-pressed") !== "true";
          b.setAttribute("aria-pressed", on); on ? state.extra.add(b.dataset.v) : state.extra.delete(b.dataset.v);
        } else {
          group.querySelectorAll(".fopt").forEach(c => c.setAttribute("aria-pressed", c === b));
          state[key] = b.dataset.v;
        }
        render();
      });
    });
    $("#f-orden").addEventListener("change", e => { state.orden = e.target.value; render(); });
    const q = $("#q"); let tq;
    if (q) q.addEventListener("input", () => { clearTimeout(tq); tq = setTimeout(() => { state.q = q.value.trim(); render(); }, 120); });
    $("#chips-on") && $("#chips-on").addEventListener("click", e => {
      const b = e.target.closest("[data-clear]"); if (!b) return;
      const [k, v] = b.dataset.clear.split(":");
      if (k === "all") return resetFilters();
      if (k === "q") { state.q = ""; if (q) q.value = ""; }
      else if (k === "extra") { state.extra.delete(v); document.querySelector(`[data-filter="extra"] [data-v="${v}"]`).setAttribute("aria-pressed", "false"); }
      else { state[k] = k === "uso" ? "todos" : "todas"; document.querySelectorAll(`[data-filter="${k}"] .fopt`).forEach(c => c.setAttribute("aria-pressed", ["todos", "todas"].includes(c.dataset.v))); }
      render();
    });
    const ft = document.querySelector(".f-toggle");
    if (ft) ft.addEventListener("click", () => { const o = $("#filters").classList.toggle("open"); ft.setAttribute("aria-expanded", o); document.body.style.overflow = o ? "hidden" : ""; });
    document.querySelectorAll("[data-f-close]").forEach(b => b.addEventListener("click", () => {
      $("#filters").classList.remove("open"); if (ft) { ft.setAttribute("aria-expanded", false); ft.focus({ preventScroll: true }); }
      document.body.style.overflow = ""; $("#grid").scrollIntoView({ block: "start", behavior: "instant" });
    }));
  }
  window.EVX_setUso = function (uso) {
    state.uso = uso;
    document.querySelectorAll('[data-filter="uso"] .fopt').forEach(c => c.setAttribute("aria-pressed", c.dataset.v === uso));
    render();
  };

  /* ---------- Imágenes ---------- */
  const LOGO = { Circutor: "circutor.webp", Wallbox: "wallbox.png", Orbis: "orbis.webp", V2C: "v2c.png" };
  function placeholder(m) {
    const f = LOGO[m.marca], src = f ? ((window.EVX_IMG && window.EVX_IMG["marcas/" + f]) || `img/marcas/${f}`) : "";
    return `<div class="ph nophoto" role="img" aria-label="${esc(m.marca + " " + m.modelo)}: imagen no disponible">${isAcc(m) ? (/RFID/i.test(m.categoria) ? ICON.rfid : /Cable/i.test(m.categoria) ? ICON.cable : ICON.pole) : ICON.charger}${src ? `<img class="ph-logo ${esc(m.marca.toLowerCase())}" src="${esc(src)}" alt="" loading="lazy">` : ""}</div>`;
  }
  function media(m, file) {
    const f = file || m.imagen;
    if (!f) return placeholder(m);
    const src = (window.EVX_IMG && window.EVX_IMG[f]) || `img/productos/${f}`;
    // Las fotos de fabricante con fondo gris claro (#F3F4F6) ya coinciden con el fondo de la tarjeta: no se funden
    const tinted = /circutor-(ehome-(base|cable|5-base|base-tri)|enext(-mc2|-ds)?|epark-(gen3-t2c2|gen3-t2s2|ts2))\.jpg$/.test(f);
    return `<img${tinted ? ' class="nb"' : ""} src="${esc(src)}" alt="${esc(m.marca + " " + m.modelo)}" loading="lazy" width="500" height="500" data-ph="${esc(placeholder(m))}">`;
  }

  /* ---------- Tarjetas ---------- */
  const FEATS = [["balanceo", "Balanceo dinámico"], ["solar", "Carga solar"], ["rfid", "RFID"], ["ocpp", "OCPP"], ["mid", "Contador MID"], ["protecciones", "Protecciones"]];
  function feats(m, max = 3) {
    const f = FEATS.filter(([k]) => m[k]).map(([, t]) => t);
    const shown = f.slice(0, max).map(t => `<li>${ICON.check}${t}</li>`).join("");
    const rest = f.length - max;
    return f.length ? `<ul class="feats" aria-label="Prestaciones">${shown}${rest > 0 ? `<li class="more" title="${esc(f.slice(max).join(", "))}">+${rest}<span class="visually-hidden">: ${esc(f.slice(max).join(", "))}</span></li>` : ""}</ul>` : "";
  }
  const shortOut = t => String(t || "").replace(/Cable T2 o [Bb]ase T2/, "Cable o base T2").replace(/Base T2 o Cable T2/, "Base o cable T2").replace(" (opción)", "");
  function chips(m) {
    if (isAcc(m)) {
      const comp = DATA.modelos.filter(x => x.compatibles.includes(m.id)).map(x => x.modelo);
      const tipo = ((m.categoria || "").split("·")[1] || "Accesorio").trim();
      return [tipo, comp.length ? "Para " + comp.join(", ") : "", m.tomas && !["—", "1"].includes(m.tomas) ? m.tomas + " equipos" : ""].filter(Boolean);
    }
    return [m.fases, shortOut(m.salida), m.tomas && m.tomas !== "1" ? m.tomas + " tomas" : ""].filter(Boolean);
  }
  /* Se mantiene para la ficha y el comparador */
  function specRows(m) {
    const salida = (m.salida || "").replace(" + Schuko (opción)", " + Schuko");
    return `<dt>Potencia</dt><dd>${esc(m.potencias)} kW</dd>
      <dt>Red</dt><dd>${esc(m.fases)}</dd>
      <dt>Tomas</dt><dd>${esc(m.tomas)}</dd>
      <dt>Salida</dt><dd>${esc(salida)}</dd>`;
  }
  function card(m) {
    const acc = isAcc(m), usos = m.tags.map(t => USO[t]).filter(Boolean), uso = usos[0] || "";
    const nv = m.versiones.length, name = esc(m.marca + " " + m.modelo);
    const price = m.desde
      ? `<div class="price"><span class="from">${acc ? "Desde" : "Equipo desde"}</span><span class="amt">${conIva(m.desde)}</span><span class="iva">IVA incluido · ${eur(m.desde)} sin IVA</span></div>`
      : `<div class="price ask"><span class="from">${acc ? "Precio" : "Precio del equipo"}</span><span class="amt">Consultar</span><span class="iva">Te lo indicamos en el presupuesto</span></div>`;
    const cta = acc
      ? `<button class="btn btn-secondary btn-sm" type="button" data-open="${esc(m.id)}">Ver detalles</button>`
      : `<button class="btn btn-primary btn-sm" type="button" data-quote="${esc(m.id)}">${m.desde ? "Precio con instalación" : "Pedir precio"}</button>`;
    return `<article class="card${acc ? " acc" : ""}${m.imagen ? "" : " no-img"}">
      <button class="media" type="button" data-open="${esc(m.id)}" aria-label="Ver ficha de ${name}">${media(m)}${uso && !acc ? `<span class="badge">${esc(uso)}</span>` : ""}</button>
      <div class="body">
        <div class="ttl"><div class="brand">${esc(m.marca)}</div><h3><button type="button" class="t-link" data-open="${esc(m.id)}">${esc(m.modelo)}</button></h3></div>
        ${acc ? "" : `<p class="kw"><b>${esc(m.potencias)}</b> kW</p>`}
        <ul class="chips" aria-label="Características">${chips(m).map(c => `<li>${esc(c)}</li>`).join("")}</ul>
        ${acc ? "" : feats(m)}
        <div class="buy">${price}${cta}</div>
        ${acc ? "" : `<div class="foot">
          <button class="lnk" type="button" data-open="${esc(m.id)}">${nv === 1 ? "Ver ficha" : `Ver ${nv} versiones`}<span aria-hidden="true"> →</span></button>
          <label class="cmp-l"><input type="checkbox" data-cmp="${esc(m.id)}" ${cmp.has(m.id) ? "checked" : ""}> Comparar</label>
        </div>`}
      </div></article>`;
  }

  function render() {
    let list = DATA.modelos.filter(m => match(m) && (state.uso === "todos" ? true : true));
    if (state.uso === "todos") list.sort((a, b) => isAcc(a) - isAcc(b));
    if (state.orden === "asc") list = [...list].sort((a, b) => isAcc(a) - isAcc(b) || (a.desde ?? 1e9) - (b.desde ?? 1e9));
    if (state.orden === "desc") list = [...list].sort((a, b) => isAcc(a) - isAcc(b) || (b.desde ?? -1) - (a.desde ?? -1));
    const ch = list.filter(m => !isAcc(m)), ac = list.filter(isAcc);
    let html = ch.map(card).join("");
    if (ac.length && state.uso !== "accesorio") html += `<div class="grid-sep"><span class="eyebrow">Pedestales y accesorios</span><p>Pedestales para instalar en suelo, tarjetas de acceso y cables de carga.</p></div>`;
    html += ac.map(card).join("");
    $("#grid").innerHTML = list.length ? html :
      `<div class="empty"><b>${state.q ? `No encontramos «${esc(state.q)}»` : "Ningún cargador cumple todos esos filtros"}</b><p>Prueba con menos filtros o pregúntanos directamente: te decimos qué modelo encaja.</p><div class="empty-acts"><button class="btn btn-secondary btn-sm" type="button" id="reset-f">Quitar filtros</button><a class="btn btn-primary btn-sm" href="tel:+34671445832">Llamar al 671 44 58 32</a></div></div>`;
    $("#count").innerHTML = `<b>${ch.length}</b> ${ch.length === 1 ? "cargador" : "cargadores"}${ac.length ? ` · ${ac.length} ${ac.length === 1 ? "accesorio" : "accesorios"}` : ""}`;
    const r = $("#reset-f"); if (r) r.onclick = resetFilters;
    paintCounts(); chipsOn(); syncCmp();
    const fa = $("#f-apply"); if (fa) fa.textContent = list.length ? `Ver ${ch.length} ${ch.length === 1 ? "cargador" : "cargadores"}${ac.length ? " y " + ac.length + " accesorios" : ""}` : "Sin resultados: cambia los filtros";
    const ftb = document.querySelector(".f-toggle"); if (ftb) { const n = (state.uso !== "todos") + (state.marca !== "todas") + (state.fase !== "todas") + state.extra.size; ftb.textContent = n ? `Filtros (${n})` : "Filtros"; }
  }
  function chipsOn() {
    const box = $("#chips-on"); if (!box) return;
    const lab = (k, v) => (document.querySelector(`[data-filter="${k}"] [data-v="${v}"] .t`) || {}).textContent || v;
    const c = [];
    if (state.q) c.push(["q:", `«${state.q}»`]);
    if (state.uso !== "todos") c.push(["uso:" + state.uso, lab("uso", state.uso)]);
    if (state.marca !== "todas") c.push(["marca:" + state.marca, state.marca]);
    if (state.fase !== "todas") c.push(["fase:" + state.fase, lab("fase", state.fase)]);
    state.extra.forEach(x => c.push(["extra:" + x, lab("extra", x)]));
    box.innerHTML = c.length ? c.map(([k, t]) => `<button type="button" class="chip-on" data-clear="${esc(k)}" aria-label="Quitar filtro ${esc(t)}">${esc(t)}<span aria-hidden="true">×</span></button>`).join("") + (c.length > 1 ? `<button type="button" class="chip-clear" data-clear="all">Quitar todos</button>` : "") : "";
  }
  function resetFilters() {
    state.q = ""; const qi = $("#q"); if (qi) qi.value = "";
    Object.assign(state, { uso: "todos", marca: "todas", fase: "todas", extra: new Set() });
    document.querySelectorAll("[data-filter] .fopt").forEach(c => c.setAttribute("aria-pressed", ["todos", "todas"].includes(c.dataset.v)));
    render();
  }

  /* ---------- Ficha de producto ---------- */
  const dlg = () => $("#pd");
  let cur = null;

  function openProduct(id) {
    const m = byId(id); if (!m) return;
    const conf = DATA.v2c && DATA.v2c[m.modelo];
    cur = { m, conf };
    const tech = Object.entries(m.detalle || {}).filter(([, v]) => v && v !== "—")
      .map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("");
    const comp = (m.compatibles || []).map(byId).filter(Boolean);
    const forM = isAcc(m) ? DATA.modelos.filter(x => x.compatibles.includes(m.id)) : [];
    $("#pd-content").innerHTML = `
      <div class="pd-media"><div class="pd-img" id="pd-img">${media(m)}</div>
        ${m.ficha ? `<a class="pd-doc" href="${/^https?:/.test(m.ficha) ? esc(m.ficha) : "docs/" + esc(m.ficha)}" target="_blank" rel="noopener">${ICON.doc}<span><b>Ficha técnica del fabricante</b><small>PDF · ${esc(m.marca)}</small></span></a>` : ""}
      </div>
      <div class="pd-body">
        <div><div class="eyebrow">${esc(m.marca)} · ${esc(m.categoria)}</div><h2 id="pd-title" style="margin-top:8px">${esc(m.modelo)}</h2></div>
        <p class="pd-desc">${esc(m.descripcion)}</p>
        <div id="pd-opts" class="pd-opts"></div>
        <div class="total" aria-live="polite"><div><small>${isAcc(m) ? "Precio" : "Precio del equipo"}</small><span class="amt" id="pd-total"></span><small><span id="pd-iva"></span>${isAcc(m) ? "" : " · la instalación se presupuesta aparte"}</small></div></div>
        <div class="pd-acts">
          <button class="btn btn-primary" type="button" id="pd-inst">${isAcc(m) ? "Añadir a mi solicitud" : "Solicitar precio con instalación"}</button>
          <button class="btn btn-secondary" type="button" id="pd-eq">${isAcc(m) ? "Comprar solo el accesorio" : "Quiero solo el equipo"}</button>
        </div>
        <a class="pd-call" href="tel:+34671445832"><span>¿Dudas con este modelo?</span><b>Llama al 671 44 58 32</b></a>
        ${comp.length ? `<div class="pd-rel"><span class="lbl">Accesorios compatibles</span>${comp.map(a => `<button type="button" class="rel" data-open-rel="${esc(a.id)}"><span class="rel-img">${media(a)}</span><span><b>${esc(a.modelo)}</b><small>${a.desde ? "Desde " + conIva(a.desde) + " IVA incl." : "Consultar"}</small></span></button>`).join("")}</div>` : ""}
        ${forM.length ? `<div class="pd-rel"><span class="lbl">Compatible con</span>${forM.map(a => `<button type="button" class="rel" data-open-rel="${esc(a.id)}"><span class="rel-img">${media(a)}</span><span><b>${esc(a.marca + " " + a.modelo)}</b><small>${a.desde ? "Equipo desde " + conIva(a.desde) + " IVA incl." : "Consultar"}</small></span></button>`).join("")}</div>` : ""}
        ${isAcc(m) ? "" : `<details class="acc"><summary>Especificaciones técnicas</summary><dl class="tech"><dt>Potencia</dt><dd class="mono">${esc(m.potencias)} kW</dd><dt>Red</dt><dd>${esc(m.fases)}</dd><dt>Tomas</dt><dd>${esc(m.tomas)}</dd><dt>Salida</dt><dd>${esc(m.salida)}${m.cable ? " · " + esc(m.cable) : ""}</dd><dt>Conectividad</dt><dd>${esc(m.conectividad)}</dd>${tech}</dl></details>`}
      </div>`;
    conf ? buildConfigurator(m, conf) : buildVersions(m);
    $("#pd-inst").onclick = () => toForm(isAcc(m) ? "instalacion" : "instalacion");
    $("#pd-eq").onclick = () => toForm("equipo");
    $("#pd-content").querySelectorAll("[data-open-rel]").forEach(b => b.onclick = () => openProduct(b.dataset.openRel));
    if (!dlg().open) dlg().showModal();
    $("#pd-content .pd-body").scrollTop = 0;
  }

  function setImage(file) {
    const box = $("#pd-img"); if (!box) return;
    box.innerHTML = media(cur.m, file || cur.m.imagen);
  }

  function buildVersions(m) {
    const vs = m.versiones || [];
    $("#pd-opts").innerHTML = `<div class="opt-group"><span class="lbl">Elige la versión <span class="hint">(${vs.length} · precios con IVA)</span></span><div class="vlist" role="radiogroup" aria-label="Versiones">${vs.map((v, i) => `
      <label class="vrow"><input type="radio" name="pd-v" value="${i}" ${i === cheapest(vs) ? "checked" : ""}>
        <span><span class="vn">${esc(v.nombre)}</span><br><span class="vs">${esc([v.codigo, v.kw && v.kw !== "—" ? v.kw + " kW" : "", v.fases !== "—" ? v.fases : "", v.salida !== "—" ? v.salida : "", v.cable].filter(Boolean).join(" · "))}</span></span>
        <span class="vp">${v.precio ? conIva(v.precio) : "Consultar"}</span></label>`).join("")}</div></div>`;
    $("#pd-opts").onchange = updateVersion;
    updateVersion();
  }
  function cheapest(vs) {
    let best = 0, p = Infinity;
    vs.forEach((v, i) => { if (v.precio && v.precio < p) { p = v.precio; best = i; } });
    return best;
  }
  function updateVersion() {
    const i = +($('input[name="pd-v"]:checked') || { value: 0 }).value;
    const v = cur.m.versiones[i];
    cur.sel = { version: v ? v.nombre : "", codigo: v ? v.codigo : "", precio: v ? v.precio : null, fases: v ? v.fases : "",
      detalle: v ? [v.kw && v.kw !== "—" ? v.kw + " kW" : "", v.fases !== "—" ? v.fases : "", v.salida !== "—" ? v.salida : "", v.cable].filter(Boolean).join(" · ") : "" };
    $("#pd-total").textContent = v && v.precio ? conIva(v.precio) : "Consultar";
    $("#pd-iva").textContent = v && v.precio ? "IVA incluido (" + eur(v.precio) + " sin IVA)" : "";
    setImage(v && v.imagen);
  }

  function buildConfigurator(m, conf) {
    const fases = Object.keys(conf.fases);
    const all = (DATA.v2c._accesorios || []), acc = conf.accesorios ? all.filter(a => conf.accesorios.includes(a.nombre)) : all;
    cur.cfg = { fase: fases[0], salida: 0, extras: new Set(), acc: new Set() };
    const draw = () => {
      const F = conf.fases[cur.cfg.fase];
      $("#pd-opts").innerHTML = `
        <div class="opt-group"><span class="lbl">Tipo de red y potencia <span class="hint">(precios con IVA)</span></span><div class="opts">${fases.map(f => `<button type="button" class="opt" data-fase="${esc(f)}" aria-pressed="${f === cur.cfg.fase}">${esc(f)}<small>${conf.fases[f].base ? conIva(conf.fases[f].base) : "Consultar"}</small></button>`).join("")}</div></div>
        <div class="opt-group"><span class="lbl">Cable o base</span><div class="opts">${F.salidas.map((s, i) => `<button type="button" class="opt" data-sal="${i}" aria-pressed="${i === cur.cfg.salida}">${esc(s.nombre.replace("Socket (base)", "Base Tipo 2"))}<small>${s.delta === 0 ? "Incluido" : s.delta == null ? "Consultar" : (s.delta > 0 ? "+" : "") + conIva(s.delta)}</small></button>`).join("")}</div></div>
        <div class="opt-group"><span class="lbl">Extras</span>${F.extras.map((x, i) => `<label class="xrow"><input type="checkbox" data-ext="${i}" ${cur.cfg.extras.has(i) ? "checked" : ""}><span>${esc(x.nombre)}</span><span class="vp">${x.precio != null ? "+" + conIva(x.precio) : "Consultar"}</span></label>`).join("")}</div>
        ${acc.length ? `<details class="acc"><summary>Accesorios V2C (opcional)</summary><div class="xlist">${acc.map((a, i) => `<label class="xrow"><input type="checkbox" data-acc="${i}" ${cur.cfg.acc.has(i) ? "checked" : ""}><span>${esc(a.nombre)}</span><span class="vp">${a.precio != null ? "+" + conIva(a.precio) : "Consultar"}</span></label>`).join("")}</div></details>` : ""}`;
      calc();
    };
    const calc = () => {
      const F = conf.fases[cur.cfg.fase];
      const sal = F.salidas[cur.cfg.salida];
      let total = F.base, pend = F.base == null;
      if (sal.delta == null && cur.cfg.salida !== 0) pend = true; else total = (total || 0) + (sal.delta || 0);
      const parts = [cur.cfg.fase, sal.nombre];
      cur.cfg.extras.forEach(i => { const x = F.extras[i]; parts.push(x.nombre); x.precio == null ? pend = true : total += x.precio; });
      cur.cfg.acc.forEach(i => { const a = acc[i]; parts.push(a.nombre); a.precio == null ? pend = true : total += a.precio; });
      const txt = total ? eur(total) + (pend ? " + opciones a consultar" : "") : "Consultar";
      $("#pd-total").textContent = total ? conIva(total) + (pend ? " + opciones a consultar" : "") : "Consultar"; $("#pd-total").classList.toggle("sm", pend);
      $("#pd-iva").textContent = total ? "IVA incluido (" + eur(total) + " sin IVA" + (pend ? ", sin las opciones a consultar" : "") + ")" : "";
      cur.sel = { version: `${m.modelo} ${cur.cfg.fase}`, codigo: "", precio: pend ? null : total, detalle: parts.join(" · "), precioTxt: total ? conIva(total) + (pend ? " + opciones a consultar" : "") + " IVA incl." : txt };
    };
    $("#pd-opts").onclick = e => {
      const f = e.target.closest("[data-fase]"), s = e.target.closest("[data-sal]");
      if (f) { cur.cfg.fase = f.dataset.fase; cur.cfg.salida = 0; cur.cfg.extras.clear(); draw(); }
      if (s) { cur.cfg.salida = +s.dataset.sal; draw(); }
    };
    $("#pd-opts").onchange = e => {
      const t = e.target;
      if (t.dataset.ext != null) t.checked ? cur.cfg.extras.add(+t.dataset.ext) : cur.cfg.extras.delete(+t.dataset.ext);
      if (t.dataset.acc != null) t.checked ? cur.cfg.acc.add(+t.dataset.acc) : cur.cfg.acc.delete(+t.dataset.acc);
      calc();
    };
    draw();
  }

  function toForm(modalidad, m = cur && cur.m, sel = cur && cur.sel) {
    if (!m) return;
    const precio = sel && (sel.precioTxt || (sel.precio ? conIva(sel.precio) + " IVA incl." : null)) || (m.desde ? "desde " + conIva(m.desde) + " IVA incl." : "Consultar");
    window.EVX_selectProduct && window.EVX_selectProduct({
      modelo: `${m.marca} ${m.modelo}`, version: sel ? sel.version : "", codigo: sel ? sel.codigo : "",
      detalle: sel ? sel.detalle : `${m.potencias} kW · ${m.fases}`, precio, modalidad,
      fases: (sel && sel.fases) || (sel && /Tri/.test(sel.version || "") ? "Tri" : sel && /Mono/.test(sel.version || "") ? "Mono" : m.fases)
    });
    if (dlg().open) dlg().close();
    document.getElementById("contacto").scrollIntoView({ behavior: "smooth" });
  }

  /* ---------- Comparador (hasta 3 modelos) ---------- */
  function syncCmp() {
    const bar = $("#cmp-bar"); if (!bar) return;
    document.querySelectorAll("[data-cmp]").forEach(i => { i.checked = cmp.has(i.dataset.cmp); i.disabled = !i.checked && cmp.size >= 3; });
    if (!cmp.size) { bar.hidden = true; document.body.classList.remove("has-cmp"); return; }
    bar.hidden = false; document.body.classList.add("has-cmp");
    const ms = [...cmp].map(byId);
    bar.innerHTML = `<div class="wrap"><span class="cmp-n"><b>${cmp.size}</b> de 3 para comparar:</span><span class="cmp-list">${ms.map(m => `<button type="button" class="chip-on" data-uncmp="${esc(m.id)}" aria-label="Quitar ${esc(m.modelo)} de la comparación">${esc(m.modelo)}<span aria-hidden="true">×</span></button>`).join("")}</span>
      <button class="btn btn-primary btn-sm" type="button" id="cmp-go" ${cmp.size < 2 ? "disabled" : ""}>${cmp.size < 2 ? "Elige otro modelo" : `Comparar ${cmp.size} modelos`}</button></div>`;
  }
  function openCompare() {
    const ms = [...cmp].map(byId); if (ms.length < 2) return;
    const yes = v => v && v !== "—" ? esc(v) : "—";
    const rows = [["Precio del equipo (con IVA)", m => m.desde ? "Desde " + conIva(m.desde) : "Consultar"], ["Potencia", m => esc(m.potencias) + " kW"], ["Red", m => esc(m.fases)], ["Tomas", m => esc(m.tomas)], ["Salida", m => esc(m.salida)], ["Conectividad", m => esc(m.conectividad)],
      ["Balanceo dinámico", m => yes(m.detalle["Balanceo dinámico"])], ["Carga solar", m => yes(m.detalle["Integración solar"])], ["OCPP", m => yes(m.detalle["OCPP"])], ["RFID", m => yes(m.detalle["RFID"])], ["Contador MID", m => yes(m.detalle["Contador MID"])], ["Protecciones", m => yes(m.detalle["Protecciones integradas"])], ["Versiones", m => m.versiones.length]];
    $("#pd-content").innerHTML = `<div class="cmp-view"><div class="eyebrow">Comparar</div><h2 id="pd-title" style="margin:8px 0 16px">${ms.map(m => esc(m.modelo)).join(" · ")}</h2>
      <label class="cmp-only"><input type="checkbox" id="cmp-only"> Mostrar solo lo que cambia</label>
      <div class="tbl"><table class="cmp-t"><thead><tr><th scope="col"><span class="visually-hidden">Característica</span></th>${ms.map(m => `<th scope="col"><span class="rel-img">${media(m)}</span><small>${esc(m.marca)}</small>${esc(m.modelo)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map(([k, f]) => { const vals = ms.map(m => String(f(m))); const same = vals.every(v => v === vals[0]); return `<tr class="${same ? "same" : "diff"}"><th scope="row">${k}</th>${vals.map(v => `<td>${v}</td>`).join("")}</tr>`; }).join("")}
      <tr><th scope="row"></th>${ms.map(m => `<td><button class="btn btn-primary btn-sm" type="button" data-cmp-quote="${esc(m.id)}">Pedir precio</button></td>`).join("")}</tr></tbody></table></div>
      <a class="pd-call" href="tel:+34671445832"><span>¿No lo tienes claro?</span><b>Llama al 671 44 58 32 y te aconsejamos</b></a></div>`;
    const only = $("#cmp-only"); if (only) only.onchange = () => $(".cmp-t").classList.toggle("only-diff", only.checked);
    $("#pd-content").querySelectorAll("[data-cmp-quote]").forEach(b => b.onclick = () => { const m = byId(b.dataset.cmpQuote); cur = { m }; toForm("instalacion", m, null); });
    if (!dlg().open) dlg().showModal();
  }

  /* ---------- Inicio ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    if (!$("#grid")) return;
    buildFilters(); render();
    // Enlaces directos: catalogo.html#uso-domestico (filtro) o catalogo.html#p-CIR-01 (ficha)
    const fromHash = () => {
      const h = decodeURIComponent(location.hash.slice(1));
      if (h.startsWith("uso-")) window.EVX_setUso(h.slice(4));
      else if (h.startsWith("p-") && byId(h.slice(2))) openProduct(h.slice(2));
    };
    fromHash(); addEventListener("hashchange", fromHash);
    $("#grid").addEventListener("change", e => {
      const c = e.target.closest("[data-cmp]"); if (!c) return;
      c.checked ? cmp.add(c.dataset.cmp) : cmp.delete(c.dataset.cmp); syncCmp();
    });
    const bar = $("#cmp-bar");
    if (bar) bar.addEventListener("click", e => {
      const u = e.target.closest("[data-uncmp]"); if (u) { cmp.delete(u.dataset.uncmp); syncCmp(); }
      if (e.target.closest("#cmp-go")) openCompare();
    });
    $("#grid").addEventListener("click", e => {
      if (e.target.closest("a") || e.target.closest(".cmp-l")) return;
      const o = e.target.closest("[data-open]"), q = e.target.closest("[data-quote]");
      if (q) { const m = byId(q.dataset.quote); cur = { m }; toForm("instalacion", m, null); return; }
      if (o) openProduct(o.dataset.open);
    });
    $("#pd-close").onclick = () => dlg().close();
    dlg().addEventListener("click", e => { if (e.target === dlg()) dlg().close(); });
  });
})();
