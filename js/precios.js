/* Página de precios: tabla de "equipo desde" generada del catálogo (precios sin IVA en los datos; aquí con IVA) */
(function () {
  const D = window.EVX_CATALOGO, tb = document.querySelector("#price-table tbody");
  if (!D || !tb) return;
  const eurIva = v => { const n = Math.round(v * 121) / 100, d = Math.abs(n % 1) > 0.004 ? 2 : 0, [i, c] = n.toFixed(d).split("."); return i.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (c ? "," + c : "") + " €"; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const td = "padding:10px 12px;border-bottom:1px solid var(--line)";
  const rows = D.modelos.filter(m => !m.tags.includes("accesorio") && m.desde).sort((a, b) => a.desde - b.desde);
  tb.innerHTML = rows.map(m => `<tr><td style="${td}"><a href="catalogo.html#p-${esc(m.id)}">${esc(m.marca)} ${esc(m.modelo)}</a></td><td style="${td};color:var(--slate-600)">${esc(m.categoria)}</td><td style="${td};text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap"><b>${eurIva(m.desde)}</b></td></tr>`).join("");
})();
