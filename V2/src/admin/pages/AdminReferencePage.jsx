/**
 * Admin reference detail — everything the In House team does to one
 * reference (a single design within a customer request):
 *
 *   - update its workflow status
 *   - assign it to a factory (distribute to a local or external team)
 *   - upload renderings / assets
 *   - answer the customer's messages
 *   - set and publish pricing
 *
 * All reads/writes go through `submissionsStore`. After each mutation we
 * re-fetch the reference so the panel reflects the persisted state.
 */
import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Send, FileImage, DollarSign, Factory as FactoryIcon, Tag } from 'lucide-react';
import PageFooter from '../../shared/PageFooter.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { metalSummary } from '../../customer/components/design/MetalSection.jsx';
import { findCollection } from '../../data/collections.js';
import { STATUSES } from '../../data/statuses.js';
import { factories } from '../../data/factories.js';
import {
  getReference,
  updateReference,
  addReferenceAsset,
  addReferenceMessage,
} from '../../services/submissionsStore.js';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso || '';
  }
}

function formatMoney(amount, currency = 'USD') {
  if (amount === null || amount === undefined || amount === '') return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `$${amount}`;
  }
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

export default function AdminReferencePage() {
  const { referenceNo } = useParams();
  const decoded = referenceNo ? decodeURIComponent(referenceNo) : '';

  const [reference, setReference] = useState(() => (decoded ? getReference(decoded) : null));
  const [draft, setDraft] = useState('');
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
      addReferenceAsset(decoded, { name: file.name, uploadedBy: reference.salesPerson || 'Admin' });
      refresh();
    }
    e.target.value = '';
  }
  function handleReply(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    addReferenceMessage(decoded, {
      author: reference.salesPerson || 'Admin',
      role: 'admin',
      body: draft,
    });
    setDraft('');
    refresh();
  }

  const messages = design.messages || [];
  const assets = design.assets || [];

  return (
    <div className="min-h-screen bg-stone-50">
      <main className="mx-auto max-w-5xl px-6 pb-16 pt-20">
        <Link to="/admin" className="inline-flex items-center gap-2 text-sm font-medium text-stone-700 hover:text-gold-700">
          <ArrowLeft className="h-4 w-4" />
          Back to Request Queue
        </Link>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
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
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_340px]">
          {/* Left: reference details + messages */}
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
                  <>
                    <Row
                      label="Center Stone"
                      value={[cs.type, cs.shape, cs.carat ? `${cs.carat} ${cs.caratUnit || 'ct'}` : null].filter(Boolean).join(' · ')}
                    />
                    <Row label="Provided By" value={cs.provideStone === 'yes' ? 'Crown Ring' : 'Customer'} />
                  </>
                )}
                <Row label="Notes" value={design.notes} />
              </dl>
            </section>

            <section className="card-panel p-6">
              <h2 className="font-serif text-xl text-stone-900">Messages</h2>
              <p className="mt-1 text-xs text-stone-500">Answer the customer's questions on this reference.</p>
              <div className="mt-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
                    No messages yet.
                  </p>
                ) : (
                  messages.map((m) => (
                    <div
                      key={m.id}
                      className={
                        'rounded-xl border px-4 py-3 ' +
                        (m.role === 'admin' ? 'border-gold-200 bg-gold-50/60' : 'border-stone-200 bg-white')
                      }
                    >
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span className="font-medium text-stone-700">
                          {m.author}
                          <span className="ml-1.5 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-stone-500">
                            {m.role === 'admin' ? 'In House' : 'Customer'}
                          </span>
                        </span>
                        <span>{formatDate(m.createdAt)}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-stone-800">{m.body}</p>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={handleReply} className="mt-4 space-y-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Reply to the customer…"
                  className="input-base resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-xs font-medium text-gold-100 hover:bg-neutral-800"
                  >
                    Send Reply
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </form>
            </section>
          </div>

          {/* Right: workflow controls */}
          <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <section className="card-panel p-5">
              <h2 className="flex items-center gap-2 font-serif text-lg text-stone-900">
                <Tag className="h-4 w-4 text-gold-700" />
                Status
              </h2>
              <select value={reference.status} onChange={handleStatus} className="input-base mt-3 appearance-none">
                {STATUSES.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </section>

            <section className="card-panel p-5">
              <h2 className="flex items-center gap-2 font-serif text-lg text-stone-900">
                <FactoryIcon className="h-4 w-4 text-gold-700" />
                Factory
              </h2>
              <p className="mt-1 text-xs text-stone-500">Distribute this reference to a local or external team.</p>
              <select value={reference.factoryId || ''} onChange={handleFactory} className="input-base mt-3 appearance-none">
                <option value="">Unassigned</option>
                {factories.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} {f.type === 'in-house' ? '· In House' : '· External'}
                  </option>
                ))}
              </select>
            </section>

            <section className="card-panel p-5">
              <h2 className="flex items-center gap-2 font-serif text-lg text-stone-900">
                <DollarSign className="h-4 w-4 text-gold-700" />
                Pricing
              </h2>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-stone-500">{reference.currency}</span>
                <input
                  type="number"
                  min="0"
                  step="25"
                  value={priceInput}
                  onChange={(e) => setPriceInput(e.target.value)}
                  placeholder="0"
                  className="input-base"
                />
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                    (reference.pricePublished ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500')
                  }
                >
                  {reference.pricePublished ? `Published · ${formatMoney(reference.price, reference.currency)}` : 'Not published'}
                </span>
                {reference.pricePublished ? (
                  <button type="button" onClick={handleUnpublish} className="text-xs font-medium text-stone-500 hover:text-stone-700">
                    Unpublish
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePublish}
                    className="rounded-full bg-neutral-900 px-4 py-1.5 text-xs font-medium text-gold-100 hover:bg-neutral-800"
                  >
                    Publish
                  </button>
                )}
              </div>
              <p className="mt-2 text-[11px] text-stone-400">Published pricing is what the customer sees on their quote.</p>
            </section>

            <section className="card-panel p-5">
              <h2 className="flex items-center gap-2 font-serif text-lg text-stone-900">
                <FileImage className="h-4 w-4 text-gold-700" />
                Renderings
              </h2>
              <div className="mt-3 space-y-2">
                {assets.length === 0 ? (
                  <p className="text-xs text-stone-500">No renderings uploaded yet.</p>
                ) : (
                  assets.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 rounded-lg border border-stone-200 bg-white px-3 py-2">
                      <FileImage className="h-4 w-4 shrink-0 text-stone-400" />
                      <span className="flex-1 truncate text-xs text-stone-700">{a.name}</span>
                      <span className="text-[10px] text-stone-400">{formatDate(a.uploadedAt)}</span>
                    </div>
                  ))
                )}
              </div>
              <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-stone-50">
                <Upload className="h-3.5 w-3.5" />
                Upload rendering
                <input type="file" className="hidden" onChange={handleUpload} />
              </label>
            </section>
          </aside>
        </div>
      </main>
      <PageFooter />
    </div>
  );
}
