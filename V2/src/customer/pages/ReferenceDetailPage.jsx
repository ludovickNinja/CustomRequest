/**
 * Customer-facing detail for one reference (a single design within a
 * request). This is where the customer sees the pricing breakdown and the
 * factory renderings, and holds the discussion thread for that design.
 *
 * Scoped to the current store: a store can only open its own references.
 * Pricing/renderings are read-only here (filled in by admin/factory); the
 * customer's only write is posting to the discussion.
 */
import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { Check, X } from 'lucide-react';
import TopBar from '../../shared/TopBar.jsx';
import PageFooter from '../../shared/PageFooter.jsx';
import StatusBadge from '../../shared/StatusBadge.jsx';
import PricingBreakdown from '../../shared/reference/PricingBreakdown.jsx';
import RenderingsSection from '../../shared/reference/RenderingsSection.jsx';
import DiscussionThread from '../../shared/reference/DiscussionThread.jsx';
import { metalSummary } from '../components/design/MetalSection.jsx';
import { findCollection } from '../../data/collections.js';
import { useStore } from '../../state/StoreContext.jsx';
import { getReference, updateReference } from '../../services/submissionsStore.js';

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-[150px_1fr] sm:gap-3">
      <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</dt>
      <dd className="text-sm text-stone-800">{value}</dd>
    </div>
  );
}

export default function ReferenceDetailPage() {
  const { referenceNo } = useParams();
  const decoded = referenceNo ? decodeURIComponent(referenceNo) : '';
  const { currentAccountId } = useStore();

  const [reference, setReference] = useState(() => (decoded ? getReference(decoded) : null));
  const collection = useMemo(() => findCollection(reference?.collection), [reference?.collection]);

  if (!decoded || !reference) return <Navigate to="/requests" replace />;
  // A store can only view its own references.
  if (reference.accountId && reference.accountId !== currentAccountId) {
    return <Navigate to="/requests" replace />;
  }

  const design = reference.design;
  const cs = design.centerStone;

  function refresh() {
    setReference(getReference(decoded));
  }
  function decide(to) {
    updateReference(decoded, { status: to });
    refresh();
  }

  const status = reference.status;
  const terminal = status === 'approved' || status === 'cancelled';

  return (
    <div className="min-h-screen bg-stone-50">
      <TopBar backTo={`/requests/${encodeURIComponent(reference.submissionId)}`} backLabel="Back to Request" />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <header>
          <p className="eyebrow">Reference {reference.referenceNo}</p>
          <h1 className="mt-2 flex flex-wrap items-center gap-3 font-serif text-4xl text-stone-900">
            {reference.designCount > 1 ? `Design ${reference.designIndex + 1} of ${reference.designCount}` : 'Your Design'}
            <StatusBadge status={reference.status} />
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            {reference.poReference ? `${reference.poReference} · ` : ''}
            {collection?.shortLabel || collection?.label || reference.collection}
          </p>
        </header>

        <div className="mt-6 space-y-4">
          <section className="card-panel p-6">
            <h2 className="font-serif text-xl text-stone-900">Design</h2>
            <p className="mt-0.5 text-xs text-stone-500">{metalSummary(design.metal)}</p>
            <dl className="mt-3 divide-y divide-stone-100">
              <Row label="SKU(s)" value={design.skus?.join(', ')} />
              <Row label="Metal" value={metalSummary(design.metal)} />
              <Row label="Finger Size" value={design.fingerSize ? `${design.fingerSize} (${design.fingerSizeSystem})` : ''} />
              {design.includeCenterStone && cs && (
                <Row
                  label="Center Stone"
                  value={[cs.type, cs.shape, cs.carat ? `${cs.carat} ${cs.caratUnit || 'ct'}` : null].filter(Boolean).join(' · ')}
                />
              )}
              <Row label="Notes" value={design.notes} />
            </dl>
          </section>

          <PricingBreakdown design={design} audience="customer" />

          {terminal ? (
            <section
              className={
                'card-panel p-6 ' + (status === 'approved' ? 'border-emerald-200' : 'border-stone-200')
              }
            >
              <h2 className="font-serif text-xl text-stone-900">
                {status === 'approved' ? 'Approved' : 'Cancelled'}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {status === 'approved'
                  ? 'You approved this reference. Our team will take it from here.'
                  : 'This reference was cancelled. Reach out if you’d like to revisit it.'}
              </p>
            </section>
          ) : status === 'sent' ? (
            <section className="card-panel p-6">
              <h2 className="font-serif text-xl text-stone-900">Your decision</h2>
              <p className="mt-1 text-sm text-stone-500">
                Review the quote above, then approve to proceed or cancel this reference. Need changes? Leave a note in
                the discussion below.
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => decide('approved')}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  <Check className="h-4 w-4" />
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => decide('cancelled')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 px-6 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            </section>
          ) : (
            <section className="card-panel p-6">
              <h2 className="font-serif text-xl text-stone-900">Your decision</h2>
              <p className="mt-1 text-sm text-stone-500">
                We’ll send your quote here once it’s ready — you’ll be able to approve it then. You can cancel this
                reference at any time.
              </p>
              <button
                type="button"
                onClick={() => decide('cancelled')}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-stone-300 px-6 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                <X className="h-4 w-4" />
                Cancel request
              </button>
            </section>
          )}

          <DiscussionThread
            referenceNo={reference.referenceNo}
            messages={design.messages}
            role="customer"
            author={reference.contactName || 'Customer'}
            onPosted={refresh}
          />

          <RenderingsSection design={design} />
        </div>
      </main>
      <PageFooter />
    </div>
  );
}
