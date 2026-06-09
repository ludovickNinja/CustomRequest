/**
 * Factory switcher — picks which factory the Factory view is acting as.
 *
 * Sits next to the ViewSwitcher in the top-right, but only in the factory
 * view. Changing it re-scopes the factory workspace to that team's assigned
 * references. A stand-in for factory login until real auth lands (mirrors
 * the customer StoreSwitcher).
 */
import { useEffect, useRef, useState } from 'react';
import { Factory as FactoryIcon, ChevronDown, Check } from 'lucide-react';
import { useFactory } from '../state/FactoryContext.jsx';

export default function FactorySwitcher() {
  const { factories, currentFactoryId, currentFactory, setCurrentFactoryId } = useFactory();
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
    setCurrentFactoryId(id);
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
        <FactoryIcon className="h-4 w-4 text-gold-700" />
        <span className="hidden max-w-[10rem] truncate sm:inline">
          {currentFactory?.name ?? 'Select factory'}
        </span>
        <ChevronDown className={'h-4 w-4 text-stone-400 transition ' + (open ? 'rotate-180' : '')} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-stone-200 bg-white p-1.5 shadow-lg"
        >
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Working as factory
          </p>
          {factories.map((f) => {
            const active = f.id === currentFactoryId;
            return (
              <button
                key={f.id}
                type="button"
                role="menuitem"
                onClick={() => pick(f.id)}
                className={
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ' +
                  (active ? 'bg-gold-50 text-gold-800' : 'text-stone-700 hover:bg-stone-50')
                }
              >
                <FactoryIcon className={'h-4 w-4 shrink-0 ' + (active ? 'text-gold-700' : 'text-stone-400')} />
                <span className="flex-1">
                  <span className="block text-sm font-medium leading-tight">{f.name}</span>
                  <span className="block text-xs text-stone-400">{f.type === 'in-house' ? 'In House' : 'External'}</span>
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
