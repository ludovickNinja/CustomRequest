/**
 * Factory Workspace — the production team's view.
 *
 * Scoped to the current factory: it shows only the references assigned to
 * that team (via the FactorySwitcher in the top-right). This is where a
 * factory picks up the work it's been sent; opening a reference shows the
 * specs and lets the team update production status and upload renderings.
 *
 * Reads through `submissionsStore.listReferences({ factoryId })`.
 */
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X, ChevronRight, Hammer } from 'lucide-react';
import PageFooter from '../../shared/PageFooter.jsx';
import StatusBadge from '../../shared/StatusBadge.jsx';
import SortHeader, { nextSort } from '../../shared/SortHeader.jsx';
import { listReferences } from '../../services/submissionsStore.js';
import { STATUSES } from '../../data/statuses.js';
import { findCollection } from '../../data/collections.js';
import { useFactory } from '../../state/FactoryContext.jsx';

function collectionLabel(id) {
  const c = findCollection(id);
  return c?.shortLabel || c?.label || id || '—';
}

export default function FactoryHomePage() {
  const { currentFactory, currentFactoryId } = useFactory();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState({ key: 'submittedAt', dir: 'desc' });
  const onSort = (key) => setSort((prev) => nextSort(prev, key));

  const rows = useMemo(
    () => listReferences({ search, status, factoryId: currentFactoryId, sort }),
    [search, status, currentFactoryId, sort]
  );
  const total = useMemo(
    () => listReferences({ factoryId: currentFactoryId }).length,
    [currentFactoryId]
  );

  const filtering = search.trim() || status !== 'all';
  function clearFilters() {
    setSearch('');
    setStatus('all');
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <main className="mx-auto max-w-6xl px-6 pb-16 pt-20">
        <header>
          <p className="eyebrow">Factory</p>
          <h1 className="mt-2 font-serif text-4xl text-stone-900">Factory Workspace</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-500">
            Pick up the work assigned to{' '}
            <span className="font-medium text-stone-700">{currentFactory?.name || 'your team'}</span>, update
            production status, and upload renderings.
          </p>
          <p className="mt-3 text-sm text-stone-500">
            {filtering ? (
              <>
                Showing <span className="font-semibold text-stone-700">{rows.length}</span> of {total}
              </>
            ) : (
              <>
                <span className="font-semibold text-stone-700">{total}</span>
              </>
            )}{' '}
            assigned reference{total === 1 ? '' : 's'}
          </p>
        </header>

        <section className="card-panel mt-6 p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-xl text-stone-900">Assigned Work</h2>
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

          <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_14rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Reference, quote, or customer request…"
                className="input-base pl-9"
              />
            </div>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-base appearance-none">
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
          </div>

          <div className="mt-5 overflow-x-auto">
            {rows.length === 0 ? (
              <div className="flex flex-col items-center px-6 py-16 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
                  <Hammer className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-serif text-xl text-stone-900">
                  {filtering ? 'No matching references' : 'No work assigned yet'}
                </h3>
                <p className="mt-2 max-w-sm text-sm text-stone-500">
                  {filtering
                    ? 'Try a different search, or clear the filters.'
                    : 'References assigned to this factory by the In House team will appear here.'}
                </p>
              </div>
            ) : (
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-stone-200 text-[11px] uppercase tracking-wider text-stone-500">
                    <SortHeader label="Reference" sortKey="referenceNo" sort={sort} onSort={onSort} />
                    <SortHeader label="Quote" sortKey="quoteNo" sort={sort} onSort={onSort} />
                    <SortHeader label="Customer Request" sortKey="poReference" sort={sort} onSort={onSort} />
                    <SortHeader label="Collection" sortKey="collection" sort={sort} onSort={onSort} />
                    <SortHeader label="Status" sortKey="status" sort={sort} onSort={onSort} />
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rows.map((r) => (
                    <tr key={r.referenceNo} className="group hover:bg-stone-50">
                      <td className="px-3 py-3">
                        <Link
                          to={`/factory/reference/${encodeURIComponent(r.referenceNo)}`}
                          className="font-medium text-stone-900 hover:text-gold-700"
                        >
                          {r.referenceNo}
                        </Link>
                        {r.designCount > 1 && (
                          <span className="ml-1.5 rounded bg-stone-100 px-1.5 py-0.5 text-[10px] text-stone-500">
                            {r.designIndex + 1}/{r.designCount}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-stone-600">{r.quoteNo}</td>
                      <td className="px-3 py-3 text-stone-700">{r.poReference || '—'}</td>
                      <td className="px-3 py-3 text-stone-600">{collectionLabel(r.collection)}</td>
                      <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                      <td className="px-3 py-3 text-right">
                        <Link
                          to={`/factory/reference/${encodeURIComponent(r.referenceNo)}`}
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
