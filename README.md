# Custom Request

A multi-step custom-ring request flow for CrownRing, Noam Carver, MFit My
Caroline, and full-custom designs. Built with Vite + React + Tailwind. The
site is served as a static bundle from `https://ludovickninja.github.io/CustomRequest/`.

## Two versions side by side

The repo ships two independent Vite apps so we can keep a frozen reference of
the original flow while iterating on the next iteration:

| Version | URL                              | What's there                                                                                  |
| ------- | -------------------------------- | --------------------------------------------------------------------------------------------- |
| **V1**  | `/CustomRequest/V1/`             | The original flow, including the (placeholder) Specifications step. **Frozen** — do not edit. |
| **V2**  | `/CustomRequest/V2/`             | Active development. Specifications step removed, Review & Submit, multi-design support, etc. |

The root `index.html` is a tiny landing page that links to both versions.

> **Where do I make changes?** Almost always inside `V2/`. V1 is a baseline
> we keep around for comparison. Touch V1 only if you've been explicitly asked
> to.

## Repo layout

```
.
├── V1/                          # Vite app served at /CustomRequest/V1/ (frozen)
├── V2/                          # Vite app served at /CustomRequest/V2/ (active)
│   ├── src/
│   │   ├── App.jsx              # Thin composition root: mounts role route modules
│   │   ├── main.jsx             # Vite entry — wraps <App/> in a HashRouter
│   │   ├── index.css            # Tailwind layer + a couple of custom utility classes
│   │   │
│   │   ├── shared/              # UI used by every role (TopBar, Stepper, PageFooter, FieldRow)
│   │   ├── data/                # Static lookup data (collections, ring-size tables)
│   │   ├── state/               # React Context for the customer's in-progress form
│   │   ├── services/            # Single data-access layer for submissions + comments
│   │   │
│   │   ├── customer/            # Pages and components the buyer touches
│   │   │   ├── routes.jsx
│   │   │   ├── pages/
│   │   │   └── components/{collection,contact,design}/
│   │   │
│   │   ├── admin/               # In House view — reference queue + detail
│   │   │   ├── routes.jsx
│   │   │   ├── components/
│   │   │   └── pages/
│   │   │
│   │   └── factory/             # Placeholder section, role-gated by URL today
│   │       ├── routes.jsx
│   │       └── pages/
│   │
│   ├── index.html, package.json, vite.config.js, tailwind.config.js, postcss.config.js
│
├── Data/                        # Shared mock-up fixtures (plain JSON, framework-neutral)
│   ├── submissions.json         # Sample custom-request records
│   └── README.md                # Record shape + how each view consumes it
│
├── index.html                   # Static landing page at /CustomRequest/
└── .github/workflows/deploy.yml # Builds V1 + V2 + copies landing page to dist/
```

### Why role-based folders?

V2 serves three user roles from a single build:

- **Customer** — buyer using the request flow, the request list, and the
  request detail page.
- **Admin** — In House team. "Admin Operations" shows a reference-level
  queue across every account (one row per design), with search and
  status/factory filters; each reference opens a detail panel to update
  status, assign a factory, upload renderings, answer messages, and publish
  pricing.
- **Factory** — production team viewing assigned requests (placeholder today).

Each role lives in its own folder with its own `routes.jsx`. `App.jsx` is a
thin composition root that pulls in each role's route subtree. To add a new
page, drop it inside `customer/pages/`, `admin/pages/`, or `factory/pages/`
and add a `<Route>` to that role's `routes.jsx`.

URL paths gate the roles today (no auth):

- `/` and `/design/*` and `/requests/*` → customer
- `/admin/*` → admin
- `/factory/*` → factory

When real auth lands, route guards drop into each role's `routes.jsx`.

### The `services/` layer

Everything that touches persistence goes through
`V2/src/services/submissionsStore.js`:

- `listSubmissions({ search, sort })` — search and sort the customer's
  submissions.
- `getSubmission(id)` — fetch a single submission by id.
- `createSubmission(payload)` — write a new submission. Used by the customer's
  Review & Submit page.
