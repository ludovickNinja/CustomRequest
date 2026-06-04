import { Phone } from 'lucide-react';

const COUNTRIES = [
  { code: 'US', flag: '🇺🇸', dial: '+1' },
  { code: 'CA', flag: '🇨🇦', dial: '+1' },
  { code: 'GB', flag: '🇬🇧', dial: '+44' },
  { code: 'AU', flag: '🇦🇺', dial: '+61' },
  { code: 'FR', flag: '🇫🇷', dial: '+33' },
];

export default function PhoneInput({ country, value, onCountryChange, onValueChange, error, id = 'phone' }) {
  const selected = COUNTRIES.find((c) => c.code === country) || COUNTRIES[0];
  return (
    <div
      className={
        'flex items-stretch overflow-hidden rounded-lg border bg-white ' +
        (error ? 'border-red-400' : 'border-stone-300 focus-within:border-gold-500 focus-within:ring-2 focus-within:ring-gold-500/20')
      }
    >
      <span className="flex items-center pl-3 text-stone-400">
        <Phone className="h-4 w-4" />
      </span>
      <div className="flex items-center gap-1 border-r border-stone-200 px-2">
        <span className="text-lg leading-none">{selected.flag}</span>
        <select
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          aria-label="Country code"
          className="cursor-pointer bg-transparent text-sm text-stone-700 outline-none"
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>{c.dial}</option>
          ))}
        </select>
      </div>
      <input
        id={id}
        type="tel"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="(201) 555-0123"
        className="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-stone-400"
      />
    </div>
  );
}
