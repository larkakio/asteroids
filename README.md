# Asteroids – Mini App for Base.app & Farcaster

Classic arcade Asteroids game as a [Base mini app](https://docs.base.org/mini-apps/quickstart/create-new-miniapp) and Farcaster mini app. Blast asteroids, avoid collisions, and beat the high score.

## Features

- **Gameplay**: Ship, asteroids, bullets, score, high score (stored in `localStorage`)
- **Controls**: Keyboard (arrows / WASD, Space to fire) and touch (on-screen buttons, 44px+ targets per [Base guidelines](https://docs.base.org/mini-apps/featured-guidelines/overview))
- **Manifest**: `farcaster.config.ts` and `/.well-known/farcaster.json` for Base/Farcaster
- **Auth**: Optional Farcaster context and `/api/auth` for quick-auth
- **Theme**: Light/dark via `prefers-color-scheme`

## Quick start

```bash
cp .example.env .env
# Set NEXT_PUBLIC_URL when deploying (e.g. https://asteroids-vert.vercel.app)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Base

1. **Deploy** the app (e.g. [Vercel](https://vercel.com)) and set `NEXT_PUBLIC_URL` to your production URL (e.g. `https://asteroids-vert.vercel.app`).
2. **Manifest**: Update `farcaster.config.ts` (name, description, screenshots, etc.). Add `accountAssociation` after verifying your domain in [Base Build](https://www.base.dev/preview?tab=account).
3. **Preview**: Use [base.dev/preview](https://base.dev/preview) to test embeds and metadata.
4. **Publish**: Post your app URL in the Base app.

## Project structure

- `app/` – Next.js App Router (layout, page, providers, components)
- `app/.well-known/farcaster.json/` – Serves manifest for Base/Farcaster
- `app/api/auth/` – Farcaster quick-auth
- `app/api/webhook/` – Webhook endpoint (optional)
- `app/components/AsteroidsGame.tsx` – Canvas game logic and UI
- `farcaster.config.ts` – Mini app manifest and metadata
- `public/` – `icon.png`, `hero-image.png`, `screenshot-portrait.png`

## Assets

- **Icon** (e.g. 1024×1024): `public/icon.png` – used in manifest and app listing.
- **Hero / splash**: `public/hero-image.png` – used for splash and OG image.
- **Screenshot**: `public/screenshot-portrait.png` – for store listing (replace with real gameplay screenshots if needed).

For featured placement, see [Base Featured Checklist](https://docs.base.org/mini-apps/featured-guidelines/overview) (icon 1024×1024, cover 1200×630, 3 screenshots 1284×2778, etc.).
