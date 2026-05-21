import { useState, useRef } from 'react';
import { X, Plus, Info } from 'lucide-react';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function CcChipInput({ value, onChange, maxRecipients = 10 }) {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const ref = useRef(null);

  function addEmail(raw) {
    const email = raw.trim().replace(/,$/, '');
    if (!email) return;
    if (!EMAIL_RE.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (value.includes(email)) {
      setError('That recipient is already added.');
      return;
    }
    if (value.length >= maxRecipients) {
      setError(`Maximum ${maxRecipients} additional recipients.`);
      return;
    }
    onChange([...value, email]);
    setInput('');
    setError('');
  }

  function handleKey(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail(input);
    } else if (e.key === 'Backspace' && !input && value.length) {
      onChange(value.slice(0, -1));
    }
  }

  function remove(email) {
    onChange(value.filter((v) => v !== email));
  }

  return (
    <div>
      <label className="label-base flex items-center gap-1.5">
        Additional Recipients (CC)
        <span title="These addresses will be CC'd on quote correspondence." className="text-stone-400">
          <Info className="h-3.5 w-3.5" />
        </span>
      </label>
      <div className="rounded-lg border border-stone-300 bg-white p-2">
        {value.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1 pb-2">
            {value.map((email) => (
              <span
                key={email}
                className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-700"
              >
                {email}
                <button
                  type="button"
                  onClick={() => remove(email)}
                  aria-label={`Remove ${email}`}
                  className="text-stone-500 hover:text-stone-800"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          ref={ref}
          type="email"
          value={input}
          onChange={(e) => { setInput(e.target.value); setError(''); }}
          onKeyDown={handleKey}
          onBlur={() => input && addEmail(input)}
          placeholder="Add email and press Enter"
          className="w-full bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-stone-400"
        />
      </div>
      <button
        type="button"
        onClick={() => ref.current?.focus()}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gold-300 px-3 py-2 text-sm font-medium text-gold-700 hover:bg-gold-50"
      >
        <Plus className="h-4 w-4" />
        Add another recipient
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
