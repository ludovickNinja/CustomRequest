/**
 * Overview for a single submitted request. Lists the request's contact
 * info and one card per design; each design card links to that design's
 * detail page (pricing, renderings, and its own discussion thread).
 *
 * Comments used to live here as a single per-request thread — they now
 * live inside each design's detail page instead.
 *
 * Scoped to the current store: a store can only open its own requests.
 */
import { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import TopBar from '../../shared/TopBar.jsx';
import PageFooter from '../../shared/PageFooter.jsx';
import { findCollection } from '../../data/collections.js';
import { getSubmission } from '../../services/submissionsStore.js';
import { metalSummary } from '../components/design/MetalSection.jsx';
import { useStore } from '../../state/StoreContext.jsx';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso || '';
  }
}

function formatMoney(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `$${amount}`;
  }
}

function DesignCard({ design, index }) {
  const cs = design.centerStone;
  const priced = design.pricePublished && design.price != null;
  return (
    <Link
      to={`/requests/reference/${encodeURIComponent(design.referenceNo)}`}
      className="card-panel group flex items-center gap-4 p-6 transition hover:border-stone-400"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-serif text-xl text-stone-900">Design {index + 1}</h3>
          <span className="text-xs text-stone-400">{design.referenceNo}</span>
          <span
            className={
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
              (priced ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800')
            }
          >
            {priced ? `Quoted · ${formatMoney(design.price, design.currency)}` : 'Quote in progress'}
          </span>
        </div>
        <p className="mt-1 text-sm text-stone-600">{metalSummary(design.metal)}</p>
        <p className="mt-0.5 text-xs text-stone-400">
          {[design.skus?.join(', '), design.fingerSize ? `Size ${design.fingerSize} (${design.fingerSizeSystem})` : null,
            design.includeCenterStone && cs?.carat ? `${cs.type} ${cs.carat}${cs.caratUnit || 'ct'}` : null]
            .filter(Boolean)
            .join(' · ')}
        </p>
        <p className="mt-2 text-xs font-medium text-gold-700">View pricing, renderings &amp; discussion →</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-stone-300 transition group-hover:text-gold-700" />
    </Link>
  );
}

export default function RequestDetailPage() {
  const { id } = useParams();
  const { currentAccountId } = useStore();
  const decodedId = id ? decodeURIComponent(id) : '';
  const submission = useMemo(() => (decodedId ? getSubmission(decodedId) : null), [decodedId]);

  if (!submission) return <Navigate to="/requests" replace />;
  if (submission.accountId && submission.accountId !== currentAccountId) {
    return <Navigate to="/requests" replace />;
  }

  const collection = findCollection(submission.collection);
  const contact = submission.contact || {};
  const designs = submission.designs || [];

  return (
    <div className="min-h-screen bg-stone-50">
      <TopBar backTo="/requests" backLabel="Back to Requests" />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="eyebrow">Request</p>
        <h1 className="mt-2 font-serif text-4xl text-stone-900">
          {contact.poReference || contact.accountName || 'Custom Request'}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500">
          <Clock className="h-3.5 w-3.5 text-stone-400" />
          Submitted {formatDate(submission.submittedAt)} · {designs.length} design{designs.length === 1 ? '' : 's'} ·{' '}
          {collection?.shortLabel || collection?.label || submission.collection}
        </p>

        <section className="card-panel mt-6 p-6">
          <h2 className="font-serif text-xl text-stone-900">Contact Information</h2>
          <dl className="mt-3 divide-y divide-stone-100">
            <Row label="PO / Reference" value={contact.poReference} />
            <Row label="Account" value={contact.accountName} />
            <Row label="Contact Name" value={contact.contactName} />
            <Row label="Email" value={contact.email} />
            <Row label="Phone" value={contact.phone ? `${contact.phoneCountry || ''} ${contact.phone}`.trim() : ''} />
          </dl>
        </section>

        <h2 className="mt-8 font-serif text-2xl text-stone-900">
          {designs.length === 1 ? 'Design' : `${designs.length} Designs`}
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Open a design for its pricing breakdown, factory renderings, and discussion.
        </p>
        <div className="mt-4 space-y-3">
          {designs.map((d, i) => (
            <DesignCard key={d.referenceNo || i} design={d} index={i} />
          ))}
        </div>
      </main>
      <PageFooter />
    </div>
  );
}

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-[160px_1fr] sm:gap-3">
      <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</dt>
      <dd className="text-sm text-stone-800">{value}</dd>
    </div>
  );
}
