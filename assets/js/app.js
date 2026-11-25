/* Shared layout, cart storage and helpers. */
(function () {
  const S = window.SITE;
  const CATS = ['Stickers & Labels', 'Boxes', 'Packaging', 'Cards & Stationery', 'Marketing', 'Gifting & Merch', 'Ready to Ship', 'Bulk / B2B'];

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const inr = (n, d) => '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 0 });
  const price = (n) => Math.round(n * (S.priceMultiplier || 1));
  const catUrl = (c) => 'shop.html?cat=' + encodeURIComponent(c);

  // ---- cart ----
  const KEY = 'ph_cart_v1';
  const cart = {
    items() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } },
    save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {} updateCount(); },
    add(item) { const l = cart.items(); item.id = Date.now() + '-' + Math.random().toString(36).slice(2, 7); l.push(item); cart.save(l); },
    remove(id) { cart.save(cart.items().filter((i) => i.id !== id)); },
    clear() { cart.save([]); }
  };
  function updateCount() {
    document.querySelectorAll('[data-cart-count]').forEach((el) => { el.textContent = cart.items().length; });
  }

  // ---- product illustration (placeholder until real photos) ----
  function art(kind) {
    const ink = '#1E5066', acc = '#417D7A', sage = '#B1C8A3', w = '#FFFFFF';
    const svgs = {
      sticker: `<g transform="rotate(-10 70 60)"><rect x="38" y="28" width="64" height="64" rx="14" fill="${ink}"/><path d="M54 60l10 10 20-22" stroke="${sage}" stroke-width="6" fill="none" stroke-linecap="round"/></g><circle cx="124" cy="76" r="42" fill="${acc}"/><circle cx="124" cy="76" r="33" fill="none" stroke="${w}" stroke-width="2" stroke-dasharray="4 5"/><rect x="104" y="70" width="40" height="6" rx="3" fill="${w}"/>`,
      label: `<rect x="82" y="12" width="36" height="16" rx="3" fill="${ink}"/><path d="M86 28H114V42C130 48 136 58 136 72V130H64V72C64 58 70 48 86 42Z" fill="${ink}" opacity=".88"/><rect x="64" y="74" width="72" height="40" fill="${sage}"/><rect x="76" y="86" width="48" height="6" rx="3" fill="${ink}"/><rect x="84" y="97" width="32" height="4" rx="2" fill="${ink}" opacity=".6"/>`,
      box: `<polygon points="100,18 162,46 100,74 38,46" fill="${sage}"/><polygon points="38,46 100,74 100,126 38,98" fill="${ink}"/><polygon points="100,74 162,46 162,98 100,126" fill="${acc}"/><polygon points="112,86 150,69 150,82 112,99" fill="${w}" opacity=".9"/>`,
      bag: `<path d="M78 46C78 22 122 22 122 46" fill="none" stroke="${ink}" stroke-width="5"/><path d="M56 42H144L152 126H48Z" fill="${acc}"/><circle cx="100" cy="88" r="17" fill="none" stroke="${w}" stroke-width="4"/>`,
      tape: `<rect x="80" y="92" width="96" height="26" fill="${acc}"/><circle cx="80" cy="72" r="46" fill="${acc}"/><circle cx="80" cy="72" r="22" fill="#F2F7EA"/><circle cx="80" cy="72" r="22" fill="none" stroke="${ink}" stroke-width="3"/>`,
      card: `<rect x="36" y="34" width="108" height="66" rx="6" fill="${ink}" transform="rotate(-9 90 67)"/><rect x="58" y="44" width="108" height="66" rx="6" fill="${w}" stroke="#E1E7DE"/><circle cx="78" cy="64" r="8" fill="${acc}"/><rect x="72" y="84" width="54" height="6" rx="3" fill="${ink}"/>`,
      tag: `<path d="M100 10C86 10 78 22 92 34" fill="none" stroke="${ink}" stroke-width="2.5"/><g transform="rotate(-8 100 80)"><path d="M78 30H122L136 46V130H64V46Z" fill="${acc}"/><circle cx="100" cy="46" r="6" fill="#F2F7EA"/><rect x="78" y="70" width="44" height="6" rx="3" fill="${w}"/></g>`,
      postcard: `<g transform="rotate(5 100 72)"><rect x="28" y="28" width="144" height="88" rx="4" fill="${w}" stroke="#E1E7DE"/><rect x="36" y="36" width="64" height="72" fill="${sage}"/><path d="M36 108L58 78L74 96L84 86L100 108Z" fill="${ink}"/><line x1="110" y1="80" x2="162" y2="80" stroke="${ink}" stroke-opacity=".4" stroke-width="2"/><line x1="110" y1="92" x2="162" y2="92" stroke="${ink}" stroke-opacity=".4" stroke-width="2"/></g>`,
      poster: `<rect x="48" y="18" width="74" height="104" rx="3" fill="${ink}" transform="rotate(-7 85 70)"/><rect x="80" y="16" width="74" height="104" rx="3" fill="${w}" stroke="#E1E7DE"/><circle cx="117" cy="52" r="20" fill="${acc}"/><rect x="92" y="84" width="50" height="7" rx="3.5" fill="${ink}"/>`
    };
    return `<svg viewBox="0 0 200 140" aria-hidden="true">${svgs[kind] || svgs.poster}</svg>`;
  }

  // ---- layout ----
  function header() {
    const q = new URLSearchParams(location.search).get('q') || '';
    return `
<div class="topbar"><div class="wrap">
  <span>Free design check on every order · GST invoice included · Delivery across India</span>
  <nav aria-label="Quick links"><a href="tel:${esc(S.phone.replace(/\s/g, ''))}">Call ${esc(S.phone)}</a><a href="account.html">Track order</a><a href="bulk.html">Bulk enquiry</a><a href="help.html">Help</a></nav>
</div></div>
<header class="header">
  <div class="wrap header-main">
    <a class="logo" href="index.html" aria-label="${esc(S.brand)} home">print<span>haus</span></a>
    <form class="search" action="shop.html" role="search">
      <label class="sr-only" for="q">Search products</label>
      <input id="q" name="q" type="search" value="${esc(q)}" placeholder="Search stickers, visiting cards, boxes…">
      <button type="submit">Search</button>
    </form>
    <div class="header-actions">
      <a href="login.html">Sign in</a>
      <a class="cart-link" href="cart.html">Cart <span class="cart-count" data-cart-count>0</span></a>
    </div>
  </div>
  <nav class="catnav" aria-label="Product categories"><div class="wrap">
    ${CATS.slice(0, 7).map((c) => `<a href="${catUrl(c)}">${esc(c)}</a>`).join('')}
    <a href="shop.html">All products</a>
    <a class="bulk" href="bulk.html">Bulk pricing →</a>
  </div></nav>
</header>`;
  }
  function footer() {
    return `
<footer class="footer"><div class="wrap">
  <div class="footer-grid">
    <div><span class="logo">print<span>haus</span></span>
      <p style="opacity:.85;max-width:320px">Custom printing and packaging for Indian brands. 25 years in print, 34 branches across India.</p>
      <span>WhatsApp / Call: ${esc(S.phone)}</span><span>${esc(S.email)}</span><span>${esc(S.hours)}</span></div>
    <div><h4>Shop</h4>${CATS.slice(0, 5).map((c) => `<a href="${catUrl(c)}">${esc(c)}</a>`).join('')}<a href="shop.html">All products</a></div>
    <div><h4>Help</h4><a href="account.html">Track your order</a><a href="help.html#artwork">Artwork guidelines</a><a href="help.html#delivery">Shipping &amp; delivery</a><a href="help.html#policies">Reprints &amp; refunds</a><a href="help.html#contact">Contact us</a></div>
    <div><h4>Company</h4><a href="about.html">About us</a><a href="about.html#branches">Our branches</a><a href="bulk.html">Business orders</a><a href="help.html#policies">Privacy &amp; terms</a></div>
  </div>
  <div class="footer-bottom">
    <div class="paychips"><span>UPI</span><span>Visa</span><span>Mastercard</span><span>RuPay</span><span>Net banking</span><span>Secured by Razorpay</span></div>
    <span style="opacity:.75">© ${new Date().getFullYear()} ${esc(S.legalName)} · GSTIN ${esc(S.gstin)}</span>
  </div>
</div></footer>`;
  }
  function toast(msg) {
    const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg;
    document.body.appendChild(t); setTimeout(() => t.remove(), 2600);
  }

  // ---- data ----
  let catalogP = null;
  const catalog = () => catalogP || (catalogP = fetch('data/catalog.json').then((r) => r.json()));
  const prices = (file) => fetch('data/prices/' + encodeURIComponent(file) + '.json').then((r) => { if (!r.ok) throw new Error('missing'); return r.json(); });

  function card(c) {
    return `<a class="card" href="product.html?p=${encodeURIComponent(c.slug)}">
      <div class="art">${art(c.kind)}</div>
      <div class="card-body">
        <span class="card-cat">${esc(c.cat)}</span>
        <span class="card-name">${esc(c.name)}</span>
        <span class="card-meta">Min. ${c.moq.toLocaleString('en-IN')} pcs · ${c.sizes} ${c.sizes === 1 ? 'size' : 'sizes'}</span>
        <span class="card-foot"><span class="muted" style="font-size:13px">Starting <strong style="color:var(--ink)">${inr(price(c.from))}</strong></span><span class="go">Customise →</span></span>
      </div></a>`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const h = document.getElementById('site-header'); if (h) h.innerHTML = header();
    const f = document.getElementById('site-footer'); if (f) f.innerHTML = footer();
    updateCount();
  });

  window.PH = { S, CATS, esc, inr, price, catUrl, cart, art, toast, catalog, prices, card };
})();
