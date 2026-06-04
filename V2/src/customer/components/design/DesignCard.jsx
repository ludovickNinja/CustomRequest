import { ChevronDown, Gem, Trash2 } from 'lucide-react';
import NumberedSection from './NumberedSection.jsx';
import SkuChipInput from './SkuChipInput.jsx';
import MetalSection, { metalSummary } from './MetalSection.jsx';
import FingerSizeField from './FingerSizeField.jsx';
import CenterStoneSection from './CenterStoneSection.jsx';
import ReferenceImagesUploader from './ReferenceImagesUploader.jsx';
import NotesTextarea from '../contact/NotesTextarea.jsx';

function summarize(design) {
  const parts = [];
  parts.push(metalSummary(design.metal));
  if (design.fingerSize) parts.push(`Size ${design.fingerSize} (${design.fingerSizeSystem})`);
  if (design.includeCenterStone) {
    const cs = design.centerStone;
    if (cs.carat) {
      parts.push(`${cs.carat} ${cs.caratUnit || 'ct'} ${cs.shape} ${cs.type}`.trim());
    } else if (cs.type) {
      parts.push(`${cs.shape || ''} ${cs.type}`.trim());
    }
  }
  return parts.filter(Boolean).join(' · ');
}

export default function DesignCard({
  index,
  design,
  errors,
  projectType,
  canRemove,
  onUpdate,
  onUpdateCenterStone,
  onRemove,
  isExpanded,
  onToggle,
}) {
  const centerStoneRequired = !projectType || projectType === 'Engagement Ring';
  const summary = summarize(design);
  const skuPart = design.skus.length ? design.skus.join(', ') : 'No SKUs yet';
  const hasErrors = errors && Object.keys(errors).length > 0;

  function setIncludeCenterStone(next) {
    onUpdate({ includeCenterStone: next });
  }

  return (
    <section
      className={
        'card-panel overflow-hidden p-0 ' +
        (hasErrors ? 'ring-1 ring-red-200' : '')
      }
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        className={
          'flex w-full items-center justify-between gap-3 px-6 py-4 text-left transition ' +
          (isExpanded ? 'bg-stone-50 border-b border-stone-200' : 'bg-white hover:bg-stone-50')
        }
      >
        <span className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-semibold text-white">
            {index + 1}
          </span>
          <span>
            <span className="block text-sm font-semibold text-stone-900">Design {index + 1}</span>
            <span className="block text-xs text-stone-500">
              {skuPart}
              {summary && ` — ${summary}`}
            </span>
          </span>
        </span>
        <span className="flex items-center gap-2">
          {canRemove && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove();
                }
              }}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-stone-400 hover:bg-red-50 hover:text-red-600"
              aria-label={`Remove design ${index + 1}`}
            >
              <Trash2 className="h-4 w-4" />
            </span>
          )}
          <ChevronDown
            className={
              'h-5 w-5 shrink-0 text-stone-500 transition-transform ' +
              (isExpanded ? 'rotate-180' : '')
            }
          />
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-6 p-6">
          <NumberedSection number={1} title="SKU(s)" helper="Add one or more SKUs related to this design.">
            <SkuChipInput
              value={design.skus}
              onChange={(v) => onUpdate({ skus: v })}
              error={errors?.skus}
            />
          </NumberedSection>

          <NumberedSection number={2} title="Metal" helper="Choose the tone, karat, and color for your ring.">
            <MetalSection
              value={design.metal}
              onChange={(patch) => onUpdate({ metal: { ...design.metal, ...patch } })}
              error={errors?.metal}
            />
          </NumberedSection>

          <NumberedSection number={3} title="Finger Size" helper="Select the ring size.">
            <FingerSizeField
              system={design.fingerSizeSystem}
              size={design.fingerSize}
              onSystemChange={(v) => onUpdate({ fingerSizeSystem: v })}
              onSizeChange={(v) => onUpdate({ fingerSize: v })}
              error={errors?.fingerSize}
            />
          </NumberedSection>

          <NumberedSection number={4} title="Center Stone">
            {centerStoneRequired ? (
              <CenterStoneSection
                value={design.centerStone}
                onChange={onUpdateCenterStone}
                errors={errors?.centerStone || {}}
              />
            ) : (
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setIncludeCenterStone(!design.includeCenterStone)}
                  aria-expanded={design.includeCenterStone}
                  className={
                    'flex w-full items-center justify-between gap-3 rounded-2xl border p-4 text-left transition ' +
                    (design.includeCenterStone
                      ? 'border-gold-300 bg-gold-50/60'
                      : 'border-stone-300 bg-white hover:border-stone-400')
                  }
                >
                  <span className="flex items-center gap-3">
                    <Gem className="h-5 w-5 text-gold-700" />
                    <span>
                      <span className="block text-sm font-semibold text-stone-900">
                        Add a center stone to this design
                      </span>
                      <span className="block text-xs text-stone-500">
                        Optional for {projectType.toLowerCase()}s — open this section only if you want to specify a center stone.
                      </span>
                    </span>
                  </span>
                  <ChevronDown
                    className={
                      'h-5 w-5 shrink-0 text-stone-500 transition-transform ' +
                      (design.includeCenterStone ? 'rotate-180' : '')
                    }
                  />
                </button>
                {design.includeCenterStone && (
                  <CenterStoneSection
                    value={design.centerStone}
                    onChange={onUpdateCenterStone}
                    errors={errors?.centerStone || {}}
                  />
                )}
              </div>
            )}
          </NumberedSection>

          <NumberedSection
            number={5}
            title="Details / Additional Information"
            helper="Share any additional details about your design, inspiration, setting style, band width, engraving, etc."
          >
            <NotesTextarea
              value={design.notes}
              onChange={(v) => onUpdate({ notes: v })}
              maxLength={1000}
              rows={4}
              label=""
              eyebrowStyle={false}
              placeholder="Your notes here…"
            />
            <div className="mt-4">
              <ReferenceImagesUploader
                value={design.uploads}
                onChange={(v) => onUpdate({ uploads: v })}
              />
            </div>
          </NumberedSection>
        </div>
      )}
    </section>
  );
}
