document.addEventListener('DOMContentLoaded', () => {
  const { art, catalog, card, catUrl, inr, price, esc, CATS, visual } = PH;
  
  const POP = ['candle-labels', 'health-beauty-labels', 'paper-bag', 'packing-sleeves-fb', 'hang-tags-fashion', 'glass-sticker', 'draw-string-bags', 'wrapping-paper-150', 'kraftcandlelabels', 'tucktopbox'];
  const KIND = { 'Stickers & Labels': 'sticker', 'Boxes': 'box', 'Packaging': 'bag', 'Cards & Stationery': 'card', 'Marketing': 'poster', 'Gifting & Merch': 'tag', 'Ready to Ship': 'tape', 'Bulk / B2B': 'label' };
  catalog().then((c) => {
    const hero = c.find((x) => x.slug === 'candle-labels');
    document.getElementById('hero-art').innerHTML = hero && hero.imgs.length ? `<img src="assets/img/products/${hero.imgs[0]}" alt="Custom printed candle labels" style="width:100%;height:100%;object-fit:cover">` : art('sticker');
    document.getElementById('home-cats').innerHTML = CATS.map((cat) => {
      const list = c.filter((x) => x.cat === cat);
      const from = Math.min(...list.map((x) => x.from));
      const withImg = list.find((x) => x.imgs.length);
      return `<a href="${catUrl(cat)}"><div class="art">${withImg ? visual(withImg, true) : art(KIND[cat])}</div><span>${esc(cat)}<small>${list.length} products · from ${inr(price(from))}</small></span></a>`;
    }).join('');
    document.getElementById('home-popular').innerHTML = POP.map((s) => c.find((x) => x.slug === s)).filter(Boolean).map(card).join('');
    const st = c.filter((x) => x.cat === 'Stickers & Labels');
    document.getElementById('from-stickers').textContent = st.length + ' products · from ' + inr(price(Math.min(...st.map((x) => x.from))));
  });
});
