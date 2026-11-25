document.addEventListener('DOMContentLoaded', async () => {
  const { api, me, inr, esc, toast } = PH;
  const u = await me(true);
  if (!u) { location.href = 'login.html?next=account.html'; return; }
  document.getElementById('hello').textContent = 'Welcome, ' + u.name;
  const pf = document.getElementById('profile');
  pf.elements.name.value = u.name; pf.elements.phone.value = u.phone || '';
  document.getElementById('email-line').textContent = 'Email: ' + u.email;
  pf.addEventListener('submit', async (e) => { e.preventDefault(); try { await api('/api/auth/me', { method: 'PATCH', body: Object.fromEntries(new FormData(pf).entries()) }); toast('Details saved'); } catch (err) { toast(err.message); } });
  const pw = document.getElementById('pw');
  pw.addEventListener('submit', async (e) => { e.preventDefault(); if (!pw.checkValidity()) { pw.reportValidity(); return; } try { await api('/api/auth/change-password', { method: 'POST', body: Object.fromEntries(new FormData(pw).entries()) }); pw.reset(); toast('Password updated'); } catch (err) { toast(err.message); } });
  document.getElementById('logout').addEventListener('click', async () => { await api('/api/auth/logout', { method: 'POST' }).catch(() => {}); location.href = 'index.html'; });

  const STAGES = ['Awaiting proof', 'Proof approved', 'Printing', 'Shipped', 'Delivered'];
  const box = document.getElementById('orders');
  try {
    const { orders } = await api('/api/orders');
    box.innerHTML = orders.length ? orders.map((o) => {
      const at = Math.max(0, STAGES.indexOf(o.status));
      const date = new Date(o.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      return `<article class="panel" style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px"><div><strong style="font-size:17px">Order ${esc(o.id)}</strong><p class="muted" style="font-size:14px">${date} · ${inr(o.totals.total)} · ${esc(o.payment || '')}</p></div><span class="badge" style="align-self:flex-start">${esc(o.status)}</span></div>
        <ul style="margin:0;padding-left:18px;font-size:14px;display:flex;flex-direction:column;gap:4px">${o.items.map((i) => `<li>${esc(i.name)} — ${Number(i.qty).toLocaleString('en-IN')} pcs, ${esc(i.size)}${i.uploadId ? ` · <a href="/api/uploads/${encodeURIComponent(i.uploadId)}" style="text-decoration:underline">${esc(i.uploadName || 'artwork')}</a>` : i.design ? ' · design service' : ' · artwork to be shared'}</li>`).join('')}</ul>
        <ol style="list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px">${STAGES.map((s, i) => `<li style="display:flex;flex-direction:column;gap:6px"><span style="height:6px;border-radius:3px;background:${i <= at ? 'var(--lagoon)' : 'var(--line)'}"></span><span style="font-size:12px;${i === at ? 'font-weight:700' : 'color:var(--muted)'}">${s}</span></li>`).join('')}</ol>
      </article>`;
    }).join('') : `<div class="panel" style="text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center"><strong style="font-size:18px">No orders yet</strong><a class="btn" href="shop.html">Browse products</a></div>`;
  } catch (err) { box.innerHTML = `<div class="notice">${esc(err.message)}</div>`; }
});
