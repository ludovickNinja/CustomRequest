import { Gem } from 'lucide-react';

const TYPES = [
  'Engagement Ring',
  'Wedding Band',
  'Anniversary Ring',
  'Fashion Ring',
  'Other',
];

export default function ProjectTypeSelect({ value, onChange }) {
  return (
    <div>
      <p className="eyebrow mb-1.5">Project Type</p>
      <div className="relative">
        <Gem className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-stone-400" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-base pl-9 appearance-none"
        >
          <option value="">Select project type</option>
          {TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
