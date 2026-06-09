/**
 * Reference workflow statuses.
 *
 * This POC is a centralized intake for custom-ring *quote requests* — not
 * ring production. A reference (one design within a request) moves through:
 *
 *   Pending           — request came in, awaiting admin dispatch
 *   Assigned          — admin dispatched it to an in-house / external resource
 *   In Progress       — the resource confirmed it's working on it
 *   Uploaded          — the resource filled in its part (pricing, renderings)
 *   In Review         — admin is reviewing the uploaded work
 *   Sent              — admin sent the quote to the customer
 *   Adjustment Needed — sent back for changes (to the resource)
 *   Approved          — customer approved the reference
 *   Cancelled         — customer cancelled the reference
 *
 * `order` drives sorting; `tone` maps to a badge color in the UI.
 * `needsAttention` flags the statuses waiting on the In House (admin) team.
 */
export const STATUSES = [
  { id: 'pending', label: 'Pending', order: 0, needsAttention: true, tone: 'amber' },
  { id: 'assigned', label: 'Assigned', order: 1, needsAttention: false, tone: 'sky' },
  { id: 'in-progress', label: 'In Progress', order: 2, needsAttention: false, tone: 'blue' },
  { id: 'uploaded', label: 'Uploaded', order: 3, needsAttention: true, tone: 'violet' },
  { id: 'in-review', label: 'In Review', order: 4, needsAttention: true, tone: 'indigo' },
  { id: 'sent', label: 'Sent', order: 5, needsAttention: false, tone: 'teal' },
  { id: 'adjustment-needed', label: 'Adjustment Needed', order: 6, needsAttention: false, tone: 'rose' },
  { id: 'approved', label: 'Approved', order: 7, needsAttention: false, tone: 'emerald' },
  { id: 'cancelled', label: 'Cancelled', order: 8, needsAttention: false, tone: 'stone' },
];

const BY_ID = Object.fromEntries(STATUSES.map((s) => [s.id, s]));

export function findStatus(id) {
  return BY_ID[id] || STATUSES[0];
}

export function statusLabel(id) {
  return findStatus(id).label;
}

export function needsAttention(id) {
  return !!findStatus(id).needsAttention;
}
