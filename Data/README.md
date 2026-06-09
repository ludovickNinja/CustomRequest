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
| `accounts.json`    | The canonical store/account list (the tenants the app is scoped to). |
| `factories.json`   | Production factories (in-house or external) references get assigned to. |

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
  "accountId": "robbins-brothers",  // store this request belongs to (see accounts.json)
  "submittedAt": "2026-05-12T15:42:00.000Z", // ISO-8601
  "collection": "crownring",        // id from V2/src/data/collections.js
  "contact": { /* mirrors defaultContact */ },
  "designs": [ /* one or more designs, each mirroring defaultDesign */ ],
  "comments": [                      // optional thread
    { "id": "...", "author": "...", "body": "...", "createdAt": "..." }
  ]
}
```

## Store scoping

`accounts.json` is the tenant list. Each entry is a store/company:

```jsonc
{ "id": "robbins-brothers", "name": "Robbins Brothers", "location": "Los Angeles, CA" }
```

Every submission carries an `accountId` pointing at one of these. The customer
view is scoped to a single store — it only ever shows that store's requests —
while the In House (admin) view sees every account. Today the "current store"
is chosen with the store switcher in the top-right (no auth yet); it's held in
`V2/src/state/StoreContext.jsx` and persisted under `customrequest:currentAccount`.
`listSubmissions({ accountId })` does the filtering; new submissions are tagged
with the current store on submit.

Keep the `accountId` on each record in sync with an `id` in `accounts.json`.

## Reference workflow (admin / In House view)

The admin works one **reference** at a time — a single design within a request.
Each design therefore carries workflow fields the In House view reads and
writes, and each submission carries the `salesPerson` who owns it:

```jsonc
{
  "salesPerson": "Emma Laurent",          // on the submission
  "designs": [
    {
      /* ...the design fields... */
      "referenceNo": "R50001",            // globally unique per design
      "quoteNo": "Q80001",                // quote number for this reference
      "status": "new",                    // see the status pipeline below
      "factoryId": "goldworks-ny",         // assigned factory (id in factories.json) or null
      "currency": "USD",
      "price": 2400,                       // published or draft price, or null
      "pricePublished": true,             // is the price visible to the customer?
      "assets": [                          // uploaded renderings
        { "id": "...", "name": "R50001-cad-v1.png", "kind": "rendering", "uploadedBy": "...", "uploadedAt": "..." }
      ],
      "messages": [                        // per-reference message thread
        { "id": "...", "author": "...", "role": "customer", "body": "...", "createdAt": "..." }
      ]
    }
  ]
}
```

**Status pipeline** (`V2/src/data/statuses.js`):
`new` → `in-review` → `quoted` → `in-cad` → `in-production` → `shipped`.
The "needing attention" count on the admin page is the number of references
sitting in a status that's waiting on internal action (`new`, `in-review`,
`in-cad`).

**Factories** (`factories.json`) are the teams a reference is distributed to:

```jsonc
{ "id": "crownring-mtl", "name": "CrownRing Atelier — Montréal", "type": "in-house" }
```

New customer submissions get these workflow fields stamped on at creation time
(`createSubmission`): status `new`, unassigned, unpriced, with the next
sequential reference/quote numbers.

Valid enum values (keep fixtures in sync with the form):

- `collection` — `crownring`, `noam-carver`, `mia-my-caroline`, `full-custom`
- `contact.quoteType` — `quote-only`, `quote-and-design`
- `contact.projectType` — `Engagement Ring`, `Wedding Band`, `Anniversary Ring`, `Fashion Ring`, `Other`
- `metal.tone` — `single`, `two-tone`
- `metal.karat` — `10K`, `14K`, `18K`, `Platinum`, `Other` (single tone); `14K / Platinum`, `18K / Platinum` for two-tone combos
- `metal.colors` — `yellow-gold`, `white-gold`, `rose-gold`
- `centerStone.type` — `Diamond`, `Lab-Grown Diamond`, `Moissanite`, `Gemstone`
- `fingerSizeSystem` — `US`, `EU`, `UK`
