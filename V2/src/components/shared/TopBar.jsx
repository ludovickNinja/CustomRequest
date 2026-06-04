import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function TopBar({ backTo, backLabel }) {
  return (
    <div className="relative border-b border-stone-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
        {backTo ? (
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-gold-700"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>
        ) : (
          <span />
        )}
        <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 font-serif text-2xl text-gold-700">
          Custom Request
        </h1>
      </div>
    </div>
  );
}
