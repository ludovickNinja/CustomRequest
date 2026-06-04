import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import PageFooter from '../../shared/PageFooter.jsx';

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-stone-900 text-gold-100">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h1 className="mt-5 font-serif text-4xl text-stone-900">Admin</h1>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone-500">
          Admin tooling lives at this URL. The dashboard is coming soon.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-full border border-stone-300 px-5 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50"
        >
          Back to Customer View
        </Link>
      </main>
      <PageFooter />
    </div>
  );
}
