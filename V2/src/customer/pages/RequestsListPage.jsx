/**
 * "View Ongoing Requests" — list of every submission for this customer.
 *
 * Data comes from `submissionsStore.listSubmissions`, which today reads
 * localStorage. A search input and a sort dropdown drive the same
 * helper. Two empty states: first-time visitor (no submissions yet)
 * vs. no-match for the current search query.
 *
 * Each row links to `/requests/:id` for the detail view.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft, FileText } from 'lucide-react';
import PageFooter from '../../shared/PageFooter.jsx';
import TopBar from '../../shared/TopBar.jsx';
import { listSubmissions } from '../../services/submissionsStore.js';
import { findCollection } from '../../data/collections.js';
import { useStore } from '../../state/StoreContext.jsx';

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'po', label: 'PO / Reference (A→Z)' },
  { id: 'account', label: 'Account (A→Z)' },
];

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso || '';
  }
}

function collectionLabel(id) {
  const c = findCollection(id);
  return c?.shortLabel || c?.label || id || '—';
}

export default function RequestsListPage() {
  const { currentAccountId, currentAccount } = useStore();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const submissions = useMemo(
    () => listSubmissions({ search, sort, accountId: currentAccountId }),
    [search, sort, currentAccountId]
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <TopBar backTo="/" backLabel="Back to Collection Picker" />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Your Activity</p>
            <h1 className="mt-2 font-serif text-4xl text-stone-900">Ongoing Requests</h1>
            <p className="mt-1 text-sm text-stone-500">
              {currentAccount && (
                <>
                  Projects for <span className="font-medium text-stone-700">{currentAccount.name}</span>.{' '}
                </>
              )}
              Review submissions, check quotes, and leave comments for our team.
            </p>
          </div>
          <Link
            to="/"
            className="mt-4 inline-flex items-center gap-2 self-start rounded-full bg-neutral-900 px-5 py-2.5 text-xs font-medium text-gold-100 hover:bg-neutral-800 sm:self-end"
          >
            Start a New Request
          </Link>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by PO#, reference, account, contact, or email"
              className="input-base pl-9"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-base appearance-none sm:w-56"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.id} value={o.id}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="mt-6">
          {submissions.length === 0 ? (
            <div className="card-panel flex flex-col items-center px-6 py-16 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                <FileText className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-serif text-2xl text-stone-900">
                {search ? 'No matching requests' : 'No requests yet'}
              </h3>
              <p className="mt-2 max-w-sm text-sm text-stone-500">
                {search
                  ? 'Try a different search term, or clear the search to see all of your submissions.'
                  : 'Once you submit a request from the collection picker, it will appear here.'}
              </p>
              <Link
                to="/"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-900 px-5 py-2.5 text-xs font-medium text-gold-100 hover:bg-neutral-800"
              >
                <ArrowLeft className="h-3 w-3" />
                Back to Collection Picker
              </Link>
            </div>
          ) : (
            <div className="card-panel divide-y divide-stone-100 p-0">
              {submissions.map((s) => {
                const designCount = s.designs?.length ?? 1;
                return (
                  <Link
                    key={s.id}
                    to={`/requests/${encodeURIComponent(s.id)}`}
                    className="flex flex-col gap-2 px-6 py-4 transition hover:bg-stone-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-stone-900">
                        {s.contact?.poReference || s.contact?.accountName || '(No reference)'}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {[s.contact?.accountName, s.contact?.contactName, s.contact?.email]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500">
                      <span className="rounded-full bg-stone-100 px-2 py-0.5">
                        {designCount} design{designCount === 1 ? '' : 's'}
                      </span>
                      <span>{collectionLabel(s.collection)}</span>
                      <span>{formatDate(s.submittedAt)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <PageFooter />
    </div>
  );
}
