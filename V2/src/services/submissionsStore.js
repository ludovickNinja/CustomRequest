/**
 * Submissions store — the single data-access layer for custom requests.
 *
 * Every place in the app that needs to read or write a submission goes
 * through this module. That means the customer Review & Submit page, the
 * customer "Ongoing Requests" list and detail pages, the comments thread,
 * and eventually the admin and factory views all share one surface.
 *
 * Today the store is implemented against `localStorage` under the key
 * `customrequest:submissions`. When the real backend ships, the body of
 * each exported function swaps to fetch() (or whatever the API uses) and
 * no caller has to change.
 *
 * Shape of a stored submission record:
 *   {
 *     id:           string,          // stable per submission
 *     submittedAt:  string,          // ISO-8601 timestamp
 *     collection:   string,          // collection id from data/collections.js
 *     contact:      { ... },         // mirrors CustomRequestContext defaultContact
 *     designs:      [ { ... } ],     // array of design objects (multi-design support)
 *     comments?:    [
 *       { id, author, body, createdAt }
 *     ],
 *   }
 *
 * The shape is intentionally minimal — we don't validate it on read because
 * the form upstream already enforces the required fields. Older records that
 * predate the `id` field get one assigned by `normalize` on read.
 */

import seedSubmissions from '../../../Data/submissions.json';
import { needsAttention } from '../data/statuses.js';

const STORAGE_KEY = 'customrequest:submissions';

/**
 * Tracks which version of the mock data is currently sitting in
 * localStorage. Bump SEED_VERSION whenever the fixtures in
 * `Data/submissions.json` change shape or content — readAll then re-seeds
 * so the refreshed mock-ups always show up. (This is a POC; the JSON is the
 * source of truth, localStorage is just a working copy for the session.)
 */
const SEED_VERSION_KEY = 'customrequest:seedVersion';
const SEED_VERSION = '2026-06-09-references';

/**
 * Demo/mock-up seeding. Copies the shared fixtures from
 * `Data/submissions.json` into localStorage so the requests list and the
 * In House / Factory views have realistic records to show. When the real
 * backend lands this whole helper disappears with the rest of the
 * localStorage implementation.
 */
function seedFixtures() {
  if (typeof window === 'undefined') return [];
  try {
    const seed = Array.isArray(seedSubmissions) ? seedSubmissions : [];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    window.localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    return seed;
  } catch {
    return [];
  }
}

/**
 * Read every submission out of localStorage. Returns an empty array on
 * SSR (no `window`) or on malformed JSON — so the UI can always assume an
 * array.
 *
 * (Re)seeds from the JSON fixtures whenever there's nothing stored yet, or
 * the stored mock-data version is stale. That stale-version check is what
 * lets refreshed fixtures replace whatever an earlier visit left behind,
 * instead of being permanently shadowed by it.
 */
function readAll() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const version = window.localStorage.getItem(SEED_VERSION_KEY);
    if (raw == null || version !== SEED_VERSION) return seedFixtures();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Persist the full list. Quota errors are swallowed so the UI keeps working. */
function writeAll(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // localStorage quota or a private-mode browser — best effort only.
  }
}

/**
 * Make sure every record has an `id`. Older entries (created before the
 * store assigned ids) fall back to their submittedAt timestamp, or a
 * random suffix if even that is missing.
 */
