import { Check } from 'lucide-react';

const TONES = [
  { id: 'single', label: 'Single Tone', helper: 'One metal throughout' },
  { id: 'two-tone', label: 'Two-Tone', helper: 'A blend of two metals' },
];

const KARATS_SINGLE = [
  { id: '10K', label: '10K', sub: '41.7% gold' },
  { id: '14K', label: '14K', sub: '58.5% gold' },
  { id: '18K', label: '18K', sub: '75.0% gold' },
  { id: 'Platinum', label: 'Platinum', sub: '950' },
  { id: 'Other', label: 'Other', sub: 'specify' },
];

const KARATS_TWO_TONE = [
  { id: '10K', label: '10K', sub: '41.7% gold' },
  { id: '14K', label: '14K', sub: '58.5% gold' },
  { id: '18K', label: '18K', sub: '75.0% gold' },
  { id: '14K / Platinum', label: '14K / Platinum', sub: 'gold + 950' },
  { id: '18K / Platinum', label: '18K / Platinum', sub: 'gold + 950' },
  { id: 'Other', label: 'Other', sub: 'specify' },
];

const PLATINUM_SWATCH = 'radial-gradient(circle at 30% 30%, #f1f5f9, #cbd5e1 70%, #64748b)';

const COLORS = [
  { id: 'yellow-gold', label: 'Yellow Gold', swatch: 'radial-gradient(circle at 30% 30%, #fde68a, #d4a017 70%, #8a6a0a)' },
  { id: 'white-gold', label: 'White Gold', swatch: 'radial-gradient(circle at 30% 30%, #ffffff, #e5e7eb 70%, #9ca3af)' },
  { id: 'rose-gold', label: 'Rose Gold', swatch: 'radial-gradient(circle at 30% 30%, #fecdd3, #f43f5e 70%, #9f1239)' },
];

export function karatsFor(tone) {
  return tone === 'two-tone' ? KARATS_TWO_TONE : KARATS_SINGLE;
}

export function colorsNeeded(metal) {
  if (metal.tone === 'single' && metal.karat === 'Platinum') return 0;
  if (metal.tone === 'single') return 1;
  if (metal.karat === '14K / Platinum' || metal.karat === '18K / Platinum') return 1;
  return 2;
}

export function metalSummary(metal) {
  const karatPart = metal.karat === 'Other'
    ? (metal.karatOther.trim() || 'Other')
    : metal.karat;
  const colorLabels = metal.colors
    .map((id) => COLORS.find((c) => c.id === id)?.label)
    .filter(Boolean);
  const needed = colorsNeeded(metal);

  if (needed === 0) return karatPart;
  if (metal.tone === 'single') {
    if (colorLabels.length === 1) return `${karatPart} ${colorLabels[0]}`;
    return `Choose a color · ${karatPart} single tone`;
  }
  if (needed === 1) {
    if (colorLabels.length === 1) return `${karatPart} (${colorLabels[0]} + Platinum)`;
    return `Choose the gold color · ${karatPart}`;
  }
  if (colorLabels.length === 2) {
    return `${karatPart} ${colorLabels[0]} & ${colorLabels[1]}`;
  }
  return `Choose two colors · ${karatPart} two-tone · ${colorLabels.length}/2 selected`;
}

function SubsectionHeader({ letter, title, helper }) {
  return (
    <div className="mb-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gold-400 text-xs font-semibold text-gold-700">
          {letter}
        </span>
        <p className="text-sm font-semibold text-stone-900">{title}</p>
      </div>
      {helper && <p className="ml-8 mt-0.5 text-xs text-stone-500">{helper}</p>}
    </div>
  );
}

function ToneIcon({ tone }) {
  if (tone === 'single') {
    return (
      <span
        className="block h-10 w-10 rounded-full"
        style={{ background: COLORS[0].swatch }}
      />
    );
  }
  return (
    <div className="relative h-10 w-14">
      <span
        className="absolute left-0 top-0 block h-10 w-10 rounded-full"
        style={{ background: COLORS[0].swatch }}
      />
      <span
        className="absolute left-5 top-1 block h-9 w-9 rounded-full ring-2 ring-white"
        style={{ background: PLATINUM_SWATCH }}
      />
    </div>
  );
}

function summaryLabel(metal) {
  return metalSummary(metal);
}

