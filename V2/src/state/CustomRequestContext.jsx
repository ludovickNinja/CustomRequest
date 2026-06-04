import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'customrequest:v1';

const defaultContact = {
  accountName: '',
  contactName: '',
  email: '',
  cc: [],
  poReference: '',
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
  metal: {
    tone: 'single',
    karat: '14K',
    karatOther: '',
    colors: ['yellow-gold'],
  },
  fingerSize: '',
  fingerSizeSystem: 'US',
  centerStone: {
    type: 'Diamond',
    typeOther: '',
    shape: 'Round',
    shapeOther: '',
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
    notes: '',
  },
  notes: '',
  uploads: [],
  includeCenterStone: false,
};

const defaultState = {
  collection: null,
  contact: defaultContact,
  designs: [defaultDesign],
  submittedAt: null,
};

function mergeDesign(parsed) {
  return {
    ...defaultDesign,
    ...(parsed || {}),
    metal: {
      ...defaultDesign.metal,
      ...(typeof (parsed || {}).metal === 'object' && (parsed || {}).metal !== null
        ? (parsed || {}).metal
        : {}),
    },
    centerStone: {
      ...defaultDesign.centerStone,
      ...((parsed || {}).centerStone || {}),
      uploads: (((parsed || {}).centerStone || {}).uploads || []).map((u) => ({ ...u, blobUrl: null, needsReattach: true })),
    },
    uploads: ((parsed || {}).uploads || []).map((u) => ({ ...u, blobUrl: null, needsReattach: true })),
  };
}

function loadInitial() {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    const designsSource = Array.isArray(parsed.designs)
      ? parsed.designs
      : parsed.design
      ? [parsed.design]
      : [defaultDesign];
    return {
      collection: parsed.collection ?? null,
      contact: { ...defaultContact, ...(parsed.contact || {}) },
      designs: designsSource.length ? designsSource.map(mergeDesign) : [defaultDesign],
      submittedAt: parsed.submittedAt ?? null,
    };
  } catch {
    return defaultState;
  }
}

function persistDesign(design) {
  return {
    ...design,
    uploads: (design.uploads || []).map(({ id, name, size, type }) => ({ id, name, size, type })),
    centerStone: {
      ...design.centerStone,
      uploads: (design.centerStone?.uploads || []).map(({ id, name, size, type }) => ({ id, name, size, type })),
    },
  };
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
        designs: state.designs.map(persistDesign),
        submittedAt: state.submittedAt,
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
    updateDesign: (index, patch) =>
      setState((s) => ({
        ...s,
        designs: s.designs.map((d, i) => (i === index ? { ...d, ...patch } : d)),
      })),
    updateDesignField: (index, field, value) =>
      setState((s) => ({
        ...s,
        designs: s.designs.map((d, i) => (i === index ? { ...d, [field]: value } : d)),
      })),
    updateCenterStone: (index, patch) =>
      setState((s) => ({
        ...s,
        designs: s.designs.map((d, i) =>
          i === index ? { ...d, centerStone: { ...d.centerStone, ...patch } } : d
        ),
      })),
    addDesign: () =>
      setState((s) => ({ ...s, designs: [...s.designs, defaultDesign] })),
    removeDesign: (index) =>
      setState((s) => {
        if (s.designs.length <= 1) return s;
        return { ...s, designs: s.designs.filter((_, i) => i !== index) };
      }),
    markSubmitted: () => setState((s) => ({ ...s, submittedAt: new Date().toISOString() })),
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
