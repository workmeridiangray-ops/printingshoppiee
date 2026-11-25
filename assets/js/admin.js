document.addEventListener('DOMContentLoaded', () => {
  const { inr, esc, toast } = PH;
  const STATUSES = ['Awaiting proof', 'Proof sent', 'Proof approved', 'Printing', 'Shipped', 'Delivered', 'Cancelled'];
  let key = sessionStorage.getItem('ph_admin') || '';
  let all = [];
  const call = async (path, opts = {}) => {
    const r = await fetch(path, { ...opts, headers: { 'x-admin-key': key, 'content-type': 'application/json', ...(opts.headers || {}) } });
    const d = await r.json().catch(() => ({})); if (!r.ok) throw new Error(d.error || 'Request failed'); return d;
  };
  function render() {
    const f = document.getElementById('filter').value.toLowerCase();
    const list = all.filter((o) => !f || JSON.stringify([o.id, o.customer, o.account_email]).toLowerCase().includes(f));
    document.getElementById('admin-orders').innerHTML = list.map((o) => {
      const c = o.customer || {};
      return `<article class="panel" style="display:flex;flex-direction:column;gap:10px">
        <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;align-items:center">
          <div><strong>${esc(o.id)}</strong> · ${new Date(o.created_at).toLocaleString('en-IN')} · <strong>${inr(o.totals.total)}</strong> · ${esc(o.payment || '')}</div>
          <select data-id="${esc(o.id)}" style="height:40px;border:1.5px solid var(--line);border-radius:4px;padding:0 8px">${STATUSES.map((s) => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}</select>
        </div>
        <div style="font-size:14px">${esc(c.name || '')} · <a href="tel:${esc(c.phone || '')}">${esc(c.phone || '')}</a> · ${esc(c.email || '')}${o.account_email ? ' · account' : ' · guest'}<br>${esc([c.address, c.city, c.state, c.pincode].filter(Boolean).join(', '))} · delivery: ${esc(o.ship || '')}${c.gstin ? `<br>GSTIN ${esc(c.gstin)} — ${esc(c.company || '')}` : ''}</div>
        <ul style="margin:0;padding-left:18px;font-size:14px">${o.items.map((i) => `<li>${esc(i.name)} — ${i.qty} pcs, ${esc(i.size)}${i.options ? ', ' + esc(i.options) : ''} — ${inr(i.price)}${i.design ? ' · <strong>design service</strong>' : ''}${i.uploadId ? ` · <a href="/api/admin/uploads/${encodeURIComponent(i.uploadId)}?key=${encodeURIComponent(key)}" style="text-decoration:underline;font-weight:700">⬇ ${esc(i.uploadName || 'artwork')}</a>` : i.design ? '' : ' · <em>no artwork uploaded</em>'}</li>`).join('')}</ul>
      </article>`;
    }).join('') || '<div class="notice">No orders.</div>';
    document.querySelectorAll('select[data-id]').forEach((s) => s.addEventListener('change', async () => {
      try { await call('/api/admin/orders/' + encodeURIComponent(s.dataset.id), { method: 'PATCH', body: JSON.stringify({ status: s.value }) }); toast('Status updated'); } catch (e) { toast(e.message); }
    }));
  }
  async function load() {
    const [o, st] = await Promise.all([call('/api/admin/orders'), call('/api/admin/stats')]);
    all = o.orders;
    document.getElementById('stats').innerHTML = `<div><strong>${st.orders}</strong><span>orders</span></div><div><strong>${st.users}</strong><span>accounts</span></div><div><strong>${st.uploads}</strong><span>artwork files</span></div><div><strong>${(st.upload_bytes / 1048576).toFixed(1)} MB</strong><span>file storage used</span></div>`;
    document.getElementById('key-form').hidden = true; document.getElementById('admin').hidden = false; render();
  }
  document.getElementById('key-form').addEventListener('submit', (e) => {
    e.preventDefault(); key = new FormData(e.target).get('key'); sessionStorage.setItem('ph_admin', key);
    load().catch((err) => { toast(err.message); sessionStorage.removeItem('ph_admin'); });
  });
  document.getElementById('filter').addEventListener('input', render);
  document.getElementById('refresh').addEventListener('click', () => load().catch((e) => toast(e.message)));
  if (key) load().catch(() => sessionStorage.removeItem('ph_admin'));
});
