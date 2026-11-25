# Print Haus — online printing store

Website (HTML, CSS, vanilla JS) + a small Node/Express backend for a custom printing & packaging store.

- **Backend** (`server/index.js`, Postgres): email + password accounts, password reset by email (Brevo),
  artwork uploads (stored in Postgres, 50 MB max), orders, and an admin page (`/admin.html`).
- Run locally: `npm install` then `DATABASE_URL=postgres://… ADMIN_KEY=… npm start` → http://localhost:3000

### Environment variables
| Name | Required | What it does |
|---|---|---|
| `DATABASE_URL` | yes | Postgres connection string (tables are created automatically) |
| `ADMIN_KEY` | yes | Password for `/admin.html` (orders, artwork downloads, status updates) |
| `NODE_ENV` | yes on server | `production` (secure cookies) |
| `SITE_URL` | optional | e.g. `https://printhaus.in`, used in password-reset links |
| `BREVO_API_KEY`, `MAIL_FROM`, `MAIL_FROM_NAME` | optional | Enables "Forgot password" emails |
| `MAX_UPLOAD_MB` | optional | Upload size limit, default 50 |

### Google sign-in
`users.google_id` is ready in the database and `login.html` has an empty `<div id="google-signin">`
where the Google button goes. Add a `POST /api/auth/google` route that verifies the Google ID token,
finds or creates the user by email, and calls `startSession(res, user.id)`.

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
- Cart lives in the visitor's browser; orders are saved in Postgres and also sent to your WhatsApp.
- Artwork can be uploaded on the product page or in the cart; it's attached to the order.
- Product images are drawn placeholders (`PH.art()` in `assets/js/app.js`) — replace with real photos.

## Regenerating
- `scripts/build_prices.py`, `scripts/build_catalog.py` — rebuild data from the Kraftix price sheet (.xlsx).
- `scripts/pages.py` — regenerates all HTML pages from one shared shell (edit page content there).

## Deploy
Render web service: build `npm install`, start `npm start`, plus the environment variables above.
