import { Gem, Camera } from 'lucide-react';

const OPTIONS = [
  {
    id: 'quote-only',
    icon: Gem,
    label: 'Quote Only',
    sub: 'Receive a detailed price estimate for your custom ring.',
  },
  {
    id: 'quote-renderings',
    icon: Camera,
    label: 'Quote + Renderings',
    sub: 'Receive a detailed quote and realistic 3D renderings.',
  },
];

export default function QuoteTypeCards({ value, onChange, error }) {
  return (
    <div>
      <p className="eyebrow mb-2">What do you need from us? <span className="text-gold-700">*</span></p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {OPTIONS.map(({ id, icon: Icon, label, sub }) => {
          const selected = value === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={
                'flex items-start gap-3 rounded-xl border p-4 text-left transition ' +
                (selected
                  ? 'border-gold-500 bg-gold-50/60 ring-1 ring-gold-500'
                  : 'border-stone-300 bg-white hover:border-stone-400')
              }
            >
              <span
                className={
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ' +
                  (selected ? 'border-gold-500 bg-gold-500' : 'border-stone-300 bg-white')
                }
              >
                {selected && <span className="h-2 w-2 rounded-full bg-white" />}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Icon className={'h-4 w-4 ' + (selected ? 'text-gold-700' : 'text-stone-500')} />
                  <p className="text-sm font-semibold text-stone-800">{label}</p>
                </div>
                <p className="mt-1 text-xs text-stone-500">{sub}</p>
              </div>
            </button>
          );
        })}
      </div>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
