/**
 * Reference workflow statuses.
 *
 * Every reference (one design within a customer request) moves through this
 * pipeline. The admin Request Queue filters and badges by status, and the
 * "needing attention" count is the number of references sitting in a status
 * that's waiting on internal action (not the customer or the factory).
 *
 * `order` drives sorting; `tone` maps to a badge color in the UI.
 */
export const STATUSES = [
  { id: 'new', label: 'New', order: 0, needsAttention: true, tone: 'amber' },
  { id: 'in-review', label: 'In Review', order: 1, needsAttention: true, tone: 'amber' },
  { id: 'quoted', label: 'Quoted', order: 2, needsAttention: false, tone: 'blue' },
  { id: 'in-cad', label: 'In CAD', order: 3, needsAttention: true, tone: 'violet' },
  { id: 'in-production', label: 'In Production', order: 4, needsAttention: false, tone: 'indigo' },
  { id: 'shipped', label: 'Shipped', order: 5, needsAttention: false, tone: 'green' },
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