export default function MetalSection({ value, onChange, error }) {
  const { tone, karat, karatOther, colors } = value;
  const karats = karatsFor(tone);
  const needed = colorsNeeded(value);
  const summaryComplete = colors.length === needed;

  function setTone(nextTone) {
    const patch = { tone: nextTone };
    if (nextTone === 'single' && (karat === '14K / Platinum' || karat === '18K / Platinum')) {
      patch.karat = '14K';
    }
    const nextMetal = { ...value, ...patch };
    const trim = colorsNeeded(nextMetal);
    patch.colors = colors.slice(0, trim);
    onChange(patch);
  }

  function setKarat(nextKarat) {
    const patch = { karat: nextKarat };
    const nextMetal = { ...value, ...patch };
    const trim = colorsNeeded(nextMetal);
    if (colors.length > trim) patch.colors = colors.slice(0, trim);
    onChange(patch);
  }

  function toggleColor(id) {
    if (needed === 1) {
      onChange({ colors: [id] });
      return;
    }
    const idx = colors.indexOf(id);
    if (idx >= 0) {
      onChange({ colors: colors.filter((c) => c !== id) });
      return;
    }
    if (colors.length >= needed) return;
    onChange({ colors: [...colors, id] });
  }

  return (
    <div className="space-y-6">
      <div>
        <SubsectionHeader
          letter="A"
          title="Tone"
          helper="Is this a single metal or a combination of two?"
        />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TONES.map((t) => {
            const selected = tone === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTone(t.id)}
                className={
                  'relative flex items-center gap-4 rounded-2xl border bg-white p-4 text-left transition ' +
                  (selected
                    ? 'border-gold-500 bg-gold-50/30 ring-1 ring-gold-500'
                    : 'border-stone-300 hover:border-stone-400')
                }
              >
                <span
                  className={
                    'absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full ' +
                    (selected ? 'bg-gold-600 text-white' : 'border-2 border-stone-300 bg-white')
                  }
                >
                  {selected && <Check className="h-3 w-3" />}
                </span>
                <div className="ml-6 flex flex-1 items-center gap-4">
                  <ToneIcon tone={t.id} />
                  <div>
                    <p className="text-sm font-semibold text-stone-900">{t.label}</p>
                    <p className="text-xs text-stone-500">{t.helper}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <SubsectionHeader letter="B" title="Karat" helper="Select the metal grade." />
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {karats.map((k) => {
            const selected = karat === k.id;
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => setKarat(k.id)}
                className={
                  'flex flex-col items-center rounded-xl border bg-white px-3 py-2 transition ' +
                  (selected
                    ? 'border-gold-500 bg-gold-50/40 ring-1 ring-gold-500'
                    : 'border-stone-300 hover:border-stone-400')
                }
              >
                <span className="text-sm font-semibold text-stone-900">{k.label}</span>
                <span className="text-[11px] text-stone-500">{k.sub}</span>
              </button>
            );
          })}
        </div>
        {karat === 'Other' && (
          <input
            type="text"
            value={karatOther}
            onChange={(e) => onChange({ karatOther: e.target.value })}
            placeholder="Please specify"
            maxLength={60}
            className="input-base mt-3"
          />
        )}
      </div>

      <div>
        <SubsectionHeader
          letter="C"
          title="Colors"
          helper={
            needed === 0
              ? 'Not applicable — Platinum is the metal.'
              : tone === 'two-tone' && needed === 2
              ? 'Select two colors — first is primary, second is accent.'
              : tone === 'two-tone'
              ? 'Select the gold color — the other side is Platinum.'
              : 'Select the color.'
          }
        />
        {needed === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
            None — Platinum is the metal.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COLORS.map((c) => {
              const idx = colors.indexOf(c.id);
              const selected = idx >= 0;
              const order = tone === 'two-tone' && needed === 2 && selected ? idx + 1 : null;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleColor(c.id)}
                  className={
                    'relative flex flex-col items-center rounded-2xl border bg-white p-4 transition ' +
                    (selected
                      ? 'border-gold-500 bg-gold-50/30 ring-1 ring-gold-500'
                      : 'border-stone-300 hover:border-stone-400')
                  }
                >
                  <span
                    className={
                      'absolute left-3 top-3 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ' +
                      (selected
                        ? 'bg-gold-600 text-white'
                        : 'border-2 border-stone-300 bg-white')
                    }
                  >
                    {selected && (order ?? <Check className="h-3 w-3" />)}
                  </span>
                  <span
                    className="mt-2 block h-16 w-16 rounded-full"
                    style={{ background: c.swatch }}
                  />
                  <p className="mt-3 text-sm font-medium text-stone-800">{c.label}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div
        className={
          'flex items-center gap-3 rounded-2xl border px-4 py-3 ' +
          (summaryComplete
            ? 'border-gold-300 bg-gold-50/60'
            : 'border-stone-200 bg-stone-50')
        }
      >
        <span
          className="block h-8 w-8 rounded-full ring-1 ring-inset ring-white/40"
          style={{
            background: colors[0]
              ? COLORS.find((c) => c.id === colors[0])?.swatch
              : needed === 0
              ? PLATINUM_SWATCH
              : 'repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 4px, #f3f4f6 4px, #f3f4f6 8px)',
          }}
        />
        <p className="text-sm font-medium text-stone-800">{summaryLabel(value)}</p>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
