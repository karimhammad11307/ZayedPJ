# Brand Store — Phase 1 Walkthrough
### Foundation Layer: Config · Lib · Models · Context · Middleware

---

## What Phase 1 Is (and Is Not)

Phase 1 is **purely infrastructure** — no pages, no UI, no components.
Think of it like the steel skeleton of a building before any walls go up.
Every page, component, and API route you'll write later will *import from* the files created here.

The goal was to establish four pillars:

| Pillar | What it means |
|--------|--------------|
| **Design System** | A single source of truth for every color, font, shadow, animation |
| **Data Layer** | Database connection + typed Mongoose models |
| **Security Layer** | JWT auth, middleware protection, secure cookies |
| **Integration Layer** | Cloudinary, Resend, WhatsApp — wired up but not yet called from pages |

---

## Step 0 — Project Scaffolding

### The problem with the folder name
`ZayedPJ` has capital letters. npm package names cannot have capitals.
`create-next-app` uses the folder name as the package name, so it rejected it.

**Solution:** Scaffold into a `brand-store/` subdirectory:
```
/ZayedPJ/
  └── brand-store/      ← everything lives here
        ├── app/
        ├── components/
        ├── lib/
        ├── models/
        ├── context/
        └── middleware.ts
```

All your work going forward is inside `brand-store/`.

### What `create-next-app` gave us for free
- `next.config.mjs` — Next.js 14 App Router config
- `tsconfig.json` — TypeScript configured with `@/*` path alias
- `postcss.config.mjs` — PostCSS wired to Tailwind
- A starter `app/page.tsx` and `app/layout.tsx` (which we immediately replaced)
- `tailwind.config.ts` — starter (which we completely replaced)

### Additional packages installed
```bash
npm install mongoose jose cloudinary resend
```

| Package | Why |
|---------|-----|
| `mongoose` | ODM for MongoDB — typed schemas, validation, connection pooling |
| `jose` | JWT signing/verification that works in **Edge Runtime** (middleware uses Edge; `jsonwebtoken` does not work there) |
| `cloudinary` | Official SDK for signed upload signatures |
| `resend` | Transactional email with a simple Node.js SDK |

---

