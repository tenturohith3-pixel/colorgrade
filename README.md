# ezcc — Editorial Color Grading for Cinematic Creators

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-Auth+%26+DB-3fcf8e?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Stripe-Payments-635bff?style=flat-square&logo=stripe" alt="Stripe" />
</p>

> Professional video color grading in your browser. LUT presets, 3-way color wheels, HSL curves, and canvas-based color correction — crafted for cinematic storytelling.

---

## ✨ Features

### Color Grading Tools
- **30+ LUT Presets** — Moody Cinematic, Warm Tone, Clean Minimal, Vintage Film, and more
- **3-Way Color Wheels** — Independent shadows, midtones, highlights control (Pro)
- **HSL Target Isolation** — Adjust hue, saturation, luminance per color range (Pro)
- **HDR Emulation** — Dynamic range expansion with highlight recovery (Pro)
- **Film Grain & Halation** — Procedural film-stock texture effects (Pro)
- **Custom 3D LUT Import** — Upload `.cube` files for pro workflows (Pro)

### Platform
- **Browser-based** — No downloads, works on mobile and desktop
- **Real-time Canvas rendering** — Instant preview as you adjust
- **Supabase Auth** — Email/password + Google OAuth with age verification (COPPA/GDPR/DPDP)
- **Supabase Storage** — Secure image upload with per-user folders
- **Stripe Payments** — 4 pricing tiers with subscription support
- **Row Level Security** — Users can only access their own data

### Design
- **Editorial magazine aesthetic** — Inspired by Vogue, GQ, Harper's Bazaar
- **Muted niche color palette** — Bronze, sage, umber accents on deep charcoal
- **Playfair Display serif typography** — Cinematic editorial feel
- **GSAP scroll animations** — Refined, cinematic reveal effects

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Stripe](https://stripe.com) account (optional, for payments)

### 1. Clone & Install

```bash
git clone https://github.com/tenturohith3-pixel/ezcc.git
cd ezcc
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (optional)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Database Setup

Go to your Supabase dashboard → SQL Editor → New Query, then paste and run the contents of:

```
supabase/migrations/001_initial_schema.sql
```

This creates all tables, RLS policies, storage buckets, and triggers.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 + DaisyUI |
| Auth & DB | Supabase (PostgreSQL + Auth + Storage) |
| Payments | Stripe Checkout |
| Animations | GSAP + ScrollTrigger |
| Fonts | Playfair Display, Inter, JetBrains Mono |
| Canvas | HTML5 Canvas 2D API |

---

## 📁 Project Structure

```
ezcc/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/route.ts        # Auth helpers
│   │   │   ├── checkout/route.ts    # Stripe checkout
│   │   │   ├── grade/route.ts       # Color grading API
│   │   │   ├── upload/route.ts      # Image upload to Supabase
│   │   │   └── webhook/route.ts     # Stripe webhooks
│   │   ├── auth/callback/route.ts   # OAuth callback
│   │   ├── tool/
│   │   │   ├── page.tsx
│   │   │   └── ColorToolPage.tsx    # Main grading tool
│   │   ├── globals.css              # Editorial theme
│   │   ├── layout.tsx
│   │   └── page.tsx                 # Landing page
│   ├── components/
│   │   ├── AuthModal.tsx            # Supabase auth modal
│   │   ├── Features.tsx
│   │   ├── Footer.tsx
│   │   ├── Gallery.tsx              # Before/after comparisons
│   │   ├── GSAPAnimations.tsx
│   │   ├── Hero.tsx
│   │   ├── Navbar.tsx
│   │   └── Pricing.tsx              # Stripe checkout buttons
│   ├── hooks/
│   │   └── useAuth.ts               # Supabase auth hook
│   └── lib/
│       ├── colorGrading.ts          # Canvas color grading engine
│       ├── stripe.ts                # Stripe client
│       ├── supabase.ts              # Browser client
│       └── supabase-server.ts       # Server client
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql   # Full DB schema + RLS
├── .env.example
└── package.json
```

---

## 🔐 Security

- **Row Level Security (RLS)** — All tables have RLS policies ensuring users can only access their own data
- **Server-side auth verification** — API routes verify Supabase JWT tokens
- **Storage policies** — Users can only upload/read/delete in their own folder
- **Stripe webhook verification** — Webhook signatures are validated
- **Age compliance** — COPPA/GDPR/DPDP age verification in signup flow

---

## 📄 License

MIT © 2026 ezcc
