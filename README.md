# Custom Request

A multi-step custom-ring request flow for CrownRing, Noam Carver, MFit My Caroline, and full-custom designs. Built with Vite + React + Tailwind and hosted on GitHub Pages.

## Pages

1. **Collection picker** (`/`) — choose a collection (or start a full custom request).
2. **Contact Information** (`/design/:collection`) — Step 2 of 5.
3. **Design Details** (`/design/:collection/details`) — Step 3 of 5.
4. **Specifications** (`/design/:collection/specifications`) — Step 4 placeholder.

Form state for steps 2 and 3 is held in a React Context and persisted to `localStorage` under the key `customrequest:v1` so refresh and back-navigation don't lose data. File uploads on Step 3 are in-memory only; metadata persists but blobs require re-attachment after a refresh.

## Local development

```bash
npm install
npm run dev
```

Open the printed URL (typically http://localhost:5173/CustomRequest/).

## Images

Drop product photos and logos into `public/images/` using the filenames declared in `src/data/collections.js`. The components fall back gracefully when an image is missing.

## Build & preview

```bash
npm run build
npm run preview
```

`vite.config.js` sets `base: '/CustomRequest/'` so paths work under `https://<owner>.github.io/CustomRequest/`.

## Deployment

`.github/workflows/deploy.yml` builds and publishes the site to GitHub Pages on every push to `main`. Before the first deploy, set the repo's Pages source to **GitHub Actions** under `Settings → Pages`.
