/* Página de precios: tabla de "equipo desde" generada del catálogo (precios sin IVA en los datos; aquí con IVA en grande y sin IVA al lado) */
(function () {
  const D = window.EVX_CATALOGO, tb = document.querySelector("#price-table tbody");
  if (!D || !tb) return;
  const eur = v => { const n = Math.round(v * 100) / 100, d = Math.abs(n % 1) > 0.004 ? 2 : 0, [i, c] = n.toFixed(d).split("."); return i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (c ? "," + c : "") + " €"; };
  const eurIva = v => eur(Math.round(v * 121) / 100);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const rows = D.modelos.filter(m => !m.tags.includes("accesorio") && m.desde).sort((a, b) => a.desde - b.desde);
  // Tipo: número de tomas (lo que distingue a los cargadores de casa y garaje comunitario) o torre de exterior
  const tomas = m => { const t = [...new Set([m.tomas, ...m.versiones.map(v => v.tomas)].join(" ").match(/\d+/g) || [])].sort(); return t.length > 1 ? t.join(" o ") + " tomas" : t[0] === "1" ? "1 toma" : (t[0] || "") + " tomas"; };
  const tipo = m => m.tags.includes("exterior") ? "Torre de exterior · " + tomas(m) : tomas(m) + (m.tags.includes("empresa") ? " · también para empresas" : "");
  tb.innerHTML = rows.map(m => `<tr><td><a href="catalogo.html#p-${esc(m.id)}">${esc(m.marca)} ${esc(m.modelo)}</a><small class="tp">${esc(tipo(m))}</small></td><td>${esc(tipo(m))}</td><td><b>${eurIva(m.desde)}</b><small>${eur(m.desde)} sin IVA</small></td></tr>`).join("");
})();
