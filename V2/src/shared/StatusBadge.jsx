/**
 * Small pill that shows a reference's workflow status in its tone color.
 * Tone → class strings are spelled out in full so Tailwind's scanner keeps
 * them in the build (no dynamic class construction).
 */
import { findStatus } from '../data/statuses.js';

const TONE = {
  amber: 'bg-amber-50 text-amber-800 ring-amber-200',
  sky: 'bg-sky-50 text-sky-700 ring-sky-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  teal: 'bg-teal-50 text-teal-700 ring-teal-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  stone: 'bg-stone-100 text-stone-600 ring-stone-200',
};

export default function StatusBadge({ status }) {
  const s = findStatus(status);
  return (
    <span
      className={
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ' +
        (TONE[s.tone] || TONE.amber)
      }
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  );
}
