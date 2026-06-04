import { Link } from 'react-router-dom';
import { History } from 'lucide-react';

export default function PageHeader() {
  return (
    <header className="mx-auto max-w-3xl px-6 pt-16 pb-12 text-center">
      <p className="eyebrow">Create Your Perfect Ring</p>
      <h1 className="mt-4 font-serif text-5xl tracking-tight text-stone-900 md:text-6xl">
        Custom Request
      </h1>
      <p className="mt-4 text-base text-stone-600 md:text-lg">
        Choose a collection to start your custom ring design.
      </p>
      <p className="mt-3 text-sm">
        <Link
          to="/requests"
          className="inline-flex items-center gap-1.5 text-gold-700 underline-offset-4 hover:underline"
        >
          <History className="h-4 w-4" />
          View Ongoing Requests
        </Link>
      </p>
    </header>
  );
}
