import { useState } from 'react';
import { X } from 'lucide-react';

export default function SkuChipInput({ value, onChange, error }) {
  const [input, setInput] = useState('');
  const [localError, setLocalError] = useState('');

  function add() {
    const sku = input.trim();
    if (!sku) return;
    if (value.includes(sku)) {
      setLocalError('That SKU is already added.');
      return;
    }
    onChange([...value, sku]);
    setInput('');
    setLocalError('');
  }

  function remove(sku) {
    onChange(value.filter((s) => s !== sku));
  }

  function handleKey(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      add();
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={(e) => { setInput(e.target.value); setLocalError(''); }}
          onKeyDown={handleKey}
          placeholder="Enter SKU"
          className="input-base flex-1"
        />
        <button
          type="button"
          onClick={add}
          className="rounded-lg border border-stone-300 bg-white px-6 py-2.5 text-sm font-medium text-stone-800 hover:bg-stone-50"
        >
          Add SKU
        </button>
      </div>
      {value.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {value.map((sku) => (
            <span
              key={sku}
              className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
            >
              {sku}
              <button
                type="button"
                onClick={() => remove(sku)}
                aria-label={`Remove ${sku}`}
                className="text-stone-500 hover:text-stone-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {(localError || error) && (
        <p className="mt-2 text-xs text-red-600">{localError || error}</p>
      )}
    </div>
  );
}
