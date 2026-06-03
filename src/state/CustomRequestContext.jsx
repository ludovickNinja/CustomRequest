import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'customrequest:v1';

const defaultContact = {
  accountName: '',
  contactName: '',
  email: '',
  cc: [],
  phoneCountry: 'US',
  phone: '',
  quoteType: 'quote-only',
  hasAppointment: 'no',
  appointmentDate: '',
  appointmentTime: '',
  preferredContact: 'email',
  projectType: '',
  projectTypeOther: '',
  notes: '',
};

const defaultDesign = {
  skus: [],
  metal: 'yellow-gold-14k',
  otherMetal: '',
  fingerSize: '',
  fingerSizeSystem: 'US',
  centerStone: {
    type: 'Diamond',
    typeOther: '',
    shape: 'Round',
    carat: '',
    caratUnit: 'ct',
    color: 'G',
    clarity: 'VS2',
    length: '',
    width: '',
    depth: '',
    provideStone: 'yes',
    certified: 'yes',
    setStone: 'yes',
    uploads: [],
  },
  accentStones: {
    enabled: 'yes',
    type: 'Diamond',
    typeOther: '',
    totalCarat: '',
    placement: '',
  },
  notes: '',
  uploads: [],
};

const defaultState = {
  collection: null,
  contact: defaultContact,
  design: defaultDesign,
};

function loadInitial() {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      collection: parsed.collection ?? null,
      contact: { ...defaultContact, ...(parsed.contact || {}) },
      design: {
        ...defaultDesign,
        ...(parsed.design || {}),
        centerStone: {
          ...defaultDesign.centerStone,
          ...((parsed.design || {}).centerStone || {}),
          uploads: (((parsed.design || {}).centerStone || {}).uploads || []).map((u) => ({ ...u, blobUrl: null, needsReattach: true })),
        },
        accentStones: { ...defaultDesign.accentStones, ...((parsed.design || {}).accentStones || {}) },
        uploads: ((parsed.design || {}).uploads || []).map((u) => ({ ...u, blobUrl: null, needsReattach: true })),
      },
    };
  } catch {
    return defaultState;
  }
}

const CustomRequestContext = createContext(null);

export function CustomRequestProvider({ children }) {
  const [state, setState] = useState(loadInitial);
  const isFirst = useRef(true);

  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    try {
      const persistable = {
        collection: state.collection,
        contact: state.contact,
        design: {
          ...state.design,
          uploads: state.design.uploads.map(({ id, name, size, type }) => ({ id, name, size, type })),
          centerStone: {
            ...state.design.centerStone,
            uploads: state.design.centerStone.uploads.map(({ id, name, size, type }) => ({ id, name, size, type })),
          },
        },
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const value = useMemo(() => ({
    state,
    setCollection: (id) => setState((s) => ({ ...s, collection: id })),
    setContactField: (field, value) =>
      setState((s) => ({ ...s, contact: { ...s.contact, [field]: value } })),
    setContact: (patch) =>
      setState((s) => ({ ...s, contact: { ...s.contact, ...patch } })),
    resetContact: () => setState((s) => ({ ...s, contact: defaultContact })),
    setDesignField: (field, value) =>
      setState((s) => ({ ...s, design: { ...s.design, [field]: value } })),
    setDesign: (patch) =>
      setState((s) => ({ ...s, design: { ...s.design, ...patch } })),
    setCenterStone: (patch) =>
      setState((s) => ({
        ...s,
        design: { ...s.design, centerStone: { ...s.design.centerStone, ...patch } },
      })),
    setAccentStones: (patch) =>
      setState((s) => ({
        ...s,
        design: { ...s.design, accentStones: { ...s.design.accentStones, ...patch } },
      })),
    resetAll: () => setState(defaultState),
  }), [state]);

  return (
    <CustomRequestContext.Provider value={value}>{children}</CustomRequestContext.Provider>
  );
}

export function useCustomRequest() {
  const ctx = useContext(CustomRequestContext);
  if (!ctx) throw new Error('useCustomRequest must be used inside CustomRequestProvider');
  return ctx;
}
