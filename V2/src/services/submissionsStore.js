// Single data-access layer for custom-request submissions.
// All persistence reads/writes live here so the rest of the app
// (customer / admin / factory views) only depends on this surface.
// Today it reads/writes localStorage; when the backend ships, the body
// of each function swaps to fetch() without touching callers.

const STORAGE_KEY = 'customrequest:submissions';

function readAll() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors
  }
}

function normalize(submission) {
  // Always present an `id` to callers even if older records didn't have one.
  if (submission.id) return submission;
  return {
    ...submission,
    id: submission.submittedAt || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

export function listSubmissions({ search = '', sort = 'newest' } = {}) {
  const items = readAll().map(normalize);
  const q = search.trim().toLowerCase();
  const filtered = q
    ? items.filter((s) => {
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
    return new Date(b.submittedAt) - new Date(a.submittedAt); // newest default
  });
  return sorted;
}

export function getSubmission(id) {
  return readAll().map(normalize).find((s) => s.id === id) || null;
}

export function createSubmission(payload) {
  const submittedAt = payload.submittedAt || new Date().toISOString();
  const record = normalize({ ...payload, submittedAt });
  writeAll([...readAll(), record]);
  return record;
}

export function listComments(submissionId) {
  const all = readAll().map(normalize);
  const target = all.find((s) => s.id === submissionId);
  return target?.comments || [];
}

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
