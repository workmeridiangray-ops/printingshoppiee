document.addEventListener('DOMContentLoaded', () => {
  const { inr, esc } = PH;
  let user = null, orders = [];
  try { user = JSON.parse(localStorage.getItem('ph_user')); orders = JSON.parse(localStorage.getItem('ph_orders')) || []; } catch (e) {}
  if (user && user.name) document.getElementById('hello').textContent = 'Welcome, ' + user.name;
  const STAGES = ['Order placed', 'Proof approved', 'Printing', 'Shipped', 'Delivered'];
  document.getElementById('orders').innerHTML = orders.length ? orders.slice().reverse().map((o) => `
    <article class="panel" style="display:flex;flex-direction:column;gap:14px">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px"><div><strong style="font-size:17px">Order ${esc(o.id)}</strong><p class="muted" style="font-size:14px">${esc(o.date)} · ${o.items.length} item${o.items.length > 1 ? 's' : ''} · ${inr(o.total)} · ${esc(o.payment)}</p></div><span class="badge">${esc(o.status)}</span></div>
      <ul style="margin:0;padding-left:18px;font-size:14px">${o.items.map((i) => `<li>${esc(i.name)} — ${i.qty.toLocaleString('en-IN')} pcs, ${esc(i.size)}</li>`).join('')}</ul>
      <ol style="list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px">${STAGES.map((s, i) => `<li style="display:flex;flex-direction:column;gap:6px"><span style="height:6px;border-radius:3px;background:${i === 0 ? 'var(--lagoon)' : 'var(--line)'}"></span><span style="font-size:12px;${i === 0 ? 'font-weight:700' : 'color:var(--muted)'}">${s}</span></li>`).join('')}</ol>
    </article>`).join('') :
    `<div class="panel" style="text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center"><strong style="font-size:18px">No orders yet</strong><p class="muted">Orders placed on this device show up here.</p><a class="btn" href="shop.html">Browse products</a></div>`;
});
