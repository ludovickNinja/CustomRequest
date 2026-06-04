/**
 * CustomRequestContext — the customer's in-progress form state.
 *
 * The buyer fills out three pages of a multi-step form (contact info,
 * design details, review). The form state needs to survive route changes,
 * refreshes, and back-button navigation, so we keep it in React Context
 * and mirror it to localStorage under `customrequest:v1`.
 *
 * This module owns:
 *   1. The default shape of `contact` and each `design`.
 *   2. Loading + writing the state to localStorage (with safe defaults
 *      and a small migration path for older single-`design` records).
 *   3. Index-aware mutation helpers — the form holds an array of designs
 *      so the buyer can submit several rings at once.
 *
 * Once the customer hits Submit on the review page, the final snapshot
 * is handed off to `services/submissionsStore.createSubmission`. This
 * context never talks to the submissions store directly — that boundary
 * is what makes the "real backend later" swap trivial.
 *
 * File uploads are tricky: we keep the in-memory blob URLs alive for the
 * current session, but localStorage only stores the metadata. After a
 * refresh the file objects need to be re-attached; we mark them with
 * `needsReattach: true` so the upload component can prompt for that.
 */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

/** localStorage key for the in-progress form. Different from `customrequest:submissions`. */
const STORAGE_KEY = 'customrequest:v1';

/**
 * Empty contact fields. Each property maps to a field on page 2.
 * - `cc` is an array of email strings for CC chip input.
 * - `quoteType` is a radio choice: 'quote-only' or 'quote-and-design'.
 * - `hasAppointment` controls whether the appointment date/time
 *   sub-fields are shown and validated.
 * - `projectType` / `projectTypeOther` — when "Other", we ask the user
 *   to specify in the second field.
 */
const defaultContact = {
  accountName: '',
  contactName: '',
  email: '',
  cc: [],
  poReference: '',         // required PO# / reference / client name
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

/**
 * Empty design state. The customer can have several of these in a single
 * submission. See `V2/src/customer/components/design/MetalSection.jsx` and
 * `CenterStoneSection.jsx` for what each nested field actually controls.
 *
 * `includeCenterStone` is a soft toggle for project types where a center
 * stone is optional (e.g. Wedding Band). For Engagement Ring (and the
 * unset default) the form always renders the center stone section, and
 * `includeCenterStone` is ignored — see DesignDetailsForm's
 * `centerStoneRequired` logic.
 */
const defaultDesign = {
  skus: [],
  metal: {
    tone: 'single',                  // 'single' | 'two-tone'
    karat: '14K',                    // see karatsFor() in MetalSection.jsx
    karatOther: '',                  // populated when karat === 'Other'
    colors: ['yellow-gold'],         // 1 entry for single tone, 2 for two-tone
  },
  fingerSize: '',
  fingerSizeSystem: 'US',            // 'US' | 'EU' | 'UK' — see data/ringSizes.js
  centerStone: {
    type: 'Diamond',                 // 'Diamond' | 'Lab-Grown Diamond' | 'Moissanite' | 'Gemstone'
    typeOther: '',                   // populated when type === 'Gemstone'
    shape: 'Round',
    shapeOther: '',                  // populated when shape === 'Other'
    carat: '',
    caratUnit: 'ct',                 // 'ct' | 'mm'
    color: 'G',
    clarity: 'VS2',
    length: '',                      // only validated when the customer provides the stone
    width: '',
    depth: '',
    provideStone: 'yes',             // 'yes' = Crown Ring provides, 'no' = customer provides
    certified: 'yes',                // only meaningful when provideStone === 'yes'
    setStone: 'yes',                 // only meaningful when provideStone === 'no'
    uploads: [],                     // stone photos (customer-provided stones)
    notes: '',
  },
  notes: '',
  uploads: [],                       // reference images for the design
  includeCenterStone: false,
};

const defaultState = {
  collection: null,
  contact: defaultContact,
  designs: [defaultDesign],
  submittedAt: null,
};

/**
 * Merge a stored design back into our current shape. Anything missing
 * gets the defaults. We never trust the stored blob URLs (they only live
 * as long as the page does) so we strip them and mark each upload as
 * needing re-attachment.
 */
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
      uploads: (((parsed || {}).centerStone || {}).uploads || []).map((u) => ({
        ...u,
        blobUrl: null,
        needsReattach: true,
      })),
    },
    uploads: ((parsed || {}).uploads || []).map((u) => ({
      ...u,
      blobUrl: null,
      needsReattach: true,
    })),
  };
}

