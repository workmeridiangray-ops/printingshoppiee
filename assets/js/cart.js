document.addEventListener('DOMContentLoaded', () => {
  const { cart, art, inr, esc, S, uploadFile, toast } = PH;
  function totals(items) {
    const sub = items.reduce((a, i) => a + i.price, 0);
    const gst = Math.round(sub * S.gstRate);
    const ship = !items.length || sub >= S.freeShippingAbove ? 0 : S.shippingFee;
    return { sub, gst, ship, total: sub + gst + ship };
  }
  function render() {
    const items = cart.items();
    const t = totals(items);
    document.getElementById('cart-items').innerHTML = items.length ? items.map((i) => `
      <article class="line-item">
        <div class="art tint">${art(i.kind)}</div>
        <div class="info">
          <div class="top"><h2 style="font-size:18px">${esc(i.name)}</h2><strong>${inr(i.price)}</strong></div>
          <span class="muted" style="font-size:14px">${i.qty.toLocaleString('en-IN')} pcs · ${esc(i.size)}${i.options ? ' · ' + esc(i.options.replace(/ \| /g, ' · ')) : ''}</span>
          ${i.design ? '<span class="badge" style="align-self:flex-start">Design service added</span>' : i.uploadId ? `<span class="badge" style="align-self:flex-start">✓ Artwork: ${esc(i.uploadName)}</span>` : `<label class="upload" style="padding:10px 12px"><input type="file" data-up="${i.id}" accept=".pdf,.ai,.eps,.cdr,.psd,.svg,.png,.jpg,.jpeg,.tif,.tiff,.zip"><span style="display:flex;flex-direction:column"><strong id="ut-${i.id}" style="font-size:14px">Upload artwork for this item</strong><small class="muted" id="us-${i.id}">Optional now — you can also send it on WhatsApp</small></span></label>`}
          <div style="display:flex;gap:18px;padding-top:4px"><a href="product.html?p=${encodeURIComponent(i.slug)}" style="font-weight:600;text-decoration:underline">Order another</a><button class="linkbtn" data-rm="${i.id}">Remove</button></div>
        </div>
      </article>`).join('') :
      `<div class="panel" style="text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center"><strong style="font-size:18px">Your cart is empty</strong><a class="btn" href="shop.html">Browse products</a></div>`;
    document.getElementById('cart-summary').innerHTML = `
      <h2 style="font-size:22px;margin-bottom:16px">Order summary</h2>
      <div class="sum-rows"><div><span class="muted">Subtotal</span><span>${inr(t.sub)}</span></div><div><span class="muted">GST (${Math.round(S.gstRate * 100)}%)</span><span>${inr(t.gst)}</span></div><div><span class="muted">Delivery</span><span>${t.ship ? inr(t.ship) : 'Free'}</span></div></div>
      ${t.ship ? `<p class="muted" style="font-size:13px;margin-top:8px">Free delivery above ${inr(S.freeShippingAbove)}</p>` : ''}
      <div class="sum-total"><strong>Total</strong><strong>${inr(t.total)}</strong></div>
      <a class="btn btn-lg btn-block" style="margin-top:16px" href="${items.length ? 'checkout.html' : 'shop.html'}">${items.length ? 'Proceed to checkout' : 'Start shopping'}</a>
      <p class="muted" style="font-size:13px;text-align:center;margin-top:10px">Secure payment · proof before print</p>`;
    document.querySelectorAll('[data-up]').forEach((inp) => inp.addEventListener('change', () => {
      const f = inp.files[0], id = inp.dataset.up; if (!f) return;
      document.getElementById('ut-' + id).textContent = 'Uploading ' + f.name + '…';
      uploadFile(f, (pc) => { document.getElementById('us-' + id).textContent = pc + '%'; })
        .then((u) => { cart.update(id, { uploadId: u.id, uploadName: u.filename }); toast('Artwork uploaded'); render(); })
        .catch((e) => { document.getElementById('ut-' + id).textContent = 'Upload artwork for this item'; document.getElementById('us-' + id).textContent = e.message; });
    }));
    document.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => { cart.remove(b.dataset.rm); render(); }));
  }
  render();
  window.PH.cartTotals = totals;
});
