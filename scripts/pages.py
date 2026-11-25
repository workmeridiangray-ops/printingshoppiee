# Generates the HTML pages from one shared shell. Run: python3 scripts/pages.py
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def page(fn,title,desc,body,scripts=()):
    js=''.join(f'\n<script src="assets/js/{s}"></script>' for s in scripts)
    html=f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">{"<meta name=\"robots\" content=\"noindex\">" if fn in ("admin.html","account.html","login.html","checkout.html","order-placed.html") else ""}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/style.css">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='4' fill='%231E5066'/%3E%3Ccircle cx='16' cy='16' r='7' fill='%23B1C8A3'/%3E%3C/svg%3E">
</head>
<body>
<div id="site-header"></div>
<main id="main">
{body}
</main>
<div id="site-footer"></div>
<script src="assets/js/config.js"></script>
<script src="assets/js/app.js"></script>{js}
</body>
</html>
'''
    open(os.path.join(ROOT,fn),'w').write(html)

page('index.html','Print Haus — Custom stickers, boxes, visiting cards & packaging printing','Order custom stickers, labels, boxes, visiting cards and packaging online. Free design check, GST invoice, delivery across India.','''
<div class="wrap">
  <section class="hero">
    <div class="hero-banner">
      <div class="txt">
        <span class="eyebrow">Stickers · Labels · Boxes · Cards</span>
        <h1>Custom printing for your brand, delivered across India.</h1>
        <p class="muted">172 products with clear prices. A designer checks every file and you approve a proof before we print.</p>
        <div style="display:flex;flex-wrap:wrap;gap:10px"><a class="btn btn-lg" href="shop.html">Shop all products</a><a class="btn btn-lg btn-outline" href="bulk.html">Bulk enquiry</a></div>
      </div>
      <div class="pic art tint" id="hero-art"></div>
    </div>
    <div class="hero-side">
      <a href="shop.html?cat=Stickers%20%26%20Labels" style="background:var(--lagoon);color:#fff"><span class="eyebrow" style="color:var(--sage-light)">Most ordered</span><strong style="font-size:22px">Stickers &amp; labels</strong><span id="from-stickers">From 25 pcs</span></a>
      <a href="shop.html?cat=Boxes" style="background:var(--soft);border:1px solid var(--line)"><span class="eyebrow">Packaging</span><strong style="font-size:22px">Custom boxes</strong><span class="muted" id="from-boxes">Mailer, product &amp; rigid boxes</span></a>
    </div>
  </section>
  <section class="trust" aria-label="Why order from us">
    <div><strong>25 years in print</strong><span>34 branches across India</span></div>
    <div><strong>Free design check</strong><span>Approve a proof before printing</span></div>
    <div><strong>GST invoice</strong><span>On every order</span></div>
    <div><strong>Pan-India delivery</strong><span>Tracked, or pick up at a branch</span></div>
  </section>
  <section class="section">
    <div class="section-head"><h2>Shop by category</h2><a href="shop.html" class="eyebrow">View all products →</a></div>
    <div class="cats" id="home-cats"></div>
  </section>
  <section class="section" style="padding-top:0">
    <div class="section-head"><h2>Popular products</h2><a href="shop.html" class="eyebrow">See all 172 →</a></div>
    <div class="grid" id="home-popular"></div>
  </section>
</div>
<section class="band" style="border-top:1px solid var(--line)"><div class="wrap section">
  <div class="section-head"><h2>How ordering works</h2></div>
  <div class="steps">
    <div><b>1</b><strong>Choose and customise</strong><span class="muted">Pick size, material and quantity — the price updates instantly.</span></div>
    <div><b>2</b><strong>Upload your design</strong><span class="muted">Send your artwork, or ask our designers to set it up for you.</span></div>
    <div><b>3</b><strong>Approve the proof</strong><span class="muted">We check bleed, resolution and colour, then share a proof for your OK.</span></div>
    <div><b>4</b><strong>Printed and delivered</strong><span class="muted">Dispatched with tracking, or collect from your nearest branch.</span></div>
  </div>
