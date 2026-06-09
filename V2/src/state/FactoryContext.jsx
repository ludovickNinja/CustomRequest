/**
 * FactoryContext — which factory the Factory view is currently acting as.
 *
 * The factory view is scoped to a single production team: a factory only
 * sees the references assigned to it. Real auth will derive the current
 * factory from the logged-in account; until then the FactorySwitcher in the
 * top-right lets us act as any factory (mirrors the customer StoreContext).
 *
 * The selection is persisted under `customrequest:currentFactory`.
 */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { factories } from '../data/factories.js';

const STORAGE_KEY = 'customrequest:currentFactory';

function loadInitialId() {
  const fallback = factories[0]?.id ?? null;
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && factories.some((f) => f.id === saved)) return saved;
  } catch {
    // ignore — fall through to the default
  }
  return fallback;
}

const FactoryContext = createContext(null);

export function FactoryProvider({ children }) {
  const [currentFactoryId, setCurrentFactoryId] = useState(loadInitialId);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, currentFactoryId ?? '');
    } catch {
      // best effort only
    }
  }, [currentFactoryId]);

  const value = useMemo(
    () => ({
      factories,
      currentFactoryId,
      currentFactory: factories.find((f) => f.id === currentFactoryId) ?? null,
      setCurrentFactoryId,
    }),
    [currentFactoryId]
  );

  return <FactoryContext.Provider value={value}>{children}</FactoryContext.Provider>;
}

export function useFactory() {
  const ctx = useContext(FactoryContext);
  if (!ctx) throw new Error('useFactory must be used inside FactoryProvider');
  return ctx;
}
