/**
 * Staleness helpers — used to flag references that have been "falling
 * behind", i.e. haven't been touched in a while.
 *
 * A reference is stale when it's still in flight (not a terminal status)
 * and nothing has happened to it for at least STALE_AFTER_DAYS. Every
 * mutation in submissionsStore bumps the reference's `updatedAt`, so this
 * measures real inactivity, not just age.
 */
export const STALE_AFTER_DAYS = 5;

const TERMINAL = new Set(['approved', 'cancelled']);

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days between `iso` and now, or null if unparseable. */
export function daysSince(iso) {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.floor((Date.now() - t) / DAY_MS);
}

/** A reference is stale if it's in flight and untouched for a while. */
export function isStale(ref) {
  if (!ref || TERMINAL.has(ref.status)) return false;
  const d = daysSince(ref.updatedAt);
  return d != null && d >= STALE_AFTER_DAYS;
}

/** Short "updated" label, e.g. "today", "3 days ago", "2 weeks ago". */
export function relativeTime(iso) {
  const d = daysSince(iso);
  if (d == null) return '—';
  if (d <= 0) return 'today';
  if (d === 1) return '1 day ago';
  if (d < 7) return `${d} days ago`;
  const w = Math.floor(d / 7);
  return w === 1 ? '1 week ago' : `${w} weeks ago`;
}