</div></section>
<div class="wrap section">
  <div class="panel" style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:20px;background:var(--lime);border:0">
    <div style="flex:1 1 420px"><h2 style="font-size:26px">Ordering 1,000+ pieces?</h2><p class="muted" style="margin-top:6px">Get trade pricing, one account manager and consistent colour across every run.</p></div>
    <a class="btn btn-dark btn-lg" href="bulk.html">Get a bulk quote</a>
  </div>
</div>''',['home.js'])

page('shop.html','Shop all products — Print Haus','Browse 172 printing and packaging products with live prices.','''
<section class="band"><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><strong id="crumb">All products</strong></nav>
  <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px;padding:10px 0 24px">
    <div><h1 id="shop-title" style="font-size:32px">All products</h1><p class="muted" id="shop-count">Loading…</p></div>
  </div>
</div></section>
<div class="wrap shop">
  <aside aria-label="Categories" id="shop-cats"></aside>
  <div class="shop-main">
    <div class="toolbar">
      <span class="muted" id="shop-showing"></span>
      <label style="display:flex;align-items:center;gap:8px;font-weight:600;font-size:14px">Sort
        <select id="shop-sort"><option value="pop">Popular</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="az">Name A–Z</option></select></label>
    </div>
    <div class="grid" id="shop-grid"></div>
    <button class="btn btn-outline" id="shop-more" hidden style="align-self:center">Show more products</button>
  </div>
</div>''',['shop.js'])

page('product.html','Product — Print Haus','Customise size, material and quantity with live prices.','''
<div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span><a id="crumb-cat" href="shop.html">Products</a><span>/</span><strong id="crumb-name">…</strong></nav>
  <div class="product">
    <div class="product-media">
      <div class="art tint" id="p-art"></div>
      <div class="assure"><div><strong>Free proof</strong>Approve before print</div><div><strong>GST invoice</strong>Claim input credit</div><div><strong>Secure payment</strong>UPI, cards, net banking</div></div>
    </div>
    <div class="product-config" id="p-config">
      <div><span class="eyebrow" id="p-cat"></span><h1 id="p-name" style="margin-top:6px">Loading…</h1><p class="muted" id="p-meta" style="margin-top:6px"></p></div>
      <div id="p-options"><div class="notice">Loading prices…</div></div>
    </div>
  </div>
  <section class="section" style="padding-top:0"><div class="section-head"><h2>You may also need</h2></div><div class="grid" id="p-related"></div></section>
</div>''',['product.js'])

page('cart.html','Your cart — Print Haus','Review your print order.','''
<div class="wrap">
  <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px;padding-top:32px"><h1 style="font-size:34px">Your cart</h1><a href="shop.html" class="eyebrow">Continue shopping →</a></div>
  <div class="two-col">
    <div class="main" id="cart-items"></div>
    <aside><div class="panel" id="cart-summary"></div></aside>
  </div>
