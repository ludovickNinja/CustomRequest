/**
 * StoreContext — which store/account the customer view is currently acting as.
 *
 * The customer view is scoped to a single store: a given store only sees
 * *its own* ongoing projects, never another store's. Real auth will derive
 * the current store from the logged-in account; until then we let the user
 * impersonate any store via the StoreSwitcher in the top-right corner.
 *
 * The canonical store list lives in the framework-neutral repo-root
 * `Data/accounts.json` (same folder as the mock submissions), so the
 * `accountId` on each submission and the ids here always line up.
 *
 * The selection is persisted under `customrequest:currentAccount` so a
 * refresh keeps you "in" the same store. This is deliberately separate from
 * the submissions store and the in-progress form context.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import accounts from '../../../Data/accounts.json';

const STORAGE_KEY = 'customrequest:currentAccount';

/** First account is the default "current" store. */
function loadInitialId() {
  const fallback = accounts[0]?.id ?? null;
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    // Only trust a saved id that still exists in the account list.
    if (saved && accounts.some((a) => a.id === saved)) return saved;
  } catch {
    // ignore — fall through to the default
  }
  return fallback;
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [currentAccountId, setCurrentAccountId] = useState(loadInitialId);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, currentAccountId ?? '');
    } catch {
      // localStorage quota or private-mode — best effort only.
    }
  }, [currentAccountId]);

  const value = useMemo(
    () => ({
      accounts,
      currentAccountId,
      currentAccount: accounts.find((a) => a.id === currentAccountId) ?? null,
      setCurrentAccountId,
    }),
    [currentAccountId]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

/** Read the current store and the account list. Throws if used outside the provider. */
export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
