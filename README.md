# Print Haus — online printing store

Static website (HTML, CSS, vanilla JS) for a custom printing & packaging store.
No build step: open `index.html` through any web server, or deploy the folder as-is.

## Pages
| Page | File |
|---|---|
| Home | `index.html` |
| Shop — all 172 products, categories, search, sort | `shop.html` (`?cat=…`, `?q=…`) |
| Product — size / option / quantity price calculator | `product.html?p=<slug>` |
| Cart | `cart.html` |
| Checkout (GST invoice, delivery options, Razorpay or WhatsApp) | `checkout.html` |
| Order confirmation | `order-placed.html` |
| Sign in, My orders | `login.html`, `account.html` |
| Bulk / B2B enquiry | `bulk.html` |
| About, Help & FAQ, 404 | `about.html`, `help.html`, `404.html` |

## Before going live — edit `assets/js/config.js`
- `phone`, `whatsapp` (digits with country code), `email`, `legalName`, `gstin`
- `priceMultiplier` — the bundled prices are Kraftix's ex-GST prices; `0.95` = 5% cheaper, `1.1` = 10% more
- `razorpayKey` — paste your Razorpay Key ID to take online payments. Empty = orders are sent to WhatsApp with full details.
- Fill the `[placeholders]` in `about.html` (branches) and `help.html` (policies).

## How it works
- `data/catalog.json` — 172 products (name, category, min qty, starting price).
- `data/prices/<slug>.json` — every size × option × quantity price (ex-GST).
  Format: `s` sizes, `o` option combos (`"Key: Value | Key: Value"`), `r` rows `[sizeIndex, optionIndex, [[qty, total], …]]`.
- Cart and orders are stored in the visitor's browser (`localStorage`). Orders are also sent to your WhatsApp.
- Accounts are device-local for now; real login (OTP) needs a backend.
- Product images are drawn placeholders (`PH.art()` in `assets/js/app.js`) — replace with real photos.

## Regenerating
- `scripts/build_prices.py`, `scripts/build_catalog.py` — rebuild data from the Kraftix price sheet (.xlsx).
- `scripts/pages.py` — regenerates all HTML pages from one shared shell (edit page content there).

## Deploy
- **Cloudflare Workers (static assets):** `npx wrangler deploy` (config in `wrangler.jsonc`).
- **Hostinger / any host:** upload the folder contents to `public_html`.
