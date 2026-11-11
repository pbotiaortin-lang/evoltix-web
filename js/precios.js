/* Página de precios: tabla de "equipo desde" generada del catálogo (precios sin IVA en los datos; aquí con IVA en grande y sin IVA al lado) */
(function () {
  const D = window.EVX_CATALOGO, tb = document.querySelector("#price-table tbody");
  if (!D || !tb) return;
  const eur = v => { const n = Math.round(v * 100) / 100, d = Math.abs(n % 1) > 0.004 ? 2 : 0, [i, c] = n.toFixed(d).split("."); return i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (c ? "," + c : "") + " €"; };
  const eurIva = v => eur(Math.round(v * 121) / 100);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const rows = D.modelos.filter(m => !m.tags.includes("accesorio") && m.desde).sort((a, b) => a.desde - b.desde);
  tb.innerHTML = rows.map(m => `<tr><td><a href="catalogo.html#p-${esc(m.id)}">${esc(m.marca)} ${esc(m.modelo)}</a></td><td>${esc(m.categoria)}</td><td><b>${eurIva(m.desde)}</b><small>${eur(m.desde)} sin IVA</small></td></tr>`).join("");
})();
