import { ringSizes, convertSize } from '../../data/ringSizes.js';

const SYSTEMS = ['US', 'UK', 'EU'];

export default function FingerSizeField({ system, size, onSystemChange, onSizeChange, error }) {
  function handleSystemChange(next) {
    if (next === system) return;
    const converted = convertSize(size, system, next);
    onSystemChange(next);
    onSizeChange(converted);
  }
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <select
          value={size}
          onChange={(e) => onSizeChange(e.target.value)}
          className={'input-base flex-1 appearance-none ' + (error ? 'input-error' : '')}
        >
          <option value="">Select ring size</option>
          {ringSizes[system].map((s) => (
            <option key={s} value={s}>{`${system} ${s}`}</option>
          ))}
        </select>
        <div className="inline-flex rounded-full border border-stone-300 bg-white p-1">
          {SYSTEMS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleSystemChange(s)}
              className={
                'rounded-full px-4 py-1.5 text-xs font-medium transition ' +
                (s === system
                  ? 'bg-gold-100 text-gold-800 ring-1 ring-gold-400'
                  : 'text-stone-500 hover:text-stone-800')
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
