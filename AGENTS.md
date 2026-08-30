# AGENTS.md — ezcc

## Project Overview

ezcc is a browser-based cinematic color grading platform built with Next.js 16. It provides LUT presets, 3-way color wheels, HSL target isolation, and real-time Canvas 2D rendering for video frame color correction. The UI follows an editorial magazine aesthetic with muted niche colors.

---

## Architecture

### Tech Stack
- **Next.js 16** (App Router, Server Components, Route Handlers)
- **TypeScript 5** — strict mode
- **Tailwind CSS 4** + DaisyUI (dark theme)
- **Supabase** — Auth (email/password + OAuth), PostgreSQL, Storage
- **Stripe** — Checkout sessions, subscriptions, webhooks
- **GSAP** — ScrollTrigger animations
- **HTML5 Canvas 2D** — Client-side color grading engine

### Key Patterns

#### Client vs Server
- Components with interactivity use `"use client"` directive
- API routes (`src/app/api/`) handle auth verification, Stripe, uploads
- Supabase server client (`src/lib/supabase-server.ts`) uses async `cookies()` (Next.js 16)
- Supabase browser client (`src/lib/supabase.ts`) uses `createBrowserClient`

#### Authentication Flow
1. User signs up via `AuthModal` → Supabase `signUp()`
2. Auto-create `user_profiles` row via database trigger
3. Middleware (`src/middleware.ts`) refreshes sessions, protects `/tool`
4. OAuth callback at `/auth/callback` exchanges code for session

#### Payment Flow
1. User clicks plan in `Pricing` → calls `/api/checkout`
2. API verifies auth, creates/retrieves Stripe customer
3. Creates Checkout Session → redirects to Stripe
4. Webhook (`/api/webhook`) processes completion → updates `user_profiles.plan`

#### Color Grading Engine
- Client-side Canvas 2D pixel manipulation (`src/lib/colorGrading.ts`)
- No server processing needed — all rendering happens in browser
- Supports LUT presets, exposure, contrast, saturation, temperature, HSL, effects

---

## Coding Conventions

### File Organization
- Components go in `src/components/` — one component per file
- API routes go in `src/app/api/[route]/route.ts`
- Lib utilities go in `src/lib/`
- Hooks go in `src/hooks/`
- Database migrations go in `supabase/migrations/`

### Naming
- Components: PascalCase (`Gallery.tsx`, `AuthModal.tsx`)
- Utilities/hooks: camelCase (`useAuth.ts`, `colorGrading.ts`)
- API routes: lowercase (`route.ts`)
- CSS classes: Tailwind + custom editorial classes (`editorial-heading`, `section-number`)

### TypeScript
- Use strict typing — no `any` unless absolutely necessary
- Prefer interfaces over types for object shapes
- Use `type` imports: `import type { User } from "@supabase/supabase-js"`

### Styling
- Use Tailwind utility classes
- Reference CSS variables from `globals.css` for colors: `var(--accent-bronze)`, `var(--text-primary)`
- Editorial typography classes: `editorial-heading`, `editorial-display`, `editorial-body`, `editorial-caption`
- Border system: `var(--border-subtle)`, `var(--border-medium)`, `var(--border-accent)`
- Card system: `editorial-card`, `editorial-card-elevated`
- Scroll reveal: add `reveal` class, `reveal-delay-{1-6}` for stagger

### State Management
- Local state with `useState`/`useReducer`
- Auth state via `useAuth()` hook
- No global state library (keep it simple)

### API Routes
- Always verify auth: `const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser();`
- Return consistent error shape: `{ error: "message" }` with appropriate status codes
- Use service role client for webhooks (bypasses RLS)

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only) |
| `STRIPE_SECRET_KEY` | No | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe publishable key |

---

## Database Schema

### Tables
- `user_profiles` — User data, plan, Stripe customer ID
- `grading_jobs` — Color grading job history
- `user_presets` — Saved user presets
- `payments` — Payment/subscription records

### RLS Policies
- All tables have RLS enabled
- Users can only CRUD their own records
- Service role bypasses RLS for webhooks
- Public profiles are readable by all
- Public presets are viewable by all

### Triggers
- `on_auth_user_created` — Auto-create profile on signup
- `update_*_updated_at` — Auto-update timestamps

---

## Common Tasks

### Adding a new API route
1. Create `src/app/api/[name]/route.ts`
2. Import `createClient` from `@/lib/supabase-server`
3. Verify auth at the start
4. Return JSON responses with proper status codes

### Adding a new component
1. Create in `src/components/`
2. Add `"use client"` if it has interactivity
3. Use editorial CSS variables for colors
4. Add `reveal` class for scroll animations

### Adding a new database table
1. Create migration in `supabase/migrations/`
2. Enable RLS and add policies
3. Update TypeScript types if needed

### Modifying the color grading engine
- Edit `src/lib/colorGrading.ts`
- Uses Canvas 2D `getImageData`/`putImageData` for pixel manipulation
- All processing is client-side for instant preview

---

## Important Notes

- **Never commit `.env.local`** — it's in `.gitignore`
- **Never expose `SUPABASE_SERVICE_ROLE_KEY`** to the client
- **Always verify auth server-side** — don't trust client-side auth state
- **Stripe webhooks must use raw body** — don't parse JSON before signature verification
- **RLS is mandatory** — every table must have RLS policies
- The project uses **warm muted colors** — avoid bright/pastel accents
- Typography is **Playfair Display (serif)** for headings, **Inter** for body