</div>''',['cart.js'])

page('checkout.html','Checkout — Print Haus','Secure checkout.','''
<div class="wrap">
  <h1 style="font-size:34px;padding-top:32px">Checkout</h1>
  <form class="two-col" id="checkout-form" novalidate>
    <div class="main">
      <div class="panel" style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:8px"><h2 style="font-size:20px">1. Contact</h2><span class="muted" style="font-size:14px">Have an account? <a href="login.html" style="color:var(--teal-text);font-weight:700">Sign in</a></span></div>
        <div class="form-grid">
          <label class="field">Full name<input name="name" required autocomplete="name"></label>
          <label class="field">Mobile number<input name="phone" type="tel" required autocomplete="tel" placeholder="98xxx xxxxx"></label>
          <label class="field">Email (for proof &amp; invoice)<input name="email" type="email" required autocomplete="email"></label>
        </div>
      </div>
      <div class="panel" style="display:flex;flex-direction:column;gap:16px">
        <h2 style="font-size:20px">2. Delivery</h2>
        <label class="field">Address<input name="address" required autocomplete="street-address" placeholder="Flat / building, street, area"></label>
        <div class="form-grid">
          <label class="field">City<input name="city" required autocomplete="address-level2"></label>
          <label class="field">State<input name="state" required autocomplete="address-level1"></label>
          <label class="field">Pincode<input name="pincode" required inputmode="numeric" pattern="[0-9]{6}" autocomplete="postal-code"></label>
        </div>
        <label style="display:flex;align-items:center;gap:10px;font-weight:600"><input type="checkbox" id="gst-toggle" style="width:18px;height:18px;accent-color:var(--lagoon)"> I need a GST invoice for my business</label>
        <div class="form-grid" id="gst-fields" hidden>
          <label class="field">GSTIN<input name="gstin" placeholder="27ABCDE1234F1Z5"></label>
          <label class="field">Registered business name<input name="company"></label>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px" id="ship-options"></div>
      </div>
      <div class="panel" style="display:flex;flex-direction:column;gap:16px">
        <h2 style="font-size:20px">3. Payment</h2>
        <div id="pay-note" class="notice"></div>
        <button class="btn btn-lg btn-block" type="submit" id="pay-btn">Place order</button>
        <p class="muted" style="font-size:13px;text-align:center">You'll receive a digital proof to approve before anything is printed.</p>
      </div>
    </div>
    <aside><div class="panel" id="checkout-summary"></div></aside>
  </form>
</div>''',['checkout.js'])

page('order-placed.html','Order placed — Print Haus','Thank you for your order.','''
<div class="wrap section" style="max-width:720px;text-align:center;display:flex;flex-direction:column;gap:16px;align-items:center">
  <span class="badge">Order received</span>
  <h1 style="font-size:36px">Thank you! Your order <span id="oid"></span> is in.</h1>
  <p class="muted">Our designer will check your file and send a proof on WhatsApp and email, usually within 24 hours. Printing starts once you approve it.</p>
  <div style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"><a class="btn" href="account.html">View my orders</a><a class="btn btn-outline" href="shop.html">Continue shopping</a></div>
</div>
<script>document.getElementById('oid').textContent=new URLSearchParams(location.search).get('id')||'';</script>''')

page('login.html','Sign in or create an account — Print Haus','Sign in to approve proofs, reorder and download invoices.','''
<div class="wrap section" style="display:flex;flex-wrap:wrap;gap:40px;align-items:flex-start">
  <div style="flex:1 1 380px;background:var(--lagoon);color:#fff;border-radius:6px;padding:40px;display:flex;flex-direction:column;gap:18px">
    <h1 style="font-size:34px">Your print room, always open.</h1>
    <ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:8px;opacity:.9"><li>See every order and its status</li><li>Your uploaded artwork, saved for reorders</li><li>Faster checkout with saved details</li></ul>
  </div>
  <div style="flex:1 1 380px;max-width:460px;display:flex;flex-direction:column;gap:16px">
    <div role="tablist" aria-label="Account" style="display:grid;grid-template-columns:1fr 1fr;padding:4px;border-radius:6px;background:var(--soft)" id="auth-tabs">
      <button type="button" role="tab" data-mode="signin" class="btn btn-light" style="min-height:44px">Sign in</button>
      <button type="button" role="tab" data-mode="signup" class="btn btn-light" style="min-height:44px">Create account</button>
    </div>
    <div id="google-signin"><!-- Google sign-in button goes here --></div>
    <div id="auth-msg" class="notice" hidden role="alert"></div>

    <form id="f-signin" data-mode="signin" style="display:flex;flex-direction:column;gap:14px">
      <h2 style="font-size:26px">Welcome back</h2>
      <label class="field">Email<input name="email" type="email" required autocomplete="email"></label>
      <label class="field">Password<input name="password" type="password" required autocomplete="current-password"></label>
      <button class="btn btn-lg" type="submit">Sign in</button>
      <button type="button" class="linkbtn" data-go="forgot" style="align-self:flex-start">Forgot password?</button>
    </form>

    <form id="f-signup" data-mode="signup" hidden style="display:flex;flex-direction:column;gap:14px">
      <h2 style="font-size:26px">Create your account</h2>
      <label class="field">Full name<input name="name" required autocomplete="name"></label>
      <label class="field">Email<input name="email" type="email" required autocomplete="email"></label>
      <label class="field">Mobile number<input name="phone" type="tel" autocomplete="tel" placeholder="98xxx xxxxx"></label>
      <label class="field">Password<input name="password" type="password" required minlength="8" autocomplete="new-password" placeholder="At least 8 characters"></label>
      <button class="btn btn-lg" type="submit">Create account</button>
    </form>

    <form id="f-forgot" data-mode="forgot" hidden style="display:flex;flex-direction:column;gap:14px">
      <h2 style="font-size:26px">Reset your password</h2>
      <p class="muted">Enter your email and we'll send you a reset link.</p>
      <label class="field">Email<input name="email" type="email" required autocomplete="email"></label>
      <button class="btn btn-lg" type="submit">Send reset link</button>
      <button type="button" class="linkbtn" data-go="signin" style="align-self:flex-start">Back to sign in</button>
    </form>

    <form id="f-reset" data-mode="reset" hidden style="display:flex;flex-direction:column;gap:14px">
      <h2 style="font-size:26px">Choose a new password</h2>
      <label class="field">New password<input name="password" type="password" required minlength="8" autocomplete="new-password"></label>
      <button class="btn btn-lg" type="submit">Save password</button>
    </form>
    <p class="muted" style="font-size:13px">By continuing you agree to our <a href="help.html#policies" style="text-decoration:underline">terms and privacy policy</a>.</p>
  </div>