/**
 * Hydrate state from localStorage. Falls back to `defaultState` on every
 * failure mode (no window, missing/blank value, bad JSON).
 *
 * Migration: older versions of this app stored a single `design` object
 * instead of a `designs` array. We promote that into a one-element array
 * here so old sessions still work after the multi-design refactor.
 */
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

/**
 * Prepare a design for localStorage. We drop the in-memory `blobUrl` and
 * `needsReattach` fields and keep only the file metadata — the actual
 * file bytes can't be JSON-serialized.
 */
function persistDesign(design) {
  return {
    ...design,
    uploads: (design.uploads || []).map(({ id, name, size, type }) => ({ id, name, size, type })),
    centerStone: {
      ...design.centerStone,
      uploads: (design.centerStone?.uploads || []).map(({ id, name, size, type }) => ({
        id, name, size, type,
      })),
    },
  };
}

const CustomRequestContext = createContext(null);

/**
 * Provider that holds the form state and exposes mutation helpers. Wraps
 * the entire app in V2/src/App.jsx.
 */
export function CustomRequestProvider({ children }) {
  const [state, setState] = useState(loadInitial);

  // The mirror-to-localStorage effect runs on every state change EXCEPT
  // the very first render. Skipping the first render avoids writing back
  // the value we just loaded, which would be wasted work and would also
  // clobber any sibling tab if we ever add storage events.
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
      // localStorage quota or private-mode — best effort only.
    }
  }, [state]);

  // The mutation helpers are memoized so that consumers don't re-render
  // every time state changes (only when *their* slice changes).
  const value = useMemo(() => ({
    state,

    // --- top-level fields -----------------------------------------------
    setCollection: (id) => setState((s) => ({ ...s, collection: id })),

    // --- contact field helpers ------------------------------------------
    setContactField: (field, value) =>
      setState((s) => ({ ...s, contact: { ...s.contact, [field]: value } })),
    setContact: (patch) =>
      setState((s) => ({ ...s, contact: { ...s.contact, ...patch } })),
    resetContact: () => setState((s) => ({ ...s, contact: defaultContact })),

    // --- per-design helpers --------------------------------------------
    // All four helpers take a 0-based index because the form can hold an
    // array of designs. Pass the index of the design you're editing.
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

    // --- design list operations ----------------------------------------
    addDesign: () =>
      setState((s) => ({ ...s, designs: [...s.designs, defaultDesign] })),
    /**
     * Remove the design at `index`. We refuse to remove the only design
     * so the form never ends up empty; the UI also hides the remove
     * button in that case.
     */
    removeDesign: (index) =>
      setState((s) => {
        if (s.designs.length <= 1) return s;
        return { ...s, designs: s.designs.filter((_, i) => i !== index) };
      }),

    // --- lifecycle ------------------------------------------------------
    /** Stamp the moment the customer submitted (used by the review page). */
    markSubmitted: () => setState((s) => ({ ...s, submittedAt: new Date().toISOString() })),
    /** Wipe the whole in-progress form back to defaults. */
    resetAll: () => setState(defaultState),
  }), [state]);

  return (
    <CustomRequestContext.Provider value={value}>{children}</CustomRequestContext.Provider>
  );
}

/**
 * Read the current customer form state and the mutation helpers. Throws
 * if used outside the provider — a programmer error worth surfacing.
 */
export function useCustomRequest() {
  const ctx = useContext(CustomRequestContext);
  if (!ctx) throw new Error('useCustomRequest must be used inside CustomRequestProvider');
  return ctx;
}
