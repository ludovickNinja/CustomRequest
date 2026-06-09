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

const STORAGE_KEY = 'customrequest:submissions';

/**
 * One-time flag so a visitor who deletes every request doesn't get the
 * mock fixtures silently re-created on the next read.
 */
const SEED_FLAG_KEY = 'customrequest:seeded';

/**
 * Demo/mock-up seeding. The first time someone lands with nothing stored,
 * copy the shared fixtures from `/Data/submissions.json` into localStorage
 * so the requests list — and the In House / Factory views once they're
 * built — have realistic records to show. Guarded by SEED_FLAG_KEY so it
 * only ever runs once per browser. When the real backend lands this whole
 * helper disappears along with the rest of the localStorage implementation.
 */
function seedFixtures() {
  if (typeof window === 'undefined') return [];
  try {
    if (window.localStorage.getItem(SEED_FLAG_KEY)) return [];
    const seed = Array.isArray(seedSubmissions) ? seedSubmissions : [];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    window.localStorage.setItem(SEED_FLAG_KEY, '1');
    return seed;
  } catch {
    return [];
  }
}

/**
 * Read every submission out of localStorage. Returns an empty array on
 * SSR (no `window`) or on malformed JSON — so the UI can always assume an
 * array. The very first read with no stored value seeds the mock fixtures.
 */
function readAll() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw == null) return seedFixtures();
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
 * List submissions, optionally filtered and sorted.
 *
 * Searching is a case-insensitive substring match across the PO reference,
 * account name, contact name, email, and collection id. Sort options:
 *   - "newest" (default) — by submittedAt descending
 *   - "oldest"           — by submittedAt ascending
 *   - "po"               — by PO/reference alphabetical
 *   - "account"          — by account name alphabetical
 */
export function listSubmissions({ search = '', sort = 'newest' } = {}) {
  const items = readAll().map(normalize);

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
 * Persist a new submission. The caller supplies the contact / designs /
 * collection payload; we stamp a submittedAt and id, append to the list,
 * and return the final record so the UI can immediately render the
 * confirmation page.
 */
export function createSubmission(payload) {
  const submittedAt = payload.submittedAt || new Date().toISOString();
  const record = normalize({ ...payload, submittedAt });
  writeAll([...readAll(), record]);
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
