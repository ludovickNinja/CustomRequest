import FieldRow from '../shared/FieldRow.jsx';
import ReferenceImagesUploader from './ReferenceImagesUploader.jsx';

const STONE_TYPES = ['Diamond', 'Moissanite', 'Lab-Grown Diamond', 'Gemstones'];
const SHAPES = ['Round', 'Oval', 'Princess', 'Cushion', 'Emerald', 'Pear', 'Marquise', 'Radiant', 'Asscher', 'Heart'];
const COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'N/A'];
const CLARITIES = ['FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'I1', 'N/A'];

function Select({ field, value, options, onChange, error }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange({ [field]: e.target.value })}
      className={'input-base appearance-none ' + (error ? 'input-error' : '')}
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}

export default function CenterStoneSection({ value, onChange, errors = {} }) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <fieldset>
          <legend className="label-base">Who is providing the center stone?</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="provideStone"
              checked={value.provideStone === 'yes'}
              onChange={() => onChange({ provideStone: 'yes' })}
              className="accent-gold-500"
            />
            Crown Ring will provide the center stone
          </label>
          <label className="mt-1 flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="provideStone"
              checked={value.provideStone === 'no'}
              onChange={() => onChange({ provideStone: 'no' })}
              className="accent-gold-500"
            />
            I will provide the center stone
          </label>
        </fieldset>
        {value.provideStone === 'yes' && (
          <div className="rounded-xl border border-gold-200 bg-gold-50/60 p-4">
            <p className="text-sm font-medium text-stone-800">
              Will the center stone be certified?
            </p>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="certified"
                checked={value.certified === 'yes'}
                onChange={() => onChange({ certified: 'yes' })}
                className="accent-gold-500"
              />
              Yes, certified
            </label>
            <label className="mt-1 flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="certified"
                checked={value.certified === 'no'}
                onChange={() => onChange({ certified: 'no' })}
                className="accent-gold-500"
              />
              No, not certified
            </label>
          </div>
        )}
        {value.provideStone === 'no' && (
          <div className="rounded-xl border border-gold-200 bg-gold-50/60 p-4">
            <p className="text-sm font-medium text-stone-800">
              Would you like us to set the stone?
            </p>
            <label className="mt-2 flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="setStone"
                checked={value.setStone === 'yes'}
                onChange={() => onChange({ setStone: 'yes' })}
                className="accent-gold-500"
              />
              Yes, please set the stone
            </label>
            <label className="mt-1 flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="setStone"
                checked={value.setStone === 'no'}
                onChange={() => onChange({ setStone: 'no' })}
                className="accent-gold-500"
              />
              No, I will set it myself
            </label>
          </div>
        )}
        {value.provideStone === 'no' && (
          <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-4">
            <ReferenceImagesUploader
              value={value.uploads}
              onChange={(uploads) => onChange({ uploads })}
              label="Upload photos of the stone (Optional)"
            />
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FieldRow label="Stone Type" error={errors.type}>
          <Select field="type" value={value.type} options={STONE_TYPES} onChange={onChange} error={errors.type} />
          {value.type === 'Gemstones' && (
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
        <FieldRow label="Shape" error={errors.shape}>
          <Select field="shape" value={value.shape} options={SHAPES} onChange={onChange} error={errors.shape} />
        </FieldRow>
        <FieldRow label="Carat Weight" error={errors.carat}>
          <div className="flex gap-2">
            <input
              type="number"
              step="0.01"
              min="0"
              value={value.carat}
              onChange={(e) => onChange({ carat: e.target.value })}
              placeholder="1.00"
              className={'input-base ' + (errors.carat ? 'input-error' : '')}
            />
            <select
              value={value.caratUnit}
              onChange={(e) => onChange({ caratUnit: e.target.value })}
              className="input-base w-20 appearance-none"
            >
              <option value="ct">ct</option>
              <option value="mm">mm</option>
            </select>
          </div>
        </FieldRow>
        <FieldRow label="Color" error={errors.color}>
          <Select field="color" value={value.color} options={COLORS} onChange={onChange} error={errors.color} />
        </FieldRow>
        <FieldRow label="Clarity" error={errors.clarity} className="sm:col-span-2">
          <Select field="clarity" value={value.clarity} options={CLARITIES} onChange={onChange} error={errors.clarity} />
        </FieldRow>
        <div className="sm:col-span-3">
          <p className="label-base">Measurements</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'length', label: 'Length (mm)' },
              { id: 'width', label: 'Width (mm)' },
              { id: 'depth', label: 'Depth (mm)' },
            ].map((m) => (
              <div key={m.id}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={value[m.id]}
                  onChange={(e) => onChange({ [m.id]: e.target.value })}
                  placeholder="6.50"
                  className={'input-base ' + (errors[m.id] ? 'input-error' : '')}
                />
                <p className="mt-1 text-center text-xs text-stone-500">{m.label}</p>
              </div>
            ))}
          </div>
          {(errors.length || errors.width || errors.depth) && (
            <p className="mt-2 text-xs text-red-600">All measurements required.</p>
          )}
        </div>
      </div>
    </div>
  );
}