## Step 1 — `tailwind.config.ts`
**[View file](file:///home/karimhammad/Workspace/Vscode%20Projects/ZayedPJ/brand-store/tailwind.config.ts)**

This file is the **single source of truth** for the visual design system.
Every class like `bg-cream`, `text-forest`, `font-heading`, `animate-marquee`, `rounded-card`
is defined here and nowhere else.

### Colors
```ts
colors: {
  cream:        '#F5F0E8',   // Main background — always
  'cream-light': '#FAFAF8',  // Cards, admin backgrounds
  'mint-soft':  '#F0F7F4',   // Secondary section backgrounds
  mint:         '#4A9B7F',   // Logo, buttons, links — the brand's primary
  forest:       '#1E4D3A',   // Navbar, footer, dark sections
  terracotta:   '#C94B2C',   // Sale badges, urgency, accents
  blush:        '#E8B4A0',   // Feminine soft accents
  mustard:      '#E8A820',   // Star ratings, highlights
  brown:        '#2C1810',   // All body text — never black
  'brown-muted': '#6B5B4E',  // Secondary text, labels
}
```
By adding these under `theme.extend.colors` (not replacing), we **keep** all default Tailwind utilities (like `w-full`, `flex`, `grid`) while **adding** our brand palette on top.

### Fonts
```ts
fontFamily: {
  heading: ['"Cormorant Garamond"', 'Georgia', 'serif'],
  body:    ['Inter', 'sans-serif'],
}
```
This means you can write `font-heading` in any component to get Cormorant Garamond, and `font-body` for Inter. Fallbacks (`Georgia`, `sans-serif`) ensure text is readable even if fonts fail to load.

### Animations
Three animations are defined:

| Animation | Usage |
|-----------|-------|
| `animate-marquee` | The scrolling ticker strip (brand name, announcements) |
| `animate-fade-in` | Page transitions, modal appearances, lazy-loaded content |
| `animate-slide-in-right` | Cart drawer sliding in from the right |

The `marquee` keyframe moves from `translateX(0%)` to `translateX(-50%)`. The trick is that the marquee track contains the text **duplicated twice** — so when the first copy scrolls out, the second is seamlessly in position, creating an infinite loop with no jump.

---

## Step 2 — `app/globals.css`
**[View file](file:///home/karimhammad/Workspace/Vscode%20Projects/ZayedPJ/brand-store/app/globals.css)**

This file does six things:

### 1. Google Fonts import
```css
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap');
```
`display=swap` means the browser shows a fallback font immediately, then swaps to the custom font when it loads — no invisible text during load.

> **Note:** In `app/layout.tsx` we also import via `next/font` which handles this more optimally (self-hosted, zero layout shift). Both approaches exist for compatibility.

### 2. CSS Custom Properties
```css
:root {
  --cream: #F5F0E8;
  --mint:  #4A9B7F;
  /* ... etc */
}
```
These let us reference brand colors in plain CSS files (not just in Tailwind classes). Useful for the grain texture overlay and complex CSS that Tailwind can't express.

### 3. Grain texture on body
```css
body::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;  /* ← critical: doesn't block clicks */
  opacity: 0.03;         /* ← 3% as specified in brief */
  background-image: url("data:image/svg+xml,...");
}
```
The grain is a `fixed` pseudo-element that sits over the entire viewport at 3% opacity. `pointer-events: none` ensures it's purely decorative — buttons and links still work. The SVG is an inline data URI so it works without any image file.

### 4. Component classes

| Class | What it renders |
|-------|----------------|
| `.btn-primary` | Mint background, white text, 14px radius, hover → forest |
| `.btn-outline` | Cream background, mint border+text, hover → mint bg |
| `.heading-editorial` | Cormorant Garamond, italic, light weight, brown |
| `.label-caps` | Inter, 12px, uppercase, wide tracking, brown-muted |
| `.marquee-track` | `display: inline-flex`, marquee animation applied |
| `.stripe-divider` | Forest + cream 16px repeating vertical stripes |

These are `@layer components` classes — they appear between Tailwind's base and utility layers, so utility classes can still override them with `!important` or higher specificity.

### 5. Keyframes (mirrored from tailwind.config.ts)
Defined in both places because Tailwind config handles the `animate-*` utility class, while the CSS keyframe is what actually moves things.

### 6. Custom scrollbar
Subtle mint-colored scrollbar that matches the brand without being distracting.

---

## Step 3 — `app/layout.tsx`
**[View file](file:///home/karimhammad/Workspace/Vscode%20Projects/ZayedPJ/brand-store/app/layout.tsx)**

This is the **root shell** that wraps every page in the app.

### `next/font` — why we use it instead of just CSS `@import`
```ts
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const cormorant = Cormorant_Garamond({ ... })
```
`next/font` **self-hosts** the fonts on your Vercel deployment. This means:
- No Google Fonts network request from the browser (faster, more private)
- **Zero layout shift** — fonts are preloaded at build time
- Works perfectly with Vercel's CDN

The `variable` option injects a CSS variable (`--font-inter`) onto the `<html>` element so both Tailwind and raw CSS can reference it.

### CartProvider wrapping
```tsx
<body className="bg-cream text-brown font-body antialiased">
  <CartProvider>
    {children}
  </CartProvider>
</body>
```
`CartProvider` is placed here — at the root — so that *every* page and component in the app can call `useCart()` without any extra wrapping. The Navbar (which shows the cart badge) and the CartDrawer (which shows cart contents) both need this.

---

## Step 4 — `lib/mongodb.ts`
**[View file](file:///home/karimhammad/Workspace/Vscode%20Projects/ZayedPJ/brand-store/lib/mongodb.ts)**

### The Vercel serverless problem
Vercel runs your Next.js API routes as Lambda functions. Each invocation may be a **fresh cold start** — meaning `import mongoose` runs again from scratch. Without caching, you'd create a new MongoDB connection on every API call. MongoDB Atlas has connection limits; you'd exhaust them in minutes under any real load.

### The fix: module-level global cache
```ts
declare global {
  var _mongooseCache: { conn: Mongoose | null; promise: Promise<Mongoose> | null }
}

const cached = global._mongooseCache ?? { conn: null, promise: null }
global._mongooseCache = cached
```
`global` in Node.js persists across hot reloads and is shared between module reloads. So:
1. First call: `cached.conn` is null → we create the connection and store the promise
2. Second call (same Lambda instance): `cached.conn` exists → we return it immediately
3. New Lambda cold start: `global` is fresh → we create again (unavoidable, but rare)

### Fail-closed design
If `MONGODB_URI` is missing, the module **throws at import time** — before any request is processed. This is intentional: a database-backed app with no DB connection should never silently serve requests.

---

## Step 5 — `lib/auth.ts`
**[View file](file:///home/karimhammad/Workspace/Vscode%20Projects/ZayedPJ/brand-store/lib/auth.ts)**

### Why `jose` and not `jsonwebtoken`?
Next.js middleware runs in **Edge Runtime** — a V8 isolate, not full Node.js. It has no `crypto` module, no `fs`, no native Node APIs. `jsonwebtoken` uses Node's `crypto` and fails silently. `jose` is built for Web Crypto API and works in Edge, Node, Deno, and Bun.

### Secret resolution (secure, no hardcoded fallbacks)
```ts
function resolveSecret(): Uint8Array {
  if (process.env.JWT_SECRET) return encode(process.env.JWT_SECRET)

  if (process.env.NODE_ENV === 'production') {
    throw new Error('[auth] JWT_SECRET not set in production')
  }

  // Dev only: ephemeral random secret
  console.warn('[auth] Using ephemeral secret — dev only!')
  return new Uint8Array(randomBytes(32))
}
```
Three-tier resolution:
1. **Env var present** → use it (all environments)
2. **No env var + production** → throw (crash loudly, never silently)
3. **No env var + dev** → generate a random one, warn loudly

This is the secure coding skill's "multi-tiered fallback" pattern. The dev fallback means you can run locally without setting up every env var immediately, but it never silently produces an insecure secret in production.

### Hardcoded algorithm
```ts
const { payload } = await jwtVerify(token, SECRET, {
  algorithms: ['HS256'],  // ← HARDCODED, never from token header
})
```
The "algorithm confusion" attack works by setting `alg: none` in a token header and then verifying without specifying expected algorithms. By hardcoding `['HS256']`, we reject any token claiming any other algorithm.

### `__Host-` cookie prefix
```ts
export const AUTH_COOKIE_NAME = '__Host-admin-token'
```
The `__Host-` prefix is a browser security feature. The browser automatically enforces:
- Must have `Secure` flag
- Must have `Path=/`
- Must NOT have `Domain` attribute

This prevents a subdomain from setting a cookie that appears on the main domain — a form of cookie injection/fixation attack.

---

## Step 6 — `lib/cloudinary.ts`
**[View file](file:///home/karimhammad/Workspace/Vscode%20Projects/ZayedPJ/brand-store/lib/cloudinary.ts)**

### Signed uploads — why this matters
A naïve implementation would give the browser your `CLOUDINARY_API_SECRET` and let it upload directly. That's catastrophic — anyone with your secret can upload anything, delete everything, or run up massive storage bills.

The correct pattern (implemented here):

```
Admin Browser                Server                    Cloudinary
     │                         │                           │
     │  GET /api/admin/         │                           │
     │  upload-signature        │                           │
     ├────────────────────────► │                           │
     │                         │  api_sign_request()       │
     │                         │  (uses API_SECRET)        │
     │  { signature, timestamp, │                           │
     │    apiKey, cloudName }   │                           │
     │ ◄────────────────────── │                           │
     │                         │                           │
     │  POST directly to Cloudinary with signature         │
     ├─────────────────────────────────────────────────────►
     │                         │                           │
     │  { secure_url }         │                           │
     │ ◄───────────────────────────────────────────────────
```

The `generateUploadSignature()` function here creates the HMAC signature using your secret. The browser sends this signature with the upload — Cloudinary verifies it. The secret itself **never leaves the server**.

---

## Step 7 — `lib/resend.ts`
**[View file](file:///home/karimhammad/Workspace/Vscode%20Projects/ZayedPJ/brand-store/lib/resend.ts)**

### The branded HTML email
The `buildReceiptHtml()` function generates a complete transactional email with:
- Forest-colored header with brand name in italic serif
- Order ID, customer greeting
- Items table with size/color/quantity per row
- Mint-accented payment instructions block
- "Track My Order" call-to-action button → `/order/[id]`
- Forest footer

All dynamic values go through an `esc()` function:
```ts
const esc = (s: string | number) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
```
This prevents XSS in email clients (yes, email clients can execute scripts in HTML emails — Outlook being the notorious offender).

### Non-throwing interface
```ts
export async function sendReceiptEmail(data): Promise<{ success: boolean; error?: string }> {
  try {
    await resend.emails.send(...)
    return { success: true }
  } catch (err) {
    console.error('[resend] Failed:', err.message)  // message only, never PII
    return { success: false, error: err.message }
  }
}
```
The API route calls this **non-blocking** (`void sendReceiptEmail(...)`) so a Resend outage never delays the customer's order confirmation or WhatsApp redirect.

---

## Step 8 — `lib/whatsapp.ts`
**[View file](file:///home/karimhammad/Workspace/Vscode%20Projects/ZayedPJ/brand-store/lib/whatsapp.ts)**

Builds the `wa.me/` deep link with `encodeURIComponent()` wrapping the full message.

The message structure follows the brief exactly:
```
━━━━━━━━━━━━━━━━━━━━━━━
🌿 Brand Store — New Order
━━━━━━━━━━━━━━━━━━━━━━━

📋 Order ID: #abc123
👤 Name:     Karim Ahmad
📞 Phone:    +201234567890

📦 Delivery to: 15 El-Nasr Street, Cairo

🛒 Items:
• Linen Top (M / Sage Green) × 2 — EGP 1,200
• Wide Leg Trousers (L / Cream) × 1 — EGP 890

💰 Total: EGP 2,090

━━━━━━━━━━━━━━━━━━━━━━━
💳 Payment Instructions
━━━━━━━━━━━━━━━━━━━━━━━
Send via:
• InstaPay:       01XXXXXXXXX
• VodafoneCash:   01XXXXXXXXX

Reply with screenshot to confirm. Thank you! 🌿
```

The WhatsApp number is sanitized: `whatsappNumber.replace(/[^\d+]/g, '')` — strips spaces, dashes, or parentheses that would break the URL.

---

## Steps 9 — Mongoose Models

All three models follow the same pattern: **schema as the first line of defense**.

### Product model highlights
- **slug** uses `match: /^[a-z0-9-]+$/` — prevents SQL-injection-style characters from entering the slug field, even though MongoDB doesn't have SQL injection. Clean slugs also prevent URL manipulation.
- **category** uses `enum: ['tops', 'bottoms', 'dresses', 'outerwear']` — only valid categories accepted
- **size** uses `enum: ['XS', 'S', 'M', 'L', 'XL']` — prevents arbitrary size strings
- **stock** validates `Number.isInteger` — prevents fractional stock values

### Order model highlights
- **email** validated with `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — server-side, always. The browser also validates but we never trust client data.
- **phone** validated with `/^\+?[\d\s\-]{7,20}$/` — allows international formats
- **status** is `enum: ['pending', 'confirmed', 'shipped', 'delivered']` — the admin can only set these four values, preventing status pollution
- **items** validated to be between 1–100 — prevents empty orders and DoS via order stuffing

### Settings model highlights
- **key** is `enum: ['hero_image', 'announcement_text']` — only these two settings can ever exist. This is critical: without this, someone with admin access could inject arbitrary keys that get processed by code expecting specific keys.

---

## Step 10 — `context/CartContext.tsx`
**[View file](file:///home/karimhammad/Workspace/Vscode%20Projects/ZayedPJ/brand-store/context/CartContext.tsx)**

### Why localStorage (and why it's safe here)
The secure coding rules say: **never store auth tokens in localStorage** (XSS-vulnerable).
Cart data is fine in localStorage because it's non-sensitive — it's product IDs, sizes, and quantities. If an attacker reads your cart, the worst case is knowing what you want to buy.

### Hydration safety
```tsx
const [hydrated, setHydrated] = useState(false)

useEffect(() => {
  // load from localStorage
  setHydrated(true)
}, [])

useEffect(() => {
  if (!hydrated) return  // ← don't overwrite on first render
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}, [items, hydrated])
```
Without the `hydrated` guard, the server renders with an empty cart, the effect runs and immediately writes an empty array to localStorage — erasing the user's saved cart. The `hydrated` flag prevents any write until after the first localStorage read.

### Input validation on localStorage data
```ts
function isValidCartItems(data: unknown): data is CartItem[] {
  if (!Array.isArray(data)) return false
  return data.every(item =>
    typeof item.productId === 'string' &&
    typeof item.price     === 'number' &&
    item.price >= 0 &&
    item.quantity > 0 &&
    // ...
  )
}
```
A user could open DevTools and manually write garbage to localStorage. This guard ensures malformed data is silently discarded rather than crashing the app.

### Item key strategy
```ts
function itemKey(productId, size, color): string {
  return `${productId}::${size}::${color}`
}
```
The same product in **different sizes or colors** is treated as a **different cart item**. This is correct for a clothing store — a size M mint top and a size L mint top are different line items.

---

## Step 11 — `middleware.ts`
**[View file](file:///home/karimhammad/Workspace/Vscode%20Projects/ZayedPJ/brand-store/middleware.ts)**

This is the **security gatekeeper**. It runs on every request before any page or API route handler.

```
Browser Request
      │
      ▼
 middleware.ts  ← Edge Runtime (fast, no cold start)
      │
      ├── path is /admin/login?  →  pass through
      │
      ├── no cookie?             →  redirect /admin/login
      │
      ├── invalid token?         →  redirect /admin/login
      │
      └── valid token, role=admin →  pass through
                                     + inject x-admin-email header
```

### Why Edge Runtime is important here
Every page request to `/admin/*` hits this middleware first. If it ran in the full Node.js runtime (like API routes), there'd be a cold start delay on every admin page load. Edge Runtime is always warm — it runs in Vercel's global edge network in ~1ms.

### The route matcher
```ts
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}
```
`:path*` matches zero or more path segments. So this protects:
- `/admin` (dashboard)
- `/admin/products`
- `/admin/orders`
- `/api/admin/login`
- `/api/admin/settings`
- `/api/admin/upload-signature`

But does NOT protect `/admin/login` — handled by the explicit allow-list inside the function.

### Forwarding identity
```ts
requestHeaders.set('x-admin-email', payload.email)
```
After a successful verification, the middleware injects the admin's email into the request headers. The API route can then read `request.headers.get('x-admin-email')` to know who's acting — useful for audit logs — without re-verifying the JWT a second time.

---

## How All the Pieces Connect

```
Browser
  │
  │  GET /admin/*
  ├──────────────────────► middleware.ts
  │                              │
  │                         verifyToken()
  │                         ← lib/auth.ts
  │
  │  POST /api/orders
  ├──────────────────────► app/api/orders/route.ts (to build next)
  │                              │
  │                         connectDB()
  │                         ← lib/mongodb.ts
  │                              │
  │                         Order.create()
  │                         ← models/Order.ts
  │                              │
  │                         sendReceiptEmail()  (non-blocking)
  │                         ← lib/resend.ts
  │                              │
  │                         buildWhatsAppURL()
  │                         ← lib/whatsapp.ts
  │                              │
  │  { orderId, whatsappURL } ◄──┘
  │
  │  Browser opens WhatsApp,
  │  redirects to /order/[id]
```

---

## What's Not Built Yet

| What | Where it goes | Depends on |
|------|--------------|------------|
| Store pages (home, shop, product, checkout, order status) | `app/(store)/` | All lib files ✅ |
| Admin pages (dashboard, products, orders, login) | `app/admin/` | All lib files ✅ |
| API routes | `app/api/` | `lib/mongodb.ts` ✅, `models/` ✅ |
| UI Components | `components/` | `tailwind.config.ts` ✅, `globals.css` ✅ |
| Navbar + Footer | `components/Navbar.tsx`, `Footer.tsx` | `useCart()` ✅ |
| Cart Drawer | `components/CartDrawer.tsx` | `CartContext.tsx` ✅ |
| Admin Product Form | `components/admin/ProductForm.tsx` | `lib/cloudinary.ts` ✅ |
| Image Uploader | `components/admin/ImageUploader.tsx` | `lib/cloudinary.ts` ✅ |

---

## Recommended Build Order (Next Steps)

### Phase 2 — API Routes
Build the backend before the UI so you can test with a REST client (curl / Postman):

1. `app/api/products/route.ts` — GET (list) + POST (create)
2. `app/api/products/[slug]/route.ts` — GET (single) + PUT + DELETE
3. `app/api/orders/route.ts` — POST (create order → email → WhatsApp URL)
4. `app/api/orders/[id]/route.ts` — GET (order status) + PATCH (status update)
5. `app/api/admin/login/route.ts` — POST (verify credentials → set cookie)
6. `app/api/admin/upload-signature/route.ts` — GET (signed Cloudinary signature)
7. `app/api/admin/settings/route.ts` — GET + PUT

### Phase 3 — Shared Components
Build the design system components before pages (they're reused everywhere):

1. `components/Navbar.tsx` — with cart badge from `useCart().itemCount`
2. `components/Footer.tsx`
3. `components/ProductCard.tsx` — with polaroid frame option
4. `components/ProductGrid.tsx`
5. `components/SizePicker.tsx`
6. `components/ColorPicker.tsx`
7. `components/CartDrawer.tsx` — slide-in-right animation

### Phase 4 — Store Pages
1. `app/(store)/page.tsx` — Homepage: hero, marquee, featured products, about strip
2. `app/(store)/shop/page.tsx` — Product grid with category filter
3. `app/(store)/shop/[slug]/page.tsx` — Product detail, size/color picker, add to cart
4. `app/(store)/checkout/page.tsx` — Form → POST /api/orders → WhatsApp redirect
5. `app/(store)/order/[id]/page.tsx` — Order status page

### Phase 5 — Admin Panel
1. `app/admin/login/page.tsx` — Login form → POST /api/admin/login
2. `app/admin/page.tsx` — Dashboard: revenue, pending count, recent orders
3. `app/admin/products/page.tsx` — Product list + add/edit/delete
4. `app/admin/orders/page.tsx` — Orders table with status filter + update

### Phase 6 — Polish
- `components/admin/ImageUploader.tsx` — drag-and-drop Cloudinary signed uploads
- Announcement banner using Settings model
- Hero image from Settings model
- SEO metadata on every page
- Loading skeletons and error boundaries

---

## Before You Run the App

You need to create `.env.local` in `brand-store/`:

```bash
# Copy the template
cp brand-store/.env.example brand-store/.env.local
# Then fill in your values
```

Minimum to get the dev server running without errors:
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=any-random-32-char-string
ADMIN_EMAIL=admin@test.com
ADMIN_PASSWORD=yourpassword
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
RESEND_API_KEY=re_...
```

Then:
```bash
cd brand-store
npm run dev
```

---

## Security Decisions Summary

| Decision | Why |
|----------|-----|
| `jose` not `jsonwebtoken` | Works in Edge Runtime (middleware) |
| `__Host-` cookie prefix | Browser enforces Secure + no-Domain + Path=/ |
| Algorithm hardcoded to HS256 | Prevents algorithm confusion / `alg: none` attacks |
| No JWT secret fallback in prod | Fail-closed: missing config = crash, not silent insecurity |
| Mongoose enums everywhere | Server-side allow-list prevents invalid/malicious values |
| Signed Cloudinary uploads | API secret never leaves the server |
| `isValidCartItems()` guard | Prevents localStorage poisoning from crashing the app |
| `encodeURIComponent` on WhatsApp | Prevents URL injection in the wa.me link |
| Email values HTML-escaped | Prevents XSS in email clients |
| TODO(security) comments | Documents known gaps (CSRF on mutations, MFA, rate limiting) |
