/**
 * Activity timeline for one reference — the running log of everything that
 * has happened to it (status moves, dispatch, pricing, renderings,
 * messages). Used on the admin and factory reference pages so the team can
 * see at a glance when a reference last moved and what's holding it up.
 */
import { statusLabel } from '../../data/statuses.js';
import { relativeTime } from '../staleness.js';

function describe(e) {
  switch (e.type) {
    case 'created':
      return 'Request received';
    case 'status':
      return `Moved to ${statusLabel(e.to)}`;
    case 'factory':
      return e.to ? 'Dispatched to a factory' : 'Factory unassigned';
    case 'price':
      return 'Pricing updated';
    case 'rendering':
      return e.label ? `Rendering uploaded — ${e.label}` : 'Rendering uploaded';
    case 'message':
      return e.role === 'customer' ? 'Customer message' : 'Reply posted';
    default:
      return 'Updated';
  }
}

export default function ActivityTimeline({ activity = [] }) {
  if (!activity.length) return null;
  const items = [...activity].reverse(); // most recent first
  return (
    <section className="card-panel p-6">
      <h2 className="font-serif text-xl text-stone-900">Activity</h2>
      <ol className="mt-3 space-y-3">
        {items.map((e, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gold-400" />
            <div>
              <p className="text-sm text-stone-800">{describe(e)}</p>
              <p className="text-xs text-stone-400">{relativeTime(e.at)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
