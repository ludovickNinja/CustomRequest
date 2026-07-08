import { Gem } from 'lucide-react';

/** Every project type the app knows about, in display order. */
const ALL_TYPES = [
  'Engagement Ring',
  'Wedding Band',
  'Anniversary Ring',
  'Fashion Ring',
  'Other',
];

/**
 * Per-collection restrictions on which project types may be selected.
 *
 * Keys are collection ids (see `data/collections.js`). A collection not
 * listed here falls back to `ALL_TYPES` (e.g. Noam Carver and Full Custom
 * keep the complete list). Restricted lists are filtered against
 * `ALL_TYPES` so ordering stays consistent.
 */
const COLLECTION_TYPES = {
  crownring: ['Wedding Band', 'Anniversary Ring', 'Other'],
  'mia-my-caroline': ['Wedding Band', 'Anniversary Ring', 'Other'],
};

export function typesForCollection(collection) {
  const allowed = COLLECTION_TYPES[collection];
  if (!allowed) return ALL_TYPES;
  return ALL_TYPES.filter((t) => allowed.includes(t));
}

export default function ProjectTypeSelect({ collection, value, onChange, otherValue, onOtherChange }) {
  const types = typesForCollection(collection);

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
          {types.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      {value === 'Other' && (
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Please specify"
          className="input-base mt-2"
          maxLength={100}
        />
      )}
    </div>
  );
}
