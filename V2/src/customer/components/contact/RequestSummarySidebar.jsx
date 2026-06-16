import { Link } from 'react-router-dom';
import { Clock, MessageCircle, Gem } from 'lucide-react';
import { findCollection } from '../../../data/collections.js';

const STEPS = [
  { n: 1, label: "We'll review your request", sub: 'Our team will carefully review your information and requirements.' },
  { n: 2, label: "We'll be in touch", sub: 'Expect a response within 24–48 business hours.' },
  { n: 3, label: 'Design your perfect ring', sub: "We'll guide you through a personalized design experience." },
];

export default function RequestSummarySidebar({ collectionId }) {
  const collection = findCollection(collectionId);
  return (
    <aside className="space-y-4 lg:sticky lg:top-6">
      <div className="rounded-2xl bg-stone-100/60 p-6">
        <h2 className="text-center text-xs font-semibold tracking-[0.18em] text-stone-700 uppercase">
          Request Summary
        </h2>
        <div className="mt-5 text-center">
          <p className="eyebrow">Selected Collection</p>
          <div className="mt-3 overflow-hidden rounded-xl bg-white shadow-sm">
            <div className="relative aspect-collection w-full bg-stone-100">
              {collection?.image && (
                <img
                  src={collection.image}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              )}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-stone-300">
                <Gem className="h-12 w-12" strokeWidth={1} />
              </div>
            </div>
          </div>
          <p className="mt-4 font-serif text-xl text-stone-900">{collection?.shortLabel || 'No collection selected'}</p>
          <p className="mt-1 text-xs text-stone-500">{collection?.tagline}</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-full border border-stone-300 bg-white px-5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
          >
            Change Collection
          </Link>
        </div>
        <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 h-4 w-4 text-gold-700" />
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] text-gold-700 uppercase">Turnaround Time</p>
              <p className="mt-1 text-sm font-semibold text-stone-800">24–48 Business Hours</p>
              <p className="mt-1 text-xs text-stone-500">
                We'll let you know if we need additional time based on your request.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-2xl bg-stone-100/60 p-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-gold-700" />
          <p className="text-[10px] font-semibold tracking-[0.18em] text-gold-700 uppercase">What Happens Next?</p>
        </div>
        <ol className="mt-4 space-y-4">
          {STEPS.map((s) => (
            <li key={s.n} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-semibold text-gold-100">
                {s.n}
              </span>
              <div>
                <p className="text-sm font-semibold text-stone-800">{s.label}</p>
                <p className="text-xs text-stone-500">{s.sub}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  );
}
