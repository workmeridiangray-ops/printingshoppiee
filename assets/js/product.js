document.addEventListener('DOMContentLoaded', () => {
  const { catalog, prices, art, inr, price, esc, cart, toast, card, catUrl, S, uploadFile, fmtSize, imgUrl } = PH;
  const slug = new URLSearchParams(location.search).get('p') || 'product-labels';
  const parse = (o) => { const m = {}; String(o).split(' | ').forEach((p) => { const i = p.indexOf(': '); if (i > 0) m[p.slice(0, i)] = p.slice(i + 2); }); return m; };
  const box = document.getElementById('p-options');
  catalog().then((all) => {
    const meta = all.find((c) => c.slug === slug);
    if (!meta) { document.getElementById('p-name').textContent = 'Product not found'; box.innerHTML = '<a class="btn" href="shop.html">Browse all products</a>'; return; }
    document.title = meta.name + ' — Print Haus';
    document.getElementById('p-name').textContent = meta.name;
    document.getElementById('p-cat').textContent = meta.cat;
    document.getElementById('crumb-name').textContent = meta.name;
    const cc = document.getElementById('crumb-cat'); cc.textContent = meta.cat; cc.href = catUrl(meta.cat);
    document.getElementById('p-meta').textContent = `Minimum order ${meta.moq.toLocaleString('en-IN')} pcs · ${meta.sizes} ${meta.sizes === 1 ? 'size' : 'sizes'} · free design check before printing`;
    const pa = document.getElementById('p-art');
    if (meta.imgs.length) {
      pa.classList.remove('tint'); pa.style.background = '#fff';
      pa.innerHTML = `<img id="p-main" src="${imgUrl(meta.imgs[0])}" alt="${esc(meta.name)}" style="width:100%;height:100%;object-fit:cover">`;
      if (meta.imgs.length > 1) {
        const th = document.createElement('div'); th.className = 'thumbs';
        th.innerHTML = meta.imgs.map((f, i) => `<button type="button" aria-label="View photo ${i + 1}" aria-pressed="${i === 0}" data-i="${i}"><img src="${imgUrl(f, true)}" alt="" loading="lazy"></button>`).join('');
        pa.after(th);
        th.addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; document.getElementById('p-main').src = imgUrl(meta.imgs[+b.dataset.i]); th.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', x === b)); });
      }
    } else pa.innerHTML = art(meta.kind);
    document.getElementById('p-related').innerHTML = all.filter((c) => c.cat === meta.cat && c.slug !== slug).slice(0, 4).map(card).join('');

    prices(meta.file).then((d) => {
      const st = { si: d.r[0][0], sel: {}, q: null, design: false, upload: null };
      function render() {
        const rows = d.r.filter((r) => r[0] === st.si);
        let best = rows[0], score = -1;
        rows.forEach((r) => { const m = parse(d.o[r[1]]); const sc = Object.keys(st.sel).filter((k) => m[k] === st.sel[k]).length; if (sc > score) { best = r; score = sc; } });
        const cur = parse(d.o[best[1]]);
        const keys = [];
        rows.forEach((r) => Object.keys(parse(d.o[r[1]])).forEach((k) => { if (!keys.includes(k)) keys.push(k); }));
        const sizesAvail = d.s.map((s, i) => ({ s, i })).filter((x) => d.r.some((r) => r[0] === x.i));
        const tiers = best[2];
        let qi = tiers.findIndex((t) => t[0] === st.q); if (qi < 0) qi = 0;
        const [q, raw] = tiers[qi];
        const sub = price(raw) + (st.design ? S.designServiceFee : 0);
        const gst = Math.round(sub * S.gstRate);
        const firstUnit = price(tiers[0][1]) / tiers[0][0];
        let html = '';
        html += `<label class="field">Size<select id="p-size">${sizesAvail.map((x) => `<option value="${x.i}" ${x.i === st.si ? 'selected' : ''}>${esc(x.s)}</option>`).join('')}</select></label>`;
        keys.forEach((k) => {
          const vals = []; rows.forEach((r) => { const v = parse(d.o[r[1]])[k]; if (v && !vals.includes(v)) vals.push(v); });
          if (vals.length < 2) { if (vals[0]) html += `<p class="muted" style="font-size:14px"><strong style="color:var(--ink)">${esc(k)}:</strong> ${esc(vals[0])}</p>`; return; }
          html += `<fieldset class="opt-group"><legend>${esc(k)}</legend><div class="pills">${vals.map((v) => `<button type="button" class="pill" data-k="${esc(k)}" data-v="${esc(v)}" aria-pressed="${cur[k] === v}">${esc(v)}</button>`).join('')}</div></fieldset>`;
        });
        html += `<div style="display:flex;flex-direction:column;gap:8px"><strong style="font-size:14px">Quantity</strong><div class="tiers">${tiers.map(([qq, tt], i) => {
          const u = price(tt) / qq, sv = i ? Math.round((1 - u / firstUnit) * 100) : 0;
          return `<button type="button" class="tier" data-q="${qq}" aria-pressed="${i === qi}"><strong>${qq.toLocaleString('en-IN')} pcs</strong><span class="muted">${inr(u, 2)} / pc</span><span>${sv > 0 ? `<span class="save">Save ${sv}%</span>` : ''}<strong>${inr(price(tt))}</strong></span></button>`;
        }).join('')}</div></div>`;
        html += `<fieldset class="opt-group"><legend>Your design</legend>
          <label class="radio-card"><input type="radio" name="design" value="own" ${!st.design ? 'checked' : ''}><span><strong>I have my artwork</strong><small>Upload it now, or later from your cart</small></span></label>
          ${!st.design ? `<label class="upload" id="up-box"><input type="file" id="up-input" accept=".pdf,.ai,.eps,.cdr,.psd,.svg,.png,.jpg,.jpeg,.tif,.tiff,.zip">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true" style="flex:none"><path d="M12 16V4M7 9l5-5 5 5"/><path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>
            <span style="display:flex;flex-direction:column"><strong id="up-title">${st.upload ? '✓ ' + esc(st.upload.filename) : 'Upload artwork'}</strong><small class="muted" id="up-sub">${st.upload ? fmtSize(st.upload.size) + ' · click to replace' : 'PDF, AI, CDR, PSD, PNG, JPG, TIFF or ZIP · up to 50 MB'}</small></span></label>` : ''}
          <label class="radio-card"><input type="radio" name="design" value="hire" ${st.design ? 'checked' : ''}><span><strong>Design it for me · +${inr(S.designServiceFee)}</strong><small>Send your logo and text, we set it up</small></span></label></fieldset>`;
        html += `<div class="summary">
          <div class="row"><span style="opacity:.85">${q.toLocaleString('en-IN')} pcs · ${esc(d.s[st.si])}${st.design ? ' · design service' : ''}</span><span>${inr(sub)}</span></div>
          <div class="row"><span style="opacity:.85">GST ${Math.round(S.gstRate * 100)}%</span><span>${inr(gst)}</span></div>
          <div class="row total"><strong>Total</strong><strong>${inr(sub + gst)}</strong></div>
          <span style="font-size:12px;opacity:.85">${inr((sub + gst) / q, 2)} per piece incl. GST · dispatch 2–3 working days after proof approval</span>
          <div class="actions"><button type="button" class="btn btn-light btn-lg" style="flex:1" id="add-cart">Add to cart</button><button type="button" class="btn btn-outline btn-lg" style="background:transparent;color:#fff;border-color:rgba(255,255,255,.55)" id="buy-now">Buy now</button></div>
        </div>`;
        box.innerHTML = html;
        document.getElementById('p-size').addEventListener('change', (e) => { st.si = Number(e.target.value); render(); });
        box.querySelectorAll('.pill').forEach((b) => b.addEventListener('click', () => { st.sel = { ...cur, [b.dataset.k]: b.dataset.v }; render(); }));
        box.querySelectorAll('.tier').forEach((b) => b.addEventListener('click', () => { st.q = Number(b.dataset.q); render(); }));
        box.querySelectorAll('input[name=design]').forEach((r) => r.addEventListener('change', () => { st.design = r.value === 'hire'; render(); }));
        const upIn = document.getElementById('up-input');
        if (upIn) upIn.addEventListener('change', () => {
          const f = upIn.files[0]; if (!f) return;
          const t = document.getElementById('up-title'), sb = document.getElementById('up-sub');
          t.textContent = 'Uploading ' + f.name + '…'; sb.textContent = '0%';
          uploadFile(f, (pc) => { sb.textContent = pc + '%'; })
            .then((u) => { st.upload = u; toast('Artwork uploaded'); render(); })
            .catch((e) => { t.textContent = 'Upload artwork'; sb.textContent = e.message; });
        });
        const add = () => cart.add({ slug, name: meta.name, kind: meta.kind, img: meta.imgs[0] || null, size: d.s[st.si], options: d.o[best[1]] === 'Standard' ? '' : d.o[best[1]], qty: q, design: st.design, price: sub, uploadId: !st.design && st.upload ? st.upload.id : null, uploadName: !st.design && st.upload ? st.upload.filename : null });
        document.getElementById('add-cart').addEventListener('click', () => { add(); toast('Added to cart'); });
        document.getElementById('buy-now').addEventListener('click', () => { add(); location.href = 'checkout.html'; });
      }
      render();
    }).catch(() => { box.innerHTML = '<div class="notice">Prices could not load. Please refresh, or WhatsApp us for a quote.</div>'; });
  });
});