</div>''',['login.js'])

page('account.html','My account — Print Haus','Your orders, artwork and details.','''
<div class="wrap section">
  <div style="display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:24px">
    <div><p class="muted" id="hello">Loading…</p><h1 style="font-size:34px">My account</h1></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap"><a class="btn" href="shop.html">Start a new order</a><button class="btn btn-outline" id="logout">Sign out</button></div>
  </div>
  <div class="two-col" style="padding-top:0">
    <div class="main"><h2 style="font-size:22px">Orders</h2><div id="orders" style="display:flex;flex-direction:column;gap:14px"></div></div>
    <aside style="display:flex;flex-direction:column;gap:16px">
      <form class="panel" id="profile" style="display:flex;flex-direction:column;gap:12px"><h2 style="font-size:20px">Your details</h2>
        <label class="field">Name<input name="name" required></label><label class="field">Mobile<input name="phone" type="tel"></label>
        <p class="muted" style="font-size:14px" id="email-line"></p><button class="btn" type="submit">Save</button></form>
      <form class="panel" id="pw" style="display:flex;flex-direction:column;gap:12px"><h2 style="font-size:20px">Change password</h2>
        <label class="field">Current password<input name="current" type="password" autocomplete="current-password"></label>
        <label class="field">New password<input name="next" type="password" minlength="8" required autocomplete="new-password"></label>
        <button class="btn btn-outline" type="submit">Update password</button></form>
    </aside>
  </div>
</div>''',['account.js'])

page('bulk.html','Bulk & B2B printing — Print Haus','Trade pricing for 1,000+ pieces. Get a quote within one working day.','''
<section style="background:var(--lagoon);color:#fff"><div class="wrap section" style="display:flex;flex-wrap:wrap;gap:40px;align-items:flex-start">
  <div style="flex:1 1 420px;display:flex;flex-direction:column;gap:16px">
    <span class="eyebrow" style="color:var(--sage-light)">For businesses</span>
    <h1 style="font-size:44px">Trade pricing for brands that print at scale.</h1>
    <p style="opacity:.85;font-size:17px">From 1,000 to 1,00,000 pieces — one account manager, one GST invoice, consistent colour across every run and branch.</p>
    <ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px;opacity:.92"><li>Dedicated account manager on WhatsApp</li><li>Physical sample before large runs</li><li>Delivery to multiple locations, or pickup at 34 branches</li></ul>
  </div>
  <form id="bulk-form" class="panel" style="flex:1 1 400px;color:var(--ink);display:flex;flex-direction:column;gap:14px">
    <h2 style="font-size:24px">Get a bulk quote</h2>
    <div class="form-grid">
      <label class="field">Your name<input name="name" required></label>
      <label class="field">Company<input name="company"></label>
      <label class="field">Mobile<input name="phone" type="tel" required></label>
      <label class="field">GSTIN (optional)<input name="gstin"></label>
      <label class="field">Product<input name="product" required placeholder="e.g. mailer boxes"></label>
      <label class="field">Quantity<input name="qty" required placeholder="e.g. 5,000"></label>
    </div>
    <label class="field">Details<textarea name="notes" rows="3" placeholder="Size, material, deadline, delivery locations…"></textarea></label>
    <button class="btn btn-lg" type="submit">Send enquiry on WhatsApp</button>
  </form>
