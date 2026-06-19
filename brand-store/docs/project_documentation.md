# Brand Store E-Commerce Platform — Documentation

A fully functional, modern e-commerce platform for an Egyptian clothing brand. Built from scratch with Next.js 14, MongoDB, and Tailwind CSS.

This document serves as a comprehensive reference for the architecture, data flow, development phases, and a final walkthrough.

---

## 🏗 Development Phases

### Phase 1: Foundation (Backend & Context)
- **Database**: Established Mongoose models for `Product`, `Order`, and `Settings`.
- **Security**: Implemented JWT authentication using the Edge-compatible `jose` library. Set up robust HTTP-Only, `__Host-` prefixed cookies for secure session management.
- **State Management**: Created a React Context (`CartContext`) that securely persists the user's shopping cart to `localStorage`.
- **Next.js Middleware**: Built edge middleware to automatically block unauthorized access to any `/admin/*` routes (excluding `/admin/login`).

### Phase 2: API Routes
- **Products API**: Endpoints for fetching active products (public), and CRUD operations (admin). Added server-side auto-generation for URL slugs to guarantee uniqueness.
- **Orders API**: Endpoints for creating orders (public) and updating statuses (admin).
- **Admin Auth**: Login and Logout endpoints to securely issue and clear JWT cookies.
- **Image Uploads**: A secure `/api/admin/upload-signature` endpoint that issues signed payloads to the frontend, allowing direct-to-Cloudinary image uploads without proxying heavy files through our server.

### Phase 3: Component Library
- **Design System**: Implemented a rich, mobile-first aesthetic avoiding default Tailwind colors.
  - *Palette*: Cream background, Brown text, Mint accents, Forest dark sections.
  - *Typography*: Cormorant Garamond (Heading), Inter (Body).
- **Shared Components**: Built `Navbar`, `Footer`, `ProductGrid`, `ProductCard`, and a slide-out `CartDrawer` that dynamically reads from the `CartContext`.

### Phase 4: Store Pages (Customer-Facing)
- **Homepage (`/`)**: A 9-section editorial landing page featuring a hero banner, seamless CSS marquees, "Our Story" block, and dynamically fetched Bestsellers/New Arrivals.
- **Shop (`/shop`)**: A fully filtered product catalog.
- **Product Detail (`/shop/[slug]`)**: A complex hybrid page. Features an image gallery, size/color variant pickers that dynamically disable options based on live stock, and an Add to Cart flow.
- **Checkout (`/checkout`)**: Validates customer details, handles delivery vs. pickup logic, and posts to the API. Upon success, it automatically routes the user to their Order Status and opens a pre-filled WhatsApp message in a new tab.
- **Order Status (`/order/[id]`)**: Live order tracking showing different UI states (Pending, Confirmed, Shipped, Delivered) and displaying InstaPay/VodafoneCash numbers for pending orders.

### Phase 5: Admin Panel
- **Layout (`<AdminLayout>`)**: A distinct design system (`bg-forest` sidebar, `bg-cream-light` main area) with a mobile-responsive drawer.
- **Dashboard (`/admin`)**: Real-time stats (Total Orders, Pending Orders, Confirmed Revenue, Active Products) and a Recent Orders table.
- **Orders Management**: Tab-based filtering for order statuses. Features expandable rows for viewing customer details/items, and inline buttons for optimistic UI status updates (`PATCH /api/orders/[id]`).
- **Products Management**: Grid view of all inventory. Includes a powerful modal (`<ProductForm>`) to add/edit products, manage infinite variants (size/color/stock rows), and upload images directly to Cloudinary via the `<ImageUploader>` component.

---

## 🔄 Data Flow & Architecture Rules

### 1. Hybrid Fetching Strategy
This application utilizes Next.js App Router features by mixing Server and Client fetching depending on the context:
- **Server Components (Store Pages & Admin Dashboard)**: Pages like `app/(store)/page.tsx` and `app/admin/page.tsx` fetch data **directly** via Mongoose (e.g., `await Product.find()`). They *never* execute `fetch()` requests to their own internal `/api` routes to avoid unnecessary HTTP overhead.
- **Client Components (Admin Management)**: Highly interactive pages like `app/admin/orders/page.tsx` fetch data via the REST API (`fetch('/api/orders')`) on load, allowing for optimistic UI updates and real-time state mutation without full page reloads.

