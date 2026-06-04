import { Link } from 'react-router-dom';
import { ArrowRight, Pencil } from 'lucide-react';
import { fullCustom } from '../../data/collections.js';

export default function FullCustomBanner({ onChoose }) {
  return (
    <Link
      to={`/design/${fullCustom.id}`}
      onClick={() => onChoose?.(fullCustom.id)}
      className="card-panel mx-auto mt-10 flex max-w-6xl flex-col items-center gap-6 p-8 transition hover:shadow-md md:flex-row md:justify-between md:p-10"
    >
      <div className="flex items-center gap-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-50 text-gold-700">
          <Pencil className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <div>
          <h3 className="font-serif text-2xl text-stone-900">{fullCustom.label}</h3>
          <p className="mt-1 text-sm text-stone-600">{fullCustom.subline}</p>
        </div>
      </div>
      <span className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-6 py-3 text-sm font-medium text-gold-100 transition hover:bg-neutral-800">
        Start Full Custom Request
        <ArrowRight className="h-4 w-4" />
      </span>
    </Link>
  );
}
