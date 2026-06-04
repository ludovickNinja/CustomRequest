import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function CollectionCard({ collection, onChoose }) {
  return (
    <Link
      to={`/design/${collection.id}`}
      onClick={() => onChoose?.(collection.id)}
      className="card-panel group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gold-500/40"
    >
      <div className="relative aspect-[310/380] w-full overflow-hidden bg-stone-100">
        <img
          src={collection.image}
          alt=""
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
      <div className="flex flex-1 flex-col p-6 text-center">
        <h3 className="font-serif text-2xl text-stone-900">{collection.shortLabel}</h3>
        <p className="mt-2 text-sm font-medium text-gold-700">{collection.tagline}</p>
        <p className="mt-2 text-sm text-stone-500">{collection.subline}</p>
        <span className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full bg-stone-100 px-5 py-2 text-sm font-medium text-stone-800 transition group-hover:bg-stone-200">
          Choose Collection
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