- `listComments(id)` / `addComment(id, comment)` — comments thread on a
  submission.
- `listReferences({ search, status, factoryId })` / `getReference(refNo)` —
  the admin queue and detail, flattened to one row per design.
- `updateReference(refNo, patch)` / `addReferenceAsset` / `addReferenceMessage`
  / `referenceStats()` — the In House view's reference-level writes + totals.

Today this module reads/writes the `customrequest:submissions` key in
`localStorage`. When the real backend lands, only this file changes — every
caller in `customer/`, `admin/`, and `factory/` stays the same.

On a visitor's first read with nothing stored, the store seeds the shared
mock fixtures from the repo-root [`Data/submissions.json`](Data/README.md)
(guarded by a one-time flag so deleting every request doesn't re-create them).
Because all three roles read through this store, the same fixtures populate the
customer requests list and the future In House / Factory views for free.

### The `state/CustomRequestContext.jsx` reducer

The customer's *in-progress* form (contact info + array of designs) lives in
React Context and is persisted to `localStorage` under `customrequest:v1` so
refresh and back-navigation don't lose data. Once the form is submitted, the
final snapshot is handed off to `submissionsStore.createSubmission`.

Helpers exposed by the context:

- `setContact(patch)` / `setContactField(field, value)`
- `updateDesign(index, patch)` — multi-design support
- `updateDesignField(index, field, value)`
- `updateCenterStone(index, patch)`
- `addDesign()` / `removeDesign(index)`
- `markSubmitted()` / `resetAll()`

File uploads are kept in memory only; metadata persists but the blob URLs
need to be re-attached after a refresh.

## Customer flow (V2)

1. **Collection picker** (`/`). The buyer picks a collection (or jumps to a
   Full Custom request). The "View Ongoing Requests" link below the lede
   sends them to the requests list.
2. **Contact Information** (`/design/:collection`). PO# / reference / client
   name, contact details, project type, quote type, optional appointment, and
   notes.
3. **Design Details** (`/design/:collection/details`). One or more designs,
   each with SKUs, Metal (Tone / Karat / Colors), Finger Size, Center Stone,
   and optional notes + reference images. "Add Another Design" appends a
   blank collapsible card so a single submission can ship multiple designs.
4. **Review & Submit** (`/design/:collection/review`). Final summary across
   every design. Submitting writes through `submissionsStore.createSubmission`
   and shows an inline confirmation.

### Ongoing requests

- **List** (`/requests`). Every locally stored submission, with a search box
  (PO / reference / account / contact / email / collection) and a sort
  dropdown (Newest / Oldest / PO A→Z / Account A→Z).
- **Detail** (`/requests/:id`). Submission summary, one card per design, a
  Comments thread the customer can post into, and a sticky Quote sidebar
  that currently shows a "Pending review" placeholder.

## Local development

Each version is a self-contained Vite project. Pick one:

```bash
cd V2
npm install
npm run dev
```

Vite prints a local URL like `http://localhost:5173/CustomRequest/V2/`.

## Build & preview

From inside `V1/` or `V2/`:

```bash
npm run build
npm run preview
```

Each version's `vite.config.js` writes its build into `../dist/V1` or
`../dist/V2`, so a single deploy artifact (`dist/`) contains both versions.

## Deployment

`.github/workflows/deploy.yml` runs on every push to `main`. It:

1. Installs and builds `V1/`.
2. Installs and builds `V2/`.
3. Copies the root `index.html` landing page into `dist/`.
4. Publishes `dist/` to GitHub Pages.

Before the first deploy, set the repo's Pages source to **GitHub Actions**
under `Settings → Pages`.

## Conventions

- **Branch naming**: `claude/<short-description>` for development branches.
- **PR scope**: keep each PR focused. Big refactors live in their own PR
  separate from feature work whenever possible.
- **No comments rot**: only add comments that explain *why*. Avoid comments
  that just restate the code or that reference a specific task/PR.
