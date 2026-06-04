# Custom Request

A multi-step custom-ring request flow for CrownRing, Noam Carver, MFit My Caroline, and full-custom designs. Built with Vite + React + Tailwind and hosted on GitHub Pages at <https://ludovickninja.github.io/CustomRequest/>.

## Versions

The repo ships two independent builds that deploy side by side:

| Version | URL | Notes |
| --- | --- | --- |
| **V1** | `/CustomRequest/V1/` | Full flow with the Specifications step. |
| **V2** | `/CustomRequest/V2/` | Same as V1, but the Specifications page is removed and submitting on the Design Details page shows an inline confirmation. |

A small landing page at `/CustomRequest/` links to both versions. **Before making changes, decide whether they belong in `V1/`, `V2/`, or both — refer to the version currently on the website.**

## Repo layout

```
.
├── V1/                  # Vite app for /CustomRequest/V1/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js   # base: '/CustomRequest/V1/', outDir: ../dist/V1
├── V2/                  # Vite app for /CustomRequest/V2/
│   └── ...              # mirrors V1, minus SpecificationsPage and its route
├── index.html           # landing page copied into dist/ during deploy
└── .github/workflows/deploy.yml
```

## Pages (per version)

1. **Collection picker** (`/`) — choose a collection (or start a full custom request).
2. **Contact Information** (`/design/:collection`).
3. **Design Details** (`/design/:collection/details`).
4. **Specifications** (`/design/:collection/specifications`) — **V1 only**. V2 ends with an inline "Request Submitted" view on Design Details.

Form state is held in a React Context and persisted to `localStorage` under the key `customrequest:v1` so refresh and back-navigation don't lose data. File uploads are in-memory only; metadata persists but blobs require re-attachment after a refresh.

## Local development

Each version is a self-contained Vite project. Pick one and run it:

```bash
cd V1
npm install
npm run dev
```

```bash
cd V2
npm install
npm run dev
```

Vite prints a localhost URL with the version's base path (e.g. `http://localhost:5173/CustomRequest/V1/`).

## Images

Drop product photos and logos into each version's `public/images/` using the filenames declared in `src/data/collections.js`. The components fall back gracefully when an image is missing.

## Build & preview

From inside `V1/` or `V2/`:

```bash
npm run build
npm run preview
```

Build output goes to `../dist/V1` or `../dist/V2` (i.e. `dist/V1` / `dist/V2` at the repo root) so a single deploy artifact contains both versions.

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main`. It installs and builds both `V1/` and `V2/`, copies the root `index.html` landing page into `dist/`, and publishes `dist/` to GitHub Pages. Before the first deploy, set the repo's Pages source to **GitHub Actions** under `Settings → Pages`.
