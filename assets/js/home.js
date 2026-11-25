document.addEventListener('DOMContentLoaded', () => {
  const { art, catalog, card, catUrl, inr, price, esc, CATS } = PH;
  document.getElementById('hero-art').innerHTML = art('sticker');
  const POP = ['product-labels', 'mailer-box', 'standard-business-cards', 'custompaperbox', 'premium-paper-bag', 'bottle-jar-labels', 'flat-thank-you-cards', 'hang-tags'];
  const KIND = { 'Stickers & Labels': 'sticker', 'Boxes': 'box', 'Packaging': 'bag', 'Cards & Stationery': 'card', 'Marketing': 'poster', 'Gifting & Merch': 'tag', 'Ready to Ship': 'tape', 'Bulk / B2B': 'label' };
  catalog().then((c) => {
    document.getElementById('home-cats').innerHTML = CATS.map((cat) => {
      const list = c.filter((x) => x.cat === cat);
      const from = Math.min(...list.map((x) => x.from));
      return `<a href="${catUrl(cat)}"><div class="art">${art(KIND[cat])}</div><span>${esc(cat)}<small>${list.length} products · from ${inr(price(from))}</small></span></a>`;
    }).join('');
    document.getElementById('home-popular').innerHTML = POP.map((s) => c.find((x) => x.slug === s)).filter(Boolean).map(card).join('');
    const st = c.filter((x) => x.cat === 'Stickers & Labels');
    document.getElementById('from-stickers').textContent = st.length + ' products · from ' + inr(price(Math.min(...st.map((x) => x.from))));
  });
});