</div></section>
<div class="wrap section"><div class="section-head"><h2>Bulk-priced products</h2><a class="eyebrow" href="shop.html?cat=Bulk%20%2F%20B2B">View all →</a></div><div class="grid" id="bulk-grid"></div></div>
<script>
document.addEventListener('DOMContentLoaded',function(){
  PH.catalog().then(function(c){document.getElementById('bulk-grid').innerHTML=c.filter(function(x){return x.cat==='Bulk / B2B'}).map(PH.card).join('');});
  document.getElementById('bulk-form').addEventListener('submit',function(e){e.preventDefault();var f=new FormData(this),t='Bulk enquiry\\n';f.forEach(function(v,k){if(v)t+=k+': '+v+'\\n'});window.open('https://wa.me/'+PH.S.whatsapp+'?text='+encodeURIComponent(t),'_blank');PH.toast('Opening WhatsApp…');});
});
</script>''')

page('about.html','About us — Print Haus','25 years in print and 34 branches across India.','''
<div class="wrap section" style="display:flex;flex-wrap:wrap;gap:40px;align-items:center">
  <div style="flex:1 1 480px;display:flex;flex-direction:column;gap:16px">
    <span class="eyebrow">About Print Haus</span>
    <h1 style="font-size:44px">Twenty-five years of getting print right.</h1>
    <p class="muted" style="font-size:17px">Print Haus is the online home of a printing business that has served Indian customers for 25 years through 34 branches. Any brand — a home baker or a national retailer — can now order the same quality with the same care, online.</p>
  </div>
  <div class="art tint" style="flex:1 1 380px;height:320px;border-radius:6px" id="about-art"></div>
</div>
<section class="band" style="border-top:1px solid var(--line)"><div class="wrap section">
  <div class="steps">
    <div><strong>Check the file before the press</strong><span class="muted">Every order is checked by a designer and proofed before printing.</span></div>
    <div><strong>Show the price, all of it</strong><span class="muted">Prices on every product, GST shown separately, no surprises.</span></div>
    <div><strong>Same colour, every run</strong><span class="muted">Approved artwork is saved so reorders match the first batch.</span></div>
    <div><strong>Real people, reachable</strong><span class="muted">WhatsApp, phone, or walk into one of our 34 branches.</span></div>
  </div>
</div></section>
<div class="wrap section" id="branches">
  <div class="section-head"><h2>Our branches</h2></div>
  <div class="grid">
    <div class="panel"><strong>[Branch city]</strong><p class="muted">[Full address · phone]</p></div>
    <div class="panel"><strong>[Branch city]</strong><p class="muted">[Full address · phone]</p></div>
    <div class="panel"><strong>[Branch city]</strong><p class="muted">[Full address · phone]</p></div>
  </div>
</div>
<script>document.addEventListener('DOMContentLoaded',function(){document.getElementById('about-art').innerHTML=PH.art('box');});</script>''')

page('help.html','Help, FAQ & contact — Print Haus','Answers about proofs, delivery, GST invoices and artwork.','''
<section class="band"><div class="wrap section" style="max-width:860px;text-align:center;display:flex;flex-direction:column;gap:12px;align-items:center">
  <h1 style="font-size:40px">How can we help?</h1>
  <p class="muted">Quickest answer: WhatsApp us during working hours.</p>
  <a class="btn btn-lg" id="wa-help" href="#">Chat on WhatsApp</a>
