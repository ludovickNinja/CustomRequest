# Data

Shared mock-up fixtures for the Custom Request project. These files are the
**single source of truth for sample data** so the same records can power every
view — today the V2 customer requests list, and (once they're built out) the
In House and Factory views that live as roles inside V2. They're plain JSON
on purpose: framework-neutral, so a future real backend, a seed script, or any
other tool can read the exact same fixtures without depending on the React app.

## Files

| File               | What it holds                                                        |
| ------------------ | -------------------------------------------------------------------- |
| `submissions.json` | An array of custom-request records — one per submitted request.      |

## How it's consumed today

`V2/src/services/submissionsStore.js` imports `submissions.json` and seeds it
into `localStorage` the first time a visitor lands with no stored requests.
After that, the store reads and writes `localStorage` as usual. Because every
role in V2 (customer, In House/admin, Factory) reads through that one store,
the fixtures show up everywhere automatically.

The cross-folder import works in production because the Vite build follows the
import graph at build time. For the dev server, `V2/vite.config.js` adds the
repo root to `server.fs.allow` so the file can be served outside the app root.

When the real backend lands, the store stops seeding from here — the backend
becomes the source of truth and this folder reverts to being fixtures for
local development, tests, and demos.

## Record shape

Each entry in `submissions.json` mirrors the record shape documented in
`V2/src/services/submissionsStore.js` and the form defaults in
`V2/src/state/CustomRequestContext.jsx`:

```jsonc
{
  "id": "REQ-2026-0512-RB1",        // stable, unique per submission
  "submittedAt": "2026-05-12T15:42:00.000Z", // ISO-8601
  "collection": "crownring",        // id from V2/src/data/collections.js
  "contact": { /* mirrors defaultContact */ },
  "designs": [ /* one or more designs, each mirroring defaultDesign */ ],
  "comments": [                      // optional thread
    { "id": "...", "author": "...", "body": "...", "createdAt": "..." }
  ]
}
```

Valid enum values (keep fixtures in sync with the form):

- `collection` — `crownring`, `noam-carver`, `mia-my-caroline`, `full-custom`
- `contact.quoteType` — `quote-only`, `quote-and-design`
- `contact.projectType` — `Engagement Ring`, `Wedding Band`, `Anniversary Ring`, `Fashion Ring`, `Other`
- `metal.tone` — `single`, `two-tone`
- `metal.karat` — `10K`, `14K`, `18K`, `Platinum`, `Other` (single tone); `14K / Platinum`, `18K / Platinum` for two-tone combos
- `metal.colors` — `yellow-gold`, `white-gold`, `rose-gold`
- `centerStone.type` — `Diamond`, `Lab-Grown Diamond`, `Moissanite`, `Gemstone`
- `fingerSizeSystem` — `US`, `EU`, `UK`
