import { Check } from 'lucide-react';

const TONES = [
  { id: 'single', label: 'Single Tone', helper: 'One metal throughout' },
  { id: 'two-tone', label: 'Two-Tone', helper: 'A blend of two metals' },
];

const KARATS = [
  { id: '10K', label: '10K', sub: '41.7% gold' },
  { id: '14K', label: '14K', sub: '58.5% gold' },
  { id: '18K', label: '18K', sub: '75.0% gold' },
  { id: '22K', label: '22K', sub: '91.7% gold' },
  { id: 'Platinum', label: 'Platinum', sub: '950' },
  { id: 'Other', label: 'Other', sub: 'specify' },
];

const COLORS = [
  { id: 'yellow-gold', label: 'Yellow Gold', swatch: 'radial-gradient(circle at 30% 30%, #fde68a, #d4a017 70%, #8a6a0a)' },
  { id: 'white-gold', label: 'White Gold', swatch: 'radial-gradient(circle at 30% 30%, #ffffff, #e5e7eb 70%, #9ca3af)' },
  { id: 'rose-gold', label: 'Rose Gold', swatch: 'radial-gradient(circle at 30% 30%, #fecdd3, #f43f5e 70%, #9f1239)' },
  { id: 'platinum', label: 'Platinum', swatch: 'radial-gradient(circle at 30% 30%, #f1f5f9, #cbd5e1 70%, #64748b)' },
];

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
        style={{ background: COLORS[3].swatch }}
      />
    </div>
  );
}

function summaryLabel(metal) {
  const karatPart = metal.karat === 'Other'
    ? (metal.karatOther.trim() || 'Other')
    : metal.karat;
  const colorLabels = metal.colors
    .map((id) => COLORS.find((c) => c.id === id)?.label)
    .filter(Boolean);

  if (metal.tone === 'single') {
    if (colorLabels.length === 1) return `${karatPart} ${colorLabels[0]}`;
    return `Choose a color · ${karatPart} single tone`;
  }
  if (colorLabels.length === 2) {
    return `${karatPart} ${colorLabels[0]} & ${colorLabels[1]}`;
  }
  return `Choose two colors · ${karatPart} two-tone · ${colorLabels.length}/2 selected`;
}

export default function MetalSection({ value, onChange, error }) {
  const { tone, karat, karatOther, colors } = value;
  const colorsNeeded = tone === 'two-tone' ? 2 : 1;
  const summaryComplete = colors.length === colorsNeeded;

  function setTone(nextTone) {
    const nextColors = nextTone === 'single' ? colors.slice(0, 1) : colors.slice(0, 2);
    onChange({ tone: nextTone, colors: nextColors });
  }

  function toggleColor(id) {
    if (tone === 'single') {
      onChange({ colors: [id] });
      return;
    }
    const idx = colors.indexOf(id);
    if (idx >= 0) {
      onChange({ colors: colors.filter((c) => c !== id) });
      return;
    }
    if (colors.length >= 2) return;
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
          {KARATS.map((k) => {
            const selected = karat === k.id;
            return (
              <button
                key={k.id}
                type="button"
                onClick={() => onChange({ karat: k.id })}
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
            tone === 'two-tone'
              ? 'Select two colors — first is primary, second is accent.'
              : 'Select the color.'
          }
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {COLORS.map((c) => {
            const idx = colors.indexOf(c.id);
            const selected = idx >= 0;
            const order = tone === 'two-tone' && selected ? idx + 1 : null;
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
              : 'repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 4px, #f3f4f6 4px, #f3f4f6 8px)',
          }}
        />
        <p className="text-sm font-medium text-stone-800">{summaryLabel(value)}</p>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
