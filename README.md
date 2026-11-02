# EffectCraft — Cinematic Post-Production Platform

Grade. Effect. Deliver. — a fully self-contained Next.js platform combining:

- **Studio** — a browser-native color grading engine (Canvas 2D, single deterministic pass):
  film looks, exposure/contrast/saturation, white balance, 3-way color wheels,
  8-channel HSL isolation, `.cube` 3D LUTs (Pro), film grain / halation / bloom /
  HDR curve (Studio), split before/after compare, undo history, keyboard shortcuts
  (`B`, `E`, `R`, `⌘Z`), and tiered PNG/JPEG export up to 4K.
- **Prism Plugin Ecosystem** — 65 WASM modules across 8 categories with detail
  pages and real binary downloads (`/api/plugins/[id]/download`).
- **Tier keys** — Basic (free) / Pro / Studio / Lifetime. Deterministic,
  checksum-verified keys, persisted locally; demo generators are built in.
  Production Stripe + delivery plug into `buildLicense()`.

## Stack

Next.js 16 (App Router, Turbopack), React 19, TypeScript strict, Tailwind CSS 4.
No database, no auth provider, no external services — everything runs client-side.

## Run

```bash
bun install
bun run dev        # http://localhost:3000
bun run build && bun run start
```

## Structure

```
app/                 routes (landing, studio, plugins, pricing, support)
components/          landing / studio / plugins / pricing / support / site
lib/grade/           engine (params, looks, cube, stage, export, sample)
lib/license.ts       tier keys: generate / validate / persist
lib/catalog.ts       typed access to catalog.json
private/plugins/     Prism binaries (served via download route)
public/media/prism/  rendered reference frames
```

## Environment

None required to run.

Production licensing requires two Vercel environment variables (Project → Settings → Environment Variables):

- `ADMIN_PIN` — the private PIN for `/admin` (min 6 chars). Holders can mint keys at `/admin`.
- `LICENSE_SECRET` — long random string (min 16 chars, e.g. `openssl rand -hex 24`). Seeds the HMAC that signs every key. Rotate to invalidate all keys at once.

Mint keys from the terminal instead: `LICENSE_SECRET=… bun run mint [bundle|pro|studio|lifetime] "customer name"`.

## Licensing model

- Basic (free) / Bundle / Pro (30d) / Studio (365d) / Lifetime (never)
- Keys: 19 chars, HMAC-signed server-side, verified via `POST /api/license/validate`
- Plugin downloads re-verify the key per request (`/api/plugins/[id]/download?key=…`)
- Prices: Pro $9 · Studio $19 · Lifetime $59 · Prism Bundle $29