### 2. The Cart & Hydration
The `CartContext` utilizes `localStorage` to persist data. Because the server cannot read `localStorage` during SSR, the context exposes a `hydrated` boolean. 
- **Rule**: Any client component that redirects based on cart state (like the Checkout page) MUST wait for `hydrated === true` before checking if the cart is empty. This prevents the Checkout page from erroneously kicking the user back to the Shop page during the initial server render.

### 3. Server-Side Price Authority
When a customer submits an order via `POST /api/orders`, the client *does* submit a `total` for reference, but the server **ignores it**.
- **Rule**: The server takes the submitted `items` array, looks up every `productId` in the database, grabs the live `price` and `name`, and calculates the `total` entirely on the backend. This guarantees that a malicious user cannot intercept the network request and modify the price of an item.

### 4. Admin Authentication
- **Edge Middleware (`middleware.ts`)**: Runs on every request. If a user tries to access `/admin/*` without an `AUTH_COOKIE_NAME` cookie, they are instantly redirected to `/admin/login`.
- **API Defense in Depth**: Edge middleware protects the UI, but API routes (`/api/admin/*`, `PATCH /api/products`, etc.) manually call `verifyToken(cookie)` internally. This ensures the API endpoints remain secure even if the edge middleware is ever bypassed or misconfigured.

### 5. MongoDB "Lean" Queries
- **Rule**: Whenever fetching data in a Server Component to be passed down to a Client Component, `.lean()` is appended to the Mongoose query (e.g., `Product.find().lean()`). Mongoose documents are complex objects with attached methods; Next.js Server Components require plain, serializable JSON objects when passing props to the client. `.lean()` ensures the DB returns pure JSON.

### 6. Cloudinary Upload Flow
To avoid tying up server resources processing heavy image uploads:
1. The admin selects an image in the `<ImageUploader>`.
2. The browser calls `GET /api/admin/upload-signature` to get a timestamp and cryptographic signature.
3. The browser uses `FormData` to POST the image *directly* to Cloudinary's servers.
4. Cloudinary returns a `secure_url`, which is then saved to the product document in MongoDB.

---

## 🚶‍♂️ Walkthrough

### 🛍 Customer Experience
1. **Landing on the site**: The user opens `/` and sees the editorial layout, the scrolling marquee, and the bestselling items fetched directly from MongoDB.
2. **Browsing the catalog**: The user clicks "Shop" to go to `/shop`. They can filter by tabs like "Tops" or "Dresses".
3. **Product details**: Clicking a product goes to `/shop/[slug]`. Here they view the image gallery. They must pick a Size and Color. If a specific color/size combo is out of stock, the UI visually disables it.
4. **Adding to Cart**: Upon clicking "Add to Cart", the `CartContext` saves the item to `localStorage`. A success message flashes, and the `CartDrawer` automatically slides open from the right.
5. **Checkout Flow**: The user clicks "Checkout" inside the drawer, navigating to `/checkout`. They fill out their name, phone, and email. They toggle between "Delivery" and "Pickup". 
6. **Order Confirmation**: Hitting "Place Order" pushes their data to the server. The server calculates the real price, saves the order as `pending`, and returns an ID. The app redirects the user to `/order/[id]` and pops open a WhatsApp tab asking them to send their payment screenshot to your store's number.

### 🛡 Admin Experience
1. **Logging In**: The admin clicks the user icon `👤` in the public Navbar (or navigates to `/admin/login`). They enter their `.env` credentials. The server responds with an HTTP-Only secure cookie, granting access.
2. **Dashboard**: The admin is taken to `/admin`. They see 4 quick stats. The "Pending Orders" stat is colored terracotta if there are unhandled orders. Below is a fast table of the 10 newest orders.
3. **Fulfilling Orders**: The admin clicks the sidebar to go to `/admin/orders`. They click the "Pending" tab. They click an order row to expand it, revealing the customer's phone number and the exact items/sizes they ordered. They verify the payment on InstaPay, then click the "Confirm" button. The order status instantly turns green. When shipped, they click "Mark Shipped".
4. **Managing Inventory**: The admin goes to `/admin/products`. They click "Add New Product". A sleek modal opens. They type the name, price, and description. They drag 3 images into the Cloudinary upload box, which automatically uploads them and shows a preview. They add sizes (S, M, L) and set the stock numbers for each. They hit "Save". The catalog immediately updates.
