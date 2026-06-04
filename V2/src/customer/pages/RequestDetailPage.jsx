import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { MessageSquare, Clock, FileText, Hourglass, Send } from 'lucide-react';
import TopBar from '../../shared/TopBar.jsx';
import PageFooter from '../../shared/PageFooter.jsx';
import { findCollection } from '../../data/collections.js';
import {
  getSubmission,
  listComments,
  addComment,
} from '../../services/submissionsStore.js';
import { metalSummary } from '../components/design/MetalSection.jsx';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso || '';
  }
}

function StatusBadge({ submittedAt }) {
  const ageDays = (() => {
    try {
      return (Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24);
    } catch {
      return 0;
    }
  })();
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
      <Hourglass className="h-3 w-3" />
      Quote in progress · day {Math.max(1, Math.ceil(ageDays))}
    </span>
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

function DesignSummary({ design, index }) {
  const cs = design.centerStone;
  const centerStoneIncluded = design.includeCenterStone;
  return (
    <section className="card-panel p-6">
      <header>
        <h3 className="font-serif text-xl text-stone-900">Design {index + 1}</h3>
        <p className="mt-0.5 text-xs text-stone-500">{metalSummary(design.metal)}</p>
      </header>
      <dl className="mt-3 divide-y divide-stone-100">
        <Row label="SKU(s)" value={design.skus?.join(', ')} />
        <Row label="Metal" value={metalSummary(design.metal)} />
        <Row label="Finger Size" value={design.fingerSize ? `${design.fingerSize} (${design.fingerSizeSystem})` : ''} />
        {centerStoneIncluded && cs && (
          <>
            <Row
              label="Center Stone"
              value={[cs.type, cs.shape, cs.carat ? `${cs.carat} ${cs.caratUnit || 'ct'}` : null]
                .filter(Boolean)
                .join(' · ')}
            />
            <Row label="Color / Clarity" value={[cs.color, cs.clarity].filter(Boolean).join(' / ')} />
          </>
        )}
        <Row label="Notes" value={design.notes} />
      </dl>
    </section>
  );
}

export default function RequestDetailPage() {
  const { id } = useParams();
  const decodedId = id ? decodeURIComponent(id) : '';
  const submission = useMemo(() => (decodedId ? getSubmission(decodedId) : null), [decodedId]);
  const [comments, setComments] = useState(() => (decodedId ? listComments(decodedId) : []));
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  // Re-read comments whenever the submission id changes.
  useEffect(() => {
    setComments(decodedId ? listComments(decodedId) : []);
  }, [decodedId]);

  if (!submission) return <Navigate to="/requests" replace />;

  const collection = findCollection(submission.collection);
  const contact = submission.contact || {};
  const designs = submission.designs || [];

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) {
      setError('Please enter a comment before posting.');
      return;
    }
    const next = addComment(decodedId, { author: contact.contactName || 'Customer', body: trimmed });
    if (next) {
      setComments((prev) => [...prev, next]);
      setDraft('');
      setError('');
    }
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <TopBar backTo="/requests" backLabel="Back to Requests" />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow">Request</p>
            <h1 className="mt-2 font-serif text-4xl text-stone-900">
              {contact.poReference || contact.accountName || 'Custom Request'}
            </h1>
            <p className="mt-1 text-sm text-stone-500">
              Submitted {formatDate(submission.submittedAt)} · {designs.length} design
              {designs.length === 1 ? '' : 's'} · {collection?.shortLabel || collection?.label || submission.collection}
            </p>
          </div>
          <StatusBadge submittedAt={submission.submittedAt} />
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <section className="card-panel p-6">
              <h2 className="font-serif text-xl text-stone-900">Contact Information</h2>
              <dl className="mt-3 divide-y divide-stone-100">
                <Row label="PO / Reference" value={contact.poReference} />
                <Row label="Account" value={contact.accountName} />
                <Row label="Contact Name" value={contact.contactName} />
                <Row label="Email" value={contact.email} />
                <Row
                  label="Phone"
                  value={contact.phone ? `${contact.phoneCountry || ''} ${contact.phone}`.trim() : ''}
                />
              </dl>
            </section>

            {designs.map((d, i) => (
              <DesignSummary key={i} design={d} index={i} />
            ))}

            <section className="card-panel p-6">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-gold-700" />
                <h2 className="font-serif text-xl text-stone-900">Comments</h2>
              </div>
              <p className="mt-1 text-xs text-stone-500">
                Use this thread to ask questions, share clarifications, or request changes. Our team will reply here.
              </p>

              <div className="mt-4 space-y-3">
                {comments.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
                    No comments yet. Start the conversation below.
                  </p>
                ) : (
                  comments.map((c) => (
                    <div key={c.id} className="rounded-xl border border-stone-200 bg-white px-4 py-3">
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span className="font-medium text-stone-700">{c.author}</span>
                        <span>{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-stone-800">{c.body}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-2">
                <label htmlFor="commentDraft" className="label-base">
                  Add a comment for review
                </label>
                <textarea
                  id="commentDraft"
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value);
                    if (error) setError('');
                  }}
                  rows={3}
                  maxLength={1000}
                  placeholder="Type your question or update…"
                  className={'input-base resize-none ' + (error ? 'input-error' : '')}
                />
                {error && <p className="text-xs text-red-600">{error}</p>}
                <div className="flex items-center justify-between">
                  <p className="text-[11px] text-stone-400">{draft.length}/1000</p>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-xs font-medium text-gold-100 hover:bg-neutral-800"
                  >
                    Post Comment
                    <Send className="h-3 w-3" />
                  </button>
                </div>
              </form>
            </section>
          </div>

          <aside className="space-y-4 lg:sticky lg:top-6">
            <section className="card-panel p-6">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gold-700" />
                <h2 className="font-serif text-xl text-stone-900">Quote</h2>
              </div>
              <p className="mt-3 text-sm text-stone-600">
                Our team is preparing your quote based on the submitted designs.
              </p>
              <div className="mt-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center">
                <p className="text-sm font-medium text-stone-700">Pending review</p>
                <p className="mt-1 text-xs text-stone-500">
                  We'll post the priced quote here once it's ready — typically within 24–48 business hours.
                </p>
              </div>
              <div className="mt-4 flex items-start gap-2 text-xs text-stone-500">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-stone-400" />
                <p>Submitted {formatDate(submission.submittedAt)}</p>
              </div>
            </section>

            <Link
              to="/"
              className="block rounded-2xl border border-stone-200 bg-white px-4 py-3 text-center text-sm font-medium text-stone-700 transition hover:border-stone-400"
            >
              Start a New Request
            </Link>
          </aside>
        </div>
      </main>
      <PageFooter />
    </div>
  );
}
