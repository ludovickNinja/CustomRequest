/**
 * Sortable table header cell. Clicking it sorts the table by `sortKey`;
 * clicking the active column again flips the direction. Used by the admin
 * Request Queue and the Factory Workspace tables.
 *
 * `sort` is the current { key, dir } and `onSort(key)` toggles it.
 */
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export default function SortHeader({ label, sortKey, sort, onSort, className = '' }) {
  const active = sort.key === sortKey;
  const Icon = active ? (sort.dir === 'asc' ? ChevronUp : ChevronDown) : ChevronsUpDown;
  return (
    <th className={'px-3 py-2 font-medium ' + className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
        className={'inline-flex items-center gap-1 transition hover:text-stone-700 ' + (active ? 'text-stone-700' : '')}
      >
        {label}
        <Icon className={'h-3 w-3 ' + (active ? 'text-gold-600' : 'text-stone-300')} />
      </button>
    </th>
  );
}

/**
 * Toggle helper for sort state: click a new column → sort it ascending;
 * click the active column → flip direction.
 */
export function nextSort(prev, key) {
  if (prev.key === key) return { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' };
  return { key, dir: 'asc' };
}
