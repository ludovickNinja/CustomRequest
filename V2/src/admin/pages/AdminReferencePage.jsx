/**
 * Admin reference detail — everything the In House team does to one
 * reference (a single design within a customer request).
 *
 * The read sections (details, pricing breakdown, discussion, renderings)
 * are the same shared components the customer sees; the right-hand "Manage"
 * panel adds the admin-only controls: change status, assign a factory, set
 * and publish pricing, and upload renderings.
 *
 * All reads/writes go through `submissionsStore`; after each mutation we
 * re-fetch the reference so the panel reflects the persisted state.
 */
import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import PageFooter from '../../shared/PageFooter.jsx';
import StatusBadge from '../../shared/StatusBadge.jsx';
import PricingBreakdown from '../../shared/reference/PricingBreakdown.jsx';
import RenderingsSection from '../../shared/reference/RenderingsSection.jsx';
import DiscussionThread from '../../shared/reference/DiscussionThread.jsx';
import { metalSummary } from '../../customer/components/design/MetalSection.jsx';
import { findCollection } from '../../data/collections.js';
import { STATUSES } from '../../data/statuses.js';
import { factories } from '../../data/factories.js';
import { getReference, updateReference, addRendering } from '../../services/submissionsStore.js';

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-[150px_1fr] sm:gap-3">
      <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</dt>
      <dd className="text-sm text-stone-800">{value}</dd>
    </div>
  );
}

export default function AdminReferencePage() {
  const { referenceNo } = useParams();
  const decoded = referenceNo ? decodeURIComponent(referenceNo) : '';

  const [reference, setReference] = useState(() => (decoded ? getReference(decoded) : null));
  const [priceInput, setPriceInput] = useState(() => {
    const p = decoded ? getReference(decoded)?.price : null;
    return p === null || p === undefined ? '' : String(p);
  });

  const collection = useMemo(() => findCollection(reference?.collection), [reference?.collection]);

  if (!decoded || !reference) return <Navigate to="/admin" replace />;

  const design = reference.design;
  const cs = design.centerStone;

  function refresh() {
    setReference(getReference(decoded));
  }

  function handleStatus(e) {
    updateReference(decoded, { status: e.target.value });
    refresh();
  }
  function handleFactory(e) {
    updateReference(decoded, { factoryId: e.target.value || null });
    refresh();
  }
  function handlePublish() {
    const amount = priceInput.trim() === '' ? null : Number(priceInput);
    updateReference(decoded, {
      price: Number.isFinite(amount) ? amount : null,
      pricePublished: Number.isFinite(amount),
    });
    refresh();
  }
  function handleUnpublish() {
    updateReference(decoded, { pricePublished: false });
    refresh();
  }
  function handleUpload(e) {
    const file = e.target.files?.[0];
    if (file) {
      addRendering(decoded, { label: file.name, uploadedBy: reference.salesPerson || 'Admin' });
      refresh();
    }
    e.target.value = '';
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-20">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-gold-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Request Queue
        </Link>

        <div className="mt-4">
          <p className="eyebrow">Reference</p>
          <h1 className="mt-2 flex items-center gap-3 font-serif text-4xl text-stone-900">
            {reference.referenceNo}
            <StatusBadge status={reference.status} />
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Quote {reference.quoteNo} · Customer request{' '}
            <Link to={`/requests/${encodeURIComponent(reference.submissionId)}`} className="font-medium text-stone-700 hover:text-gold-700">
              {reference.poReference || reference.submissionId}
            </Link>{' '}
            · {collection?.shortLabel || collection?.label || reference.collection}
            {reference.designCount > 1 ? ` · design ${reference.designIndex + 1} of ${reference.designCount}` : ''}
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          {/* Left: the same read sections the customer sees */}
          <div className="space-y-4">
            <section className="card-panel p-6">
              <h2 className="font-serif text-xl text-stone-900">Reference Details</h2>
              <p className="mt-0.5 text-xs text-stone-500">{metalSummary(design.metal)}</p>
              <dl className="mt-3 divide-y divide-stone-100">
                <Row label="Account" value={reference.accountName} />
                <Row label="Contact" value={reference.contactName} />
                <Row label="Sales Person" value={reference.salesPerson} />
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

            <PricingBreakdown design={design} audience="admin" />

            <DiscussionThread
              referenceNo={reference.referenceNo}
              messages={design.messages}
              role="admin"
              author={reference.salesPerson || 'In House'}
              onPosted={refresh}
            />

            <RenderingsSection design={design} />
          </div>

          {/* Right: admin-only controls */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <section className="card-panel space-y-5 p-5">
              <h2 className="font-serif text-lg text-stone-900">Manage</h2>

              <div>
                <label className="label-base">Status</label>
                <select value={reference.status} onChange={handleStatus} className="input-base mt-1 appearance-none">
                  {STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-base">Factory</label>
                <select value={reference.factoryId || ''} onChange={handleFactory} className="input-base mt-1 appearance-none">
                  <option value="">Unassigned</option>
                  {factories.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} {f.type === 'in-house' ? '· In House' : '· External'}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-[11px] text-stone-400">Distribute to a local or external team.</p>
              </div>

              <div>
                <label className="label-base">Price ({reference.currency})</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="25"
                    value={priceInput}
                    onChange={(e) => setPriceInput(e.target.value)}
                    placeholder="0"
                    className="input-base"
                  />
                  {reference.pricePublished ? (
                    <button type="button" onClick={handleUnpublish} className="shrink-0 text-xs font-medium text-stone-500 hover:text-stone-700">
                      Unpublish
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePublish}
                      className="shrink-0 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-gold-100 hover:bg-neutral-800"
                    >
                      Publish
                    </button>
                  )}
                </div>
                <p className="mt-1 text-[11px] text-stone-400">
                  {reference.pricePublished ? 'Published — visible to the customer.' : 'Publish to make it visible to the customer.'}
                </p>
              </div>

              <div>
                <label className="label-base">Renderings</label>
                <label className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50">
                  <Upload className="h-3.5 w-3.5" />
                  Upload rendering
                  <input type="file" className="hidden" onChange={handleUpload} />
                </label>
              </div>
            </section>
          </aside>
        </div>
      </main>
      <PageFooter />
    </div>
  );
}
