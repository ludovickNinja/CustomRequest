/**
 * Admin Operations — the In House view.
 *
 * One place to monitor every account's requests at the reference level
 * (one row per design across every submission), then drill into a single
 * reference to update its status, assign a factory, upload renderings,
 * answer messages, and publish pricing.
 *
 * The queue reads through `submissionsStore.listReferences` (unscoped — the
 * admin sees all accounts, unlike the store-scoped customer view) and the
 * summary line through `referenceStats`.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ChevronRight, Inbox } from 'lucide-react';
import PageFooter from '../../shared/PageFooter.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { listReferences, referenceStats } from '../../services/submissionsStore.js';
import { STATUSES } from '../../data/statuses.js';
import { factories, factoryName } from '../../data/factories.js';
import { findCollection } from '../../data/collections.js';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return iso || '';
  }
}

function collectionLabel(id) {
  const c = findCollection(id);
  return c?.shortLabel || c?.label || id || '—';
}

export default function AdminHomePage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [factoryId, setFactoryId] = useState('all');

  const rows = useMemo(
    () => listReferences({ search, status, factoryId }),
    [search, status, factoryId]
  );
  // Unfiltered totals for the summary line.
  const stats = useMemo(() => referenceStats(), []);

  const filtering = search.trim() || status !== 'all' || factoryId !== 'all';
  function clearFilters() {
    setSearch('');
    setStatus('all');
    setFactoryId('all');
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-20">
        <header>
          <p className="eyebrow">In House</p>
          <h1 className="mt-2 font-serif text-4xl text-stone-900">Admin Operations</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-500">
            Monitor requests, upload renderings, answer messages, and publish pricing.
          </p>
          <p className="mt-3 text-sm text-stone-500">
            {filtering ? (
              <>
                Showing <span className="font-semibold text-stone-700">{rows.length}</span> of{' '}
                {stats.total} reference{stats.total === 1 ? '' : 's'}
              </>
            ) : (
              <>
                Showing all <span className="font-semibold text-stone-700">{stats.total}</span> active
                reference{stats.total === 1 ? '' : 's'}
              </>
            )}{' '}
            · <span className="font-semibold text-amber-700">{stats.attention}</span> needing attention
          </p>
        </header>

        <section className="card-panel mt-6 p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-xl text-stone-900">Request Queue</h2>
            {filtering && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-stone-500">
            Select a reference to update its status, assets, messages, and pricing.
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_12rem_12rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Quote, reference, customer request, salesperson…"
                className="input-base pl-9"
              />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-base appearance-none">
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <select value={factoryId} onChange={(e) => setFactoryId(e.target.value)} className="input-base appearance-none">
              <option value="all">All factories</option>
              <option value="unassigned">Unassigned</option>
              {factories.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>

          <div className="mt-5 overflow-x-auto">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                  <Inbox className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-serif text-xl text-stone-900">No matching references</h3>
                <p className="mt-2 max-w-sm text-sm text-stone-500">
                  Try a different search, or clear the filters to see the full queue.
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[860px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-500">
                    <th className="px-3 py-2 font-medium">Quote</th>
                    <th className="px-3 py-2 font-medium">Reference</th>
                    <th className="px-3 py-2 font-medium">Customer Request</th>
                    <th className="px-3 py-2 font-medium">Account</th>
                    <th className="px-3 py-2 font-medium">Sales Person</th>
                    <th className="px-3 py-2 font-medium">Status</th>
                    <th className="px-3 py-2 font-medium">Factory</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rows.map((r) => (
                    <tr key={r.referenceNo} className="group hover:bg-stone-50">
                      <td className="px-3 py-3">
                        <Link
                          to={`/admin/reference/${encodeURIComponent(r.referenceNo)}`}
                          className="font-medium text-stone-900 hover:text-gold-700"
                        >
                          {r.quoteNo}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-stone-700">
                        {r.referenceNo}
                        {r.designCount > 1 && (
                          <span className="ml-1.5 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
                            {r.designIndex + 1}/{r.designCount}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-stone-800">{r.poReference || '—'}</span>
                        <span className="block text-xs text-stone-400">{collectionLabel(r.collection)}</span>
                      </td>
                      <td className="px-3 py-3 text-stone-700">{r.accountName || '—'}</td>
                      <td className="px-3 py-3 text-stone-700">{r.salesPerson || '—'}</td>
                      <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-3 py-3 text-stone-600">{r.factoryId ? factoryName(r.factoryId) : <span className="text-stone-400">Unassigned</span>}</td>
                      <td className="px-3 py-3 text-right">
                        <Link
                          to={`/admin/reference/${encodeURIComponent(r.referenceNo)}`}
                          className="inline-flex items-center text-stone-400 transition group-hover:text-gold-700"
                          aria-label={`Open ${r.referenceNo}`}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
      <PageFooter />
    </div>
  );
}