</div></section>
<div class="wrap section" style="display:flex;flex-wrap:wrap;gap:40px;align-items:flex-start">
  <div style="flex:999 1 520px;min-width:0">
    <h2 style="font-size:28px;margin-bottom:8px" id="delivery">Frequently asked</h2>
    <details open><summary>When will I get my proof?</summary><p>Within 24 working hours of your order, on WhatsApp and email. Printing starts only after you approve it.</p></details>
    <details><summary>How long does delivery take?</summary><p>Most orders dispatch 2–3 working days after proof approval. Transit is usually 2–5 days depending on your pincode.</p></details>
    <details><summary>Is delivery free?</summary><p>Free on orders above ₹999. Below that, a small charge is shown at checkout. Branch pickup is always free.</p></details>
    <details><summary>Will I get a GST invoice?</summary><p>Yes, with every order. Add your GSTIN at checkout to claim input tax credit.</p></details>
    <details><summary>Can I change my order after paying?</summary><p>Yes, anytime before you approve the proof.</p></details>
    <details><summary>I don't have a design. Can you help?</summary><p>Yes — choose “Design it for me” on the product page and our designer will set it up from your logo and text.</p></details>
    <h2 style="font-size:24px;margin:32px 0 8px" id="policies">Policies</h2>
    <details><summary>Reprints &amp; refunds</summary><p>[Add your reprint and refund policy here.]</p></details>
    <details><summary>Shipping policy</summary><p>[Add your shipping policy here.]</p></details>
    <details><summary>Privacy policy &amp; terms</summary><p>[Add your privacy policy and terms of service here.]</p></details>
  </div>
  <aside style="flex:1 1 300px;display:flex;flex-direction:column;gap:16px">
    <div class="panel" id="artwork" style="background:var(--lagoon);color:#fff;border:0"><h2 style="font-size:22px;margin-bottom:12px">Artwork checklist</h2>
      <ul style="margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px"><li>300 dpi at final print size</li><li>2–3 mm bleed on every edge</li><li>Text 3 mm inside the cut line</li><li>CMYK colour (we convert RGB)</li><li>Fonts outlined, or sent with the file</li></ul></div>
    <div class="panel" id="contact"><h2 style="font-size:20px;margin-bottom:10px">Contact</h2><p id="contact-lines" class="muted"></p></div>
  </aside>
</div>
<script>document.addEventListener('DOMContentLoaded',function(){var S=PH.S;document.getElementById('wa-help').href='https://wa.me/'+S.whatsapp;document.getElementById('contact-lines').innerHTML=PH.esc(S.phone)+'<br>'+PH.esc(S.email)+'<br>'+PH.esc(S.hours);});</script>''')

page('admin.html','Admin — Print Haus','','''
<div class="wrap section">
  <h1 style="font-size:32px;margin-bottom:16px">Orders admin</h1>
  <form id="key-form" class="panel" style="display:flex;gap:10px;flex-wrap:wrap;align-items:flex-end;max-width:520px"><label class="field" style="flex:1">Admin key<input type="password" name="key" required></label><button class="btn" type="submit">Open</button></form>
  <div id="admin" hidden>
    <div class="trust" id="stats" style="margin-bottom:20px"></div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px"><input id="filter" placeholder="Search order, name, phone…" style="flex:1 1 280px;height:44px;padding:0 12px;border:1.5px solid var(--line);border-radius:4px"><button class="btn btn-outline" id="refresh" type="button">Refresh</button></div>
    <div id="admin-orders" style="display:flex;flex-direction:column;gap:12px"></div>
  </div>
</div>''',['admin.js'])

page('404.html','Page not found — Print Haus','','''
<div class="wrap section" style="text-align:center;display:flex;flex-direction:column;gap:14px;align-items:center"><h1 style="font-size:40px">Page not found</h1><p class="muted">The page you're looking for doesn't exist.</p><a class="btn" href="shop.html">Browse products</a></div>''')
print('pages written')
