import { Check, MoreHorizontal } from 'lucide-react';

const TILES = [
  { id: 'yellow-gold-14k', label: 'Yellow Gold', sub: '14K', swatch: 'from-yellow-200 to-yellow-400' },
  { id: 'white-gold-14k', label: 'White Gold', sub: '14K', swatch: 'from-stone-200 to-stone-400' },
  { id: 'rose-gold-14k', label: 'Rose Gold', sub: '14K', swatch: 'from-rose-200 to-rose-400' },
  { id: 'platinum-950', label: 'Platinum', sub: '950', swatch: 'from-slate-200 to-slate-400' },
  { id: 'two-tone-14k', label: 'Two Tone', sub: '14K', swatch: 'from-yellow-200 via-stone-200 to-yellow-400' },
  { id: 'other', label: 'Other Metal', sub: '', swatch: null },
];

const OTHER_METAL_OPTIONS = [
  'Palladium',
  '10K Yellow Gold',
  '10K White Gold',
  '10K Rose Gold',
  '18K Yellow Gold',
  '18K White Gold',
  '18K Rose Gold',
  'Sterling Silver',
  'Titanium',
];

export default function MetalGrid({ value, otherValue, onChange, onOtherChange, error }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {TILES.map((tile) => {
          const selected = value === tile.id;
          return (
            <button
              key={tile.id}
              type="button"
              onClick={() => onChange(tile.id)}
              className={
                'relative flex flex-col items-center rounded-xl border bg-white p-3 transition ' +
                (selected ? 'border-gold-500 ring-1 ring-gold-500' : 'border-stone-300 hover:border-stone-400')
              }
            >
              {selected && (
                <span className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-gold-500 text-white">
                  <Check className="h-3 w-3" />
                </span>
              )}
              {!selected && (
                <span className="absolute left-2 top-2 h-4 w-4 rounded-full border-2 border-stone-300 bg-white" />
              )}
              <div className="my-3 flex h-16 w-16 items-center justify-center">
                {tile.swatch ? (
                  <span
                    className={
                      'block h-12 w-12 rounded-full bg-gradient-to-br ring-1 ring-inset ring-white/40 ' +
                      tile.swatch
                    }
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-400">
                    <MoreHorizontal className="h-5 w-5" />
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-stone-800">{tile.label}</p>
              {tile.sub && <p className="text-xs text-stone-500">{tile.sub}</p>}
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <select
          value={otherValue}
          disabled={value !== 'other'}
          onChange={(e) => onOtherChange(e.target.value)}
          className={
            'input-base appearance-none ' +
            (value !== 'other' ? 'cursor-not-allowed bg-stone-50 text-stone-400' : '')
          }
        >
          <option value="">Select another metal</option>
          {OTHER_METAL_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
