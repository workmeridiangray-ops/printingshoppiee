document.addEventListener('DOMContentLoaded', () => {
  const { catalog, card, CATS, esc } = PH;
  const params = new URLSearchParams(location.search);
  let cat = params.get('cat') || 'All products';
  const q = (params.get('q') || '').trim().toLowerCase();
  let sort = 'pop', limit = 24;
  const POP = ['product-labels', 'mailer-box', 'standard-business-cards', 'custompaperbox', 'paper-bag', 'sticker-sheets', 'flat-thank-you-cards', 'hang-tags', 'foil-stickers-fb', 'bottle-jar-labels', 'pack-tape', 'premium-paper-bag'];
  const rank = (c) => { const i = POP.indexOf(c.slug); return i < 0 ? (c.imgs.length ? 500 : 999) : i; };
  const sortEl = document.getElementById('shop-sort');
  catalog().then((all) => {
    function render() {
      const inCat = all.filter((c) => cat === 'All products' || c.cat === cat);
      let list = inCat.filter((c) => !q || (c.name + ' ' + c.cat + ' ' + c.slug).toLowerCase().includes(q));
      if (sort === 'pop') list.sort((a, b) => rank(a) - rank(b));
      if (sort === 'low') list.sort((a, b) => a.from - b.from);
      if (sort === 'high') list.sort((a, b) => b.from - a.from);
      if (sort === 'az') list.sort((a, b) => a.name.localeCompare(b.name));
      const title = q ? `Results for “${q}”` : cat;
      document.title = title + ' — Print Haus';
      document.getElementById('shop-title').textContent = title;
      document.getElementById('crumb').textContent = title;
      document.getElementById('shop-count').textContent = list.length + ' products · prices before GST';
      document.getElementById('shop-cats').innerHTML = '<span class="eyebrow" style="padding:0 12px 8px">Categories</span>' +
        ['All products'].concat(CATS).map((c) => {
          const n = c === 'All products' ? all.length : all.filter((x) => x.cat === c).length;
          return `<button type="button" data-cat="${esc(c)}" aria-pressed="${c === cat}">${esc(c)}<small>${n}</small></button>`;
        }).join('');
      const shown = list.slice(0, limit);
      document.getElementById('shop-grid').innerHTML = shown.length ? shown.map(card).join('') :
        `<div class="notice" style="grid-column:1/-1">No products match. Try another word, or <a href="help.html#contact" style="text-decoration:underline">ask us</a> — we print more than we list.</div>`;
      document.getElementById('shop-showing').textContent = `Showing ${shown.length} of ${list.length}`;
      document.getElementById('shop-more').hidden = list.length <= shown.length;
    }
    document.getElementById('shop-cats').addEventListener('click', (e) => {
      const b = e.target.closest('button[data-cat]'); if (!b) return;
      cat = b.dataset.cat; limit = 24;
      const u = new URL(location.href); u.searchParams.delete('q');
      if (cat === 'All products') u.searchParams.delete('cat'); else u.searchParams.set('cat', cat);
      history.replaceState(null, '', u); render();
    });
    sortEl.addEventListener('change', () => { sort = sortEl.value; render(); });
    document.getElementById('shop-more').addEventListener('click', () => { limit += 24; render(); });
    render();
  });
});