function normalize(submission) {
  if (submission.id) return submission;
  return {
    ...submission,
    id: submission.submittedAt || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

/**
 * List submissions, optionally scoped, filtered, and sorted.
 *
 * `accountId` scopes the result to a single store/account — the customer
 * view passes its current store so a store only ever sees its own
 * requests; the (future) admin/In House view omits it to see everything.
 *
 * Searching is a case-insensitive substring match across the PO reference,
 * account name, contact name, email, and collection id. Sort options:
 *   - "newest" (default) — by submittedAt descending
 *   - "oldest"           — by submittedAt ascending
 *   - "po"               — by PO/reference alphabetical
 *   - "account"          — by account name alphabetical
 */
export function listSubmissions({ search = '', sort = 'newest', accountId = null } = {}) {
  const all = readAll().map(normalize);
  const items = accountId ? all.filter((s) => s.accountId === accountId) : all;

  const q = search.trim().toLowerCase();
  const filtered = q
    ? items.filter((s) => {
        // Build a single search "haystack" so partial matches across any
        // of the indexed fields still hit.
        const haystack = [
          s.contact?.poReference,
          s.contact?.accountName,
          s.contact?.contactName,
          s.contact?.email,
          s.collection,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
    : items;

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'oldest') return new Date(a.submittedAt) - new Date(b.submittedAt);
    if (sort === 'po') return (a.contact?.poReference || '').localeCompare(b.contact?.poReference || '');
    if (sort === 'account') return (a.contact?.accountName || '').localeCompare(b.contact?.accountName || '');
    // "newest" — and the fallback for anything we don't recognize.
    return new Date(b.submittedAt) - new Date(a.submittedAt);
  });

  return sorted;
}

/** Fetch a single submission by id, or null if it doesn't exist. */
export function getSubmission(id) {
  return readAll().map(normalize).find((s) => s.id === id) || null;
}

/**
 * Highest reference sequence currently stored. Reference numbers look like
 * "R50001" and quotes "Q80001"; both share this running sequence so a new
 * reference gets the next pair (R/Q) after whatever already exists.
 */
function maxRefSeq(items) {
  let max = 50000;
  for (const s of items) {
    for (const d of s.designs || []) {
      const n = parseInt(String(d.referenceNo || '').replace(/^R/, ''), 10);
      if (Number.isFinite(n) && n > max) max = n;
    }
  }
  return max;
}

/**
 * Stamp the per-reference workflow fields onto a design that doesn't have
 * them yet (i.e. one a customer just submitted). `seq` is the reference
 * sequence number to assign. New references always start at status "new",
 * unassigned to a factory and unpriced.
 */
function stampWorkflow(design, seq) {
  return {
    ...design,
    referenceNo: design.referenceNo || `R${seq}`,
    quoteNo: design.quoteNo || `Q${30000 + seq}`,
    status: design.status || 'new',
    factoryId: design.factoryId ?? null,
    price: design.price ?? null,
    pricePublished: design.pricePublished ?? false,
    currency: design.currency || 'USD',
    assets: design.assets || [],
    messages: design.messages || [],
  };
}

/**
 * Persist a new submission. The caller supplies the contact / designs /
 * collection payload; we stamp a submittedAt, id, and per-reference
 * workflow fields, append to the list, and return the final record so the
 * UI can immediately render the confirmation page.
 */
export function createSubmission(payload) {
  const submittedAt = payload.submittedAt || new Date().toISOString();
  const items = readAll();
  let seq = maxRefSeq(items);
  const designs = (payload.designs || []).map((d) => stampWorkflow(d, ++seq));
  const record = normalize({ ...payload, designs, submittedAt });
  writeAll([...items, record]);
  return record;
}

/** Return the comments thread for a submission (empty array if none). */
export function listComments(submissionId) {
  const all = readAll().map(normalize);
  const target = all.find((s) => s.id === submissionId);
  return target?.comments || [];
}

/**
 * Append a comment to a submission. Returns the new comment record on
 * success, or `null` if the body was empty (callers can use that to keep
 * the textarea focused). Empty / whitespace-only bodies are rejected here
 * so the UI doesn't have to duplicate the check.
 */
export function addComment(submissionId, { author = 'Customer', body }) {
  if (!body || !body.trim()) return null;
  const items = readAll().map(normalize);
  const comment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    author,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  const next = items.map((s) => {
    if (s.id !== submissionId) return s;
    return { ...s, comments: [...(s.comments || []), comment] };
  });
  writeAll(next);
  return comment;
}

/* ------------------------------------------------------------------ *
 * Reference-level access (the admin / In House view).
 *
 * The admin works one reference at a time — a single design inside a
 * customer request. These helpers flatten every submission's `designs`
 * into reference rows (carrying the parent request's context) and let the
 * admin update a reference's status, factory, pricing, renderings, and
 * message thread. A reference is addressed by its globally-unique
 * `referenceNo` (e.g. "R50002").
 * ------------------------------------------------------------------ */

/** Turn a submission + design into a flat reference row for the queue. */
function toReferenceRow(submission, design, designIndex) {
  return {
    referenceNo: design.referenceNo,
    quoteNo: design.quoteNo,
    status: design.status || 'new',
    factoryId: design.factoryId ?? null,
    price: design.price ?? null,
    pricePublished: !!design.pricePublished,
    currency: design.currency || 'USD',
    assetsCount: (design.assets || []).length,
    messagesCount: (design.messages || []).length,
    // Parent request context, denormalized for the table.
    submissionId: submission.id,
    designIndex,
    designCount: submission.designs?.length ?? 1,
    accountId: submission.accountId ?? null,
    accountName: submission.contact?.accountName || '',
    poReference: submission.contact?.poReference || '',
    contactName: submission.contact?.contactName || '',
    salesPerson: submission.salesPerson || '',
    collection: submission.collection,
    submittedAt: submission.submittedAt,
  };
}

/** Every reference across every submission, flattened. */
function allReferences(items) {
  const rows = [];
  for (const s of items) {
    (s.designs || []).forEach((d, i) => rows.push(toReferenceRow(s, d, i)));
  }
  return rows;
}

/**
 * List references for the admin queue, optionally filtered.
 *   - `search`    — substring match across quote, reference, PO, account,
 *                   contact, sales person, and collection.
 *   - `status`    — a status id, or 'all'.
 *   - `factoryId` — a factory id, 'all', or 'unassigned'.
 * Sorted newest-submitted first.
 */
export function listReferences({ search = '', status = 'all', factoryId = 'all' } = {}) {
  let rows = allReferences(readAll().map(normalize));

  if (status && status !== 'all') rows = rows.filter((r) => r.status === status);
  if (factoryId && factoryId !== 'all') {
    rows = rows.filter((r) => (factoryId === 'unassigned' ? !r.factoryId : r.factoryId === factoryId));
  }

  const q = search.trim().toLowerCase();
  if (q) {
    rows = rows.filter((r) =>
      [r.quoteNo, r.referenceNo, r.poReference, r.accountName, r.contactName, r.salesPerson, r.collection]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }

  return rows.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}

/** Locate a reference and its parent submission by reference number. */
function locateReference(referenceNo) {
  const items = readAll().map(normalize);
  for (const s of items) {
    const designIndex = (s.designs || []).findIndex((d) => d.referenceNo === referenceNo);
    if (designIndex >= 0) return { items, submission: s, design: s.designs[designIndex], designIndex };
  }
  return { items, submission: null, design: null, designIndex: -1 };
}

/**
 * Fetch one reference for the detail page: the design (with its assets and
 * messages) plus the parent request's context. Returns null if not found.
 */
export function getReference(referenceNo) {
  const { submission, design, designIndex } = locateReference(referenceNo);
  if (!submission || !design) return null;
  return {
    ...toReferenceRow(submission, design, designIndex),
    design,
    contact: submission.contact || {},
  };
}

/** Write a patched design back into its submission, then persist. */
function commitDesign(referenceNo, patchDesign) {
  const { items, submission, design, designIndex } = locateReference(referenceNo);
  if (!submission || !design) return null;
  const nextDesign = patchDesign(design);
  const nextSubmission = {
    ...submission,
    designs: submission.designs.map((d, i) => (i === designIndex ? nextDesign : d)),
  };
  writeAll(items.map((s) => (s.id === submission.id ? nextSubmission : s)));
  return nextDesign;
}

/**
 * Update a reference's workflow fields (status, factoryId, price,
 * pricePublished, currency). Only the provided keys are changed. Returns
 * the refreshed reference row (via getReference) or null if not found.
 */
export function updateReference(referenceNo, patch = {}) {
  const allowed = ['status', 'factoryId', 'price', 'pricePublished', 'currency'];
  const clean = Object.fromEntries(Object.entries(patch).filter(([k]) => allowed.includes(k)));
  const result = commitDesign(referenceNo, (d) => ({ ...d, ...clean }));
  return result ? getReference(referenceNo) : null;
}

/** Attach a rendering/asset to a reference. Returns the new asset, or null. */
export function addReferenceAsset(referenceNo, { name, kind = 'rendering', uploadedBy = 'Admin' }) {
  if (!name || !name.trim()) return null;
  const asset = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: name.trim(),
    kind,
    uploadedBy,
    uploadedAt: new Date().toISOString(),
  };
  const result = commitDesign(referenceNo, (d) => ({ ...d, assets: [...(d.assets || []), asset] }));
  return result ? asset : null;
}

/**
 * Post a message on a reference's thread. `role` is 'admin' or 'customer'
 * so the UI can style replies. Empty bodies are rejected. Returns the new
 * message, or null.
 */
export function addReferenceMessage(referenceNo, { author = 'Admin', role = 'admin', body }) {
  if (!body || !body.trim()) return null;
  const message = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    author,
    role,
    body: body.trim(),
    createdAt: new Date().toISOString(),
  };
  const result = commitDesign(referenceNo, (d) => ({ ...d, messages: [...(d.messages || []), message] }));
  return result ? message : null;
}

/** Totals for the admin summary line: total references and how many need attention. */
export function referenceStats() {
  const rows = allReferences(readAll().map(normalize));
  const attention = rows.filter((r) => needsAttention(r.status)).length;
  return { total: rows.length, attention };
}
