/**
 * Factory reference detail — what one resource does to a job dispatched to
 * it: read the specs, confirm it's working on it, upload its part, and mark
 * it uploaded. Scoped to the current factory; a factory can only open
 * references assigned to it.
 *
 * No pricing here (that's between the customer and the In House team) and no
 * customer discussion — the factory's job is specs, progress, and uploads.
 */
import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Check } from 'lucide-react';
import PageFooter from '../../shared/PageFooter.jsx';
import StatusBadge from '../../shared/StatusBadge.jsx';
import RenderingsSection from '../../shared/reference/RenderingsSection.jsx';
import { metalSummary } from '../../customer/components/design/MetalSection.jsx';
import { findCollection } from '../../data/collections.js';
import { getReference, updateReference, addRendering } from '../../services/submissionsStore.js';
import { useFactory } from '../../state/FactoryContext.jsx';

/** The next action a factory can take, given the reference's status. */
function factoryAction(status) {
  if (status === 'assigned') return { to: 'in-progress', label: 'Confirm & start work' };
  if (status === 'in-progress' || status === 'adjustment-needed') return { to: 'uploaded', label: 'Mark as uploaded' };
  return null;
}

function Row({ label, value }) {
  if (!value && value !== 0) return null;
  return (
    <div className="grid grid-cols-1 gap-1 py-2 sm:grid-cols-[150px_1fr] sm:gap-3">
      <dt className="text-xs font-medium uppercase tracking-wider text-stone-500">{label}</dt>
      <dd className="text-sm text-stone-800">{value}</dd>
    </div>
  );
}

export default function FactoryReferencePage() {
  const { referenceNo } = useParams();
  const decoded = referenceNo ? decodeURIComponent(referenceNo) : '';
  const { currentFactoryId } = useFactory();

  const [reference, setReference] = useState(() => (decoded ? getReference(decoded) : null));
  const collection = useMemo(() => findCollection(reference?.collection), [reference?.collection]);

  if (!decoded || !reference) return <Navigate to="/factory" replace />;
  // A factory can only open references assigned to it.
  if (reference.factoryId !== currentFactoryId) return <Navigate to="/factory" replace />;

  const design = reference.design;
  const cs = design.centerStone;
  const action = factoryAction(reference.status);

  function refresh() {
    setReference(getReference(decoded));
  }
  function advance(to) {
    updateReference(decoded, { status: to });
    refresh();
  }
  function handleUpload(e) {
    const file = e.target.files?.[0];
    if (file) {
      addRendering(decoded, { label: file.name, uploadedBy: reference.factoryId || 'Factory' });
      refresh();
    }
    e.target.value = '';
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-20">
        <Link to="/factory" className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-gold-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Workspace
        </Link>

        <div className="mt-4">
          <p className="eyebrow">Reference</p>
          <h1 className="mt-2 flex items-center gap-3 font-serif text-4xl text-stone-900">
            {reference.referenceNo}
            <StatusBadge status={reference.status} />
          </h1>
          <p className="mt-1 text-sm text-stone-500">
            Quote {reference.quoteNo} · Customer request {reference.poReference || reference.submissionId} ·{' '}
            {collection?.shortLabel || collection?.label || reference.collection}
            {reference.designCount > 1 ? ` · design ${reference.designIndex + 1} of ${reference.designCount}` : ''}
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <section className="card-panel p-6">
              <h2 className="font-serif text-xl text-stone-900">Specifications</h2>
              <p className="mt-0.5 text-xs text-stone-500">{metalSummary(design.metal)}</p>
              <dl className="mt-3 divide-y divide-stone-100">
                <Row label="SKU(s)" value={design.skus?.join(', ')} />
                <Row label="Metal" value={metalSummary(design.metal)} />
                <Row label="Finger Size" value={design.fingerSize ? `${design.fingerSize} (${design.fingerSizeSystem})` : ''} />
                {design.includeCenterStone && cs && (
                  <>
                    <Row
                      label="Center Stone"
                      value={[cs.type, cs.shape, cs.carat ? `${cs.carat} ${cs.caratUnit || 'ct'}` : null].filter(Boolean).join(' · ')}
                    />
                    <Row label="Provided By" value={cs.provideStone === 'yes' ? 'Crown Ring' : 'Customer'} />
                    <Row label="Stone Notes" value={cs.notes} />
                  </>
                )}
                <Row label="Design Notes" value={design.notes} />
              </dl>
            </section>

            <RenderingsSection design={design} />
          </div>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            <section className="card-panel space-y-5 p-5">
              <h2 className="font-serif text-lg text-stone-900">Your part</h2>

              <div>
                <label className="label-base">Status</label>
                <div className="mt-1"><StatusBadge status={reference.status} /></div>
                {action ? (
                  <button
                    type="button"
                    onClick={() => advance(action.to)}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-gold-100 hover:bg-neutral-800"
                  >
                    <Check className="h-3.5 w-3.5" />
                    {action.label}
                  </button>
                ) : (
                  <p className="mt-2 text-[11px] text-stone-400">
                    Nothing to do right now — this reference is with the In House team or the customer.
                  </p>
                )}
              </div>

              <div>
                <label className="label-base">Renderings &amp; finished work</label>
                <label className="mt-1 inline-flex cursor-pointer items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50">
                  <Upload className="h-3.5 w-3.5" />
                  Upload file
                  <input type="file" className="hidden" onChange={handleUpload} />
                </label>
                <p className="mt-1 text-[11px] text-stone-400">
                  Upload your part, then mark the reference as uploaded.
                </p>
              </div>
            </section>
          </aside>
        </div>
      </main>
      <PageFooter />
    </div>
  );
}
