/**
 * Store switcher — picks which store/account the customer view is acting as.
 *
 * Sits next to the ViewSwitcher in the top-right corner, but only in the
 * customer view (Admin sees every account; Factory is scoped by factory,
 * not store). Changing the selection re-scopes the customer's "Ongoing
 * Requests" list to that store and tags any new submission to it.
 *
 * A stand-in for account login: when real auth lands, the current store
 * comes from the session and this becomes a read-only indicator.
 */
import { useEffect, useRef, useState } from 'react';
import { Store, ChevronDown, Check } from 'lucide-react';
import { useStore } from '../state/StoreContext.jsx';

export default function StoreSwitcher() {
  const { accounts, currentAccountId, currentAccount, setCurrentAccountId } = useStore();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  function pick(id) {
    setCurrentAccountId(id);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/95 px-3 py-2 text-sm font-medium text-stone-700 shadow-sm backdrop-blur transition hover:border-stone-400 hover:text-gold-700"
      >
        <Store className="h-4 w-4 text-gold-700" />
        <span className="hidden max-w-[10rem] truncate sm:inline">
          {currentAccount?.name ?? 'Select store'}
        </span>
        <ChevronDown className={'h-4 w-4 text-stone-400 transition ' + (open ? 'rotate-180' : '')} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-stone-200 bg-white p-1.5 shadow-lg"
        >
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Viewing as store
          </p>
          {accounts.map((a) => {
            const active = a.id === currentAccountId;
            return (
              <button
                key={a.id}
                type="button"
                role="menuitem"
                onClick={() => pick(a.id)}
                className={
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ' +
                  (active ? 'bg-gold-50 text-gold-800' : 'text-stone-700 hover:bg-stone-50')
                }
              >
                <Store className={'h-4 w-4 shrink-0 ' + (active ? 'text-gold-700' : 'text-stone-400')} />
                <span className="flex-1">
                  <span className="block text-sm font-medium leading-tight">{a.name}</span>
                  {a.location && <span className="block text-xs text-stone-400">{a.location}</span>}
                </span>
                {active && <Check className="h-4 w-4 shrink-0 text-gold-700" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
