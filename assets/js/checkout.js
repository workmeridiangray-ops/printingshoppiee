document.addEventListener('DOMContentLoaded', () => {
  const { cart, inr, esc, art, S, toast, api, me } = PH;
  const form = document.getElementById('checkout-form');
  const items = cart.items();
  if (!items.length) { location.href = 'cart.html'; return; }

  const SHIPS = [
    { id: 'standard', t: 'Standard delivery', d: 'Dispatch 2–3 working days after proof approval · tracked' },
    { id: 'express', t: 'Express', d: 'Priority printing · dispatch next working day', fee: S.expressFee },
    { id: 'pickup', t: 'Pick up from a branch', d: 'Collect from your nearest branch', fee: 0 }
  ];
  let ship = 'standard';
  const sub = items.reduce((a, i) => a + i.price, 0);
  const gst = Math.round(sub * S.gstRate);
  const shipFee = () => ship === 'express' ? S.expressFee : ship === 'pickup' ? 0 : (sub >= S.freeShippingAbove ? 0 : S.shippingFee);
  const total = () => sub + gst + shipFee();

  // prefill from signed-in account
  me().then((u) => { if (u) ['name', 'phone', 'email'].forEach((k) => { if (u[k] && !form.elements[k].value) form.elements[k].value = u[k]; }); });

  document.getElementById('ship-options').innerHTML = SHIPS.map((s) => `
    <label class="radio-card"><input type="radio" name="ship" value="${s.id}" ${s.id === ship ? 'checked' : ''}><span><strong>${s.t}</strong><small>${s.d}</small></span><strong id="fee-${s.id}"></strong></label>`).join('');
  form.querySelectorAll('input[name=ship]').forEach((r) => r.addEventListener('change', () => { ship = r.value; render(); }));
  document.getElementById('gst-toggle').addEventListener('change', (e) => { document.getElementById('gst-fields').hidden = !e.target.checked; });

  const online = !!S.razorpayKey;
  document.getElementById('pay-note').innerHTML = online
    ? 'Pay securely with UPI, cards or net banking via Razorpay.'
    : 'Place your order and we\'ll confirm it on WhatsApp with a payment link (UPI, cards or net banking).';

  function render() {
    document.getElementById('fee-standard').textContent = sub >= S.freeShippingAbove ? 'Free' : inr(S.shippingFee);
    document.getElementById('fee-express').textContent = '+ ' + inr(S.expressFee);
    document.getElementById('fee-pickup').textContent = 'Free';
    document.getElementById('pay-btn').textContent = (online ? 'Pay ' : 'Place order · ') + inr(total());
    document.getElementById('checkout-summary').innerHTML = `
      <h2 style="font-size:22px;margin-bottom:14px">Your order</h2>
      <div style="display:flex;flex-direction:column;gap:12px;margin-bottom:14px">${items.map((i) => `
        <div style="display:flex;gap:12px;align-items:center"><div class="art tint" style="width:64px;height:56px;border-radius:4px;flex:none">${art(i.kind)}</div>
        <div style="flex:1;min-width:0;font-size:14px"><strong>${esc(i.name)}</strong><br><span class="muted">${i.qty.toLocaleString('en-IN')} pcs · ${esc(i.size)}</span></div><strong style="font-size:14px">${inr(i.price)}</strong></div>`).join('')}</div>
      <div class="sum-rows" style="font-size:14px;border-top:1px solid var(--line);padding-top:14px"><div><span class="muted">Subtotal</span><span>${inr(sub)}</span></div><div><span class="muted">GST</span><span>${inr(gst)}</span></div><div><span class="muted">Delivery</span><span>${shipFee() ? inr(shipFee()) : 'Free'}</span></div></div>
      <div class="sum-total"><strong>Total</strong><strong>${inr(total())}</strong></div>`;
  }
  render();

  async function saveOrder(payment) {
    const f = new FormData(form);
    const customer = Object.fromEntries(f.entries());
    delete customer.ship;
    const payload = { customer, items, totals: { sub, gst, ship: shipFee(), total: total() }, ship, payment };
    let id;
    try { id = (await api('/api/orders', { method: 'POST', body: payload })).id; }
    catch (e) { id = 'PH' + Date.now().toString().slice(-7); }
    return { id, items, total: total(), ship, payment, customer };
  }
  function orderText(o) {
    const c = o.customer;
    let t = `New order ${o.id}\n\n`;
    o.items.forEach((i, n) => { t += `${n + 1}. ${i.name} — ${i.qty} pcs, ${i.size}${i.options ? ', ' + i.options.replace(/ \| /g, ', ') : ''}${i.design ? ' (design service)' : ''} — ₹${i.price}\n`; });
    const arts = o.items.filter((i) => i.uploadName).map((i) => i.uploadName);
    if (arts.length) t += `\nArtwork uploaded: ${arts.join(', ')}`;
    t += `\nSubtotal ₹${sub} + GST ₹${gst} + delivery ₹${shipFee()} = ₹${o.total}\nDelivery: ${ship}\nPayment: ${o.payment}\n\n${c.name}, ${c.phone}, ${c.email}\n${c.address}, ${c.city}, ${c.state} ${c.pincode}`;
    if (c.gstin) t += `\nGSTIN: ${c.gstin} (${c.company || ''})`;
    return t;
  }
  function finish(o) {
    cart.clear();
    location.href = 'order-placed.html?id=' + encodeURIComponent(o.id);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (online) {
      const go = () => {
        const f = new FormData(form);
        const rzp = new window.Razorpay({
          key: S.razorpayKey, amount: total() * 100, currency: 'INR', name: S.brand,
          description: items.length + ' print item(s)',
          prefill: { name: f.get('name'), email: f.get('email'), contact: f.get('phone') },
          theme: { color: '#1E5066' },
          handler: async (resp) => { const o = await saveOrder('Paid online (' + resp.razorpay_payment_id + ')'); window.open('https://wa.me/' + S.whatsapp + '?text=' + encodeURIComponent(orderText(o)), '_blank'); finish(o); }
        });
        rzp.open();
      };
      if (window.Razorpay) go();
      else { const s = document.createElement('script'); s.src = 'https://checkout.razorpay.com/v1/checkout.js'; s.onload = go; s.onerror = () => toast('Payment could not load. Please try again.'); document.body.appendChild(s); }
    } else {
      const btn = document.getElementById('pay-btn'); btn.disabled = true; btn.textContent = 'Placing order…';
      const waWin = window.open('', '_blank');
      const o = await saveOrder('Payment link on WhatsApp');
      const waUrl = 'https://wa.me/' + S.whatsapp + '?text=' + encodeURIComponent(orderText(o));
      if (waWin) waWin.location.href = waUrl; else window.open('https://wa.me/' + S.whatsapp + '?text=' + encodeURIComponent(orderText(o)), '_blank');
      finish(o);
    }
  });
});
