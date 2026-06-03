import FieldRow from '../shared/FieldRow.jsx';

const TYPES = ['Diamond', 'Lab-Grown Diamond', 'Moissanite', 'Gemstone'];

export default function AccentStonesSection({ value, onChange, errors = {} }) {
  return (
    <div>
      <fieldset>
        <legend className="label-base">Would you like accent stones on your ring?</legend>
        <label className="mr-6 inline-flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="accent-enabled"
            checked={value.enabled === 'yes'}
            onChange={() => onChange({ enabled: 'yes' })}
            className="accent-gold-500"
          />
          Yes
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="radio"
            name="accent-enabled"
            checked={value.enabled === 'no'}
            onChange={() => onChange({ enabled: 'no' })}
            className="accent-gold-500"
          />
          No
        </label>
      </fieldset>
      {value.enabled === 'yes' && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FieldRow label="Stone Type" required error={errors.type}>
            <select
              value={value.type}
              onChange={(e) => onChange({ type: e.target.value })}
              className={'input-base appearance-none ' + (errors.type ? 'input-error' : '')}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {value.type === 'Gemstone' && (
              <input
                type="text"
                value={value.typeOther}
                onChange={(e) => onChange({ typeOther: e.target.value })}
                placeholder="Please specify"
                maxLength={100}
                className={'input-base mt-2 ' + (errors.typeOther ? 'input-error' : '')}
              />
            )}
          </FieldRow>
          <FieldRow label="Total Carat Weight" required error={errors.totalCarat}>
            <input
              type="number"
              step="0.01"
              min="0"
              value={value.totalCarat}
              onChange={(e) => onChange({ totalCarat: e.target.value })}
              placeholder="0.50"
              className={'input-base ' + (errors.totalCarat ? 'input-error' : '')}
            />
          </FieldRow>
          <FieldRow label="Placement / Notes" htmlFor="accent-placement">
            <input
              id="accent-placement"
              type="text"
              value={value.placement}
              onChange={(e) => onChange({ placement: e.target.value })}
              placeholder="e.g. shoulders, halo"
              className="input-base"
            />
          </FieldRow>
        </div>
      )}
    </div>
  );
}
