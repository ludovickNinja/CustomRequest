/**
 * Per-reference discussion thread, shared by the customer and admin
 * design-detail pages — this is the comments section, now living inside
 * each design rather than once per request.
 *
 * The customer posts revision requests; the In House team replies. Both
 * write to the same reference message thread via `addReferenceMessage`,
 * tagged with the poster's role so each side is styled distinctly.
 */
import { useState } from 'react';
import { Send } from 'lucide-react';
import { addReferenceMessage } from '../../services/submissionsStore.js';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso || '';
  }
}

const COPY = {
  customer: {
    formLabel: 'Request a change',
    placeholder: 'Type your revision request here…',
    button: 'Send message',
    empty: 'No messages yet. Start the discussion to request changes.',
  },
  admin: {
    formLabel: 'Reply to the customer',
    placeholder: 'Type your reply…',
    button: 'Send reply',
    empty: 'No messages yet.',
  },
};

export default function DiscussionThread({ referenceNo, messages = [], role = 'customer', author, onPosted }) {
  const [draft, setDraft] = useState('');
  const copy = COPY[role] || COPY.customer;

  function handleSubmit(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    const posted = addReferenceMessage(referenceNo, { author: author || (role === 'admin' ? 'In House' : 'Customer'), role, body: draft });
    if (posted) {
      setDraft('');
      onPosted?.();
    }
  }

  return (
    <section className="card-panel p-6">
      <h2 className="font-serif text-xl text-stone-900">Discussion</h2>

      <div className="mt-4 space-y-3">
        {messages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
            {copy.empty}
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

      <form onSubmit={handleSubmit} className="mt-4 space-y-2">
        <label className="label-base">{copy.formLabel}</label>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder={copy.placeholder}
          className="input-base resize-none"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2 text-xs font-medium text-gold-100 hover:bg-neutral-800"
          >
            {copy.button}
            <Send className="h-3 w-3" />
          </button>
        </div>
      </form>
    </section>
  );
}
