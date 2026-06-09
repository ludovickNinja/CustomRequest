/**
 * Global view switcher — the dropdown pinned to the top-right corner on
 * every page. It lets us hop between the three roles V2 serves without
 * editing the URL by hand:
 *
 *   - Customer — the request form and the customer's ongoing projects.
 *   - Admin    — the In House view (every account's requests).
 *   - Factory  — an in-house / external resource's assigned work.
 *
 * Roles are URL-gated today (no auth), so "switching" is just navigation:
 * Customer → "/", Admin → "/admin", Factory → "/factory". When real auth
 * lands this becomes an account/role indicator rather than a free switch,
 * but the menu shape stays the same.
 *
 * Rendered inside <TopRightControls>, which owns the fixed top-right
 * positioning. This component just lays itself out relatively and reads
 * the current location to label the trigger and highlight the active entry.
 */
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { User, ShieldCheck, Factory, ChevronDown, Check } from 'lucide-react';

const ROLES = {
  customer: { label: 'Customer', Icon: User },
  admin: { label: 'Admin', Icon: ShieldCheck },
  factory: { label: 'Factory', Icon: Factory },
};

/** Map a pathname to the role whose view it belongs to. */
function roleForPath(pathname) {
  if (pathname.startsWith('/admin')) return 'admin';
  if (pathname.startsWith('/factory')) return 'factory';
  return 'customer';
}

export default function ViewSwitcher() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const role = roleForPath(pathname);
  const { label, Icon } = ROLES[role];

  // The customer view has two landing spots worth linking directly.
  const onForm = role === 'customer' && !pathname.startsWith('/requests');
  const onRequests = pathname.startsWith('/requests');

  // Close on an outside click or Escape, but only while the menu is open.
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

  function go(to) {
    setOpen(false);
    navigate(to);
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
        <Icon className="h-4 w-4 text-gold-700" />
        <span className="hidden sm:inline">{label} View</span>
        <span className="sm:hidden">{label}</span>
        <ChevronDown className={'h-4 w-4 text-stone-400 transition ' + (open ? 'rotate-180' : '')} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-stone-200 bg-white p-1.5 shadow-lg"
        >
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Customer
          </p>
          <MenuItem
            Icon={User}
            label="New Request"
            hint="Start the request form"
            active={onForm}
            onClick={() => go('/')}
          />
          <MenuItem
            Icon={User}
            label="Ongoing Requests"
            hint="Track submitted projects"
            active={onRequests}
            onClick={() => go('/requests')}
          />

          <div className="my-1 border-t border-stone-100" />

          <p className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
            Internal
          </p>
          <MenuItem
            Icon={ShieldCheck}
            label="Admin"
            hint="In House — all accounts"
            active={role === 'admin'}
            onClick={() => go('/admin')}
          />
          <MenuItem
            Icon={Factory}
            label="Factory"
            hint="Assigned work"
            active={role === 'factory'}
            onClick={() => go('/factory')}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({ Icon, label, hint, active, onClick }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={
        'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition ' +
        (active ? 'bg-gold-50 text-gold-800' : 'text-stone-700 hover:bg-stone-50')
      }
    >
      <Icon className={'h-4 w-4 shrink-0 ' + (active ? 'text-gold-700' : 'text-stone-400')} />
      <span className="flex-1">
        <span className="block text-sm font-medium leading-tight">{label}</span>
        <span className="block text-xs text-stone-400">{hint}</span>
      </span>
      {active && <Check className="h-4 w-4 shrink-0 text-gold-700" />}
    </button>
  );
}
