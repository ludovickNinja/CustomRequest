import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import NumberedSection from './NumberedSection.jsx';
import SkuChipInput from './SkuChipInput.jsx';
import MetalSection from './MetalSection.jsx';
import FingerSizeField from './FingerSizeField.jsx';
import CenterStoneSection from './CenterStoneSection.jsx';
import ReferenceImagesUploader from './ReferenceImagesUploader.jsx';
import NotesTextarea from '../page2/NotesTextarea.jsx';
import { useCustomRequest } from '../../state/CustomRequestContext.jsx';

function validate(design) {
  const e = {};
  if (!design.skus.length) e.skus = 'Add at least one SKU.';
  const m = design.metal;
  if (!m.karat) e.metal = 'Choose a karat.';
  else if (m.karat === 'Other' && !m.karatOther.trim()) e.metal = 'Please specify the karat.';
  else if (m.tone === 'two-tone' && m.colors.length !== 2) e.metal = 'Choose two colors for two-tone.';
  else if (m.tone === 'single' && m.colors.length !== 1) e.metal = 'Choose a color.';
  if (!design.fingerSize) e.fingerSize = 'Required.';

  const cs = design.centerStone;
  const csErrors = {};
  if (!cs.type) csErrors.type = 'Required.';
  else if (cs.type === 'Gemstone' && !cs.typeOther.trim()) csErrors.typeOther = 'Please specify the gemstone.';
  if (!cs.shape) csErrors.shape = 'Required.';
  if (!cs.carat || parseFloat(cs.carat) <= 0) csErrors.carat = 'Required.';
  if (!cs.color) csErrors.color = 'Required.';
  if (!cs.clarity) csErrors.clarity = 'Required.';
  if (!cs.length || parseFloat(cs.length) <= 0) csErrors.length = 'Required.';
  if (!cs.width || parseFloat(cs.width) <= 0) csErrors.width = 'Required.';
  if (!cs.depth || parseFloat(cs.depth) <= 0) csErrors.depth = 'Required.';
  if (Object.keys(csErrors).length) e.centerStone = csErrors;

  return e;
}

export default function DesignDetailsForm() {
  const { collection } = useParams();
  const navigate = useNavigate();
  const { state, setDesign, setCenterStone } = useCustomRequest();
  const design = state.design;
  const [showErrors, setShowErrors] = useState(false);

  const errors = validate(design);
  const allValid = Object.keys(errors).length === 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (!allValid) {
      setShowErrors(true);
      const firstErrorEl = document.querySelector('.input-error, [data-error="true"]');
      if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    navigate(`/design/${collection}/specifications`);
  }

  const liveErrors = showErrors ? errors : {};

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="px-1">
        <h2 className="font-serif text-4xl text-stone-900">Tell Us About Your Ring</h2>
        <p className="mt-2 text-sm text-stone-500">
          Please provide the details below so we can create an accurate quote and renderings.
        </p>
      </div>

      <NumberedSection number={1} title="SKU(s)" helper="Add one or more SKUs related to this request.">
        <SkuChipInput
          value={design.skus}
          onChange={(v) => setDesign({ skus: v })}
          error={liveErrors.skus}
        />
      </NumberedSection>

      <NumberedSection number={2} title="Metal" helper="Choose the tone, karat, and color for your ring.">
        <MetalSection
          value={design.metal}
          onChange={(patch) => setDesign({ metal: { ...design.metal, ...patch } })}
          error={liveErrors.metal}
        />
      </NumberedSection>

      <NumberedSection number={3} title="Finger Size" helper="Select the ring size.">
        <FingerSizeField
          system={design.fingerSizeSystem}
          size={design.fingerSize}
          onSystemChange={(v) => setDesign({ fingerSizeSystem: v })}
          onSizeChange={(v) => setDesign({ fingerSize: v })}
          error={liveErrors.fingerSize}
        />
      </NumberedSection>

      <NumberedSection number={4} title="Center Stone">
        <CenterStoneSection
          value={design.centerStone}
          onChange={(patch) => setCenterStone(patch)}
          errors={liveErrors.centerStone || {}}
        />
      </NumberedSection>

      <NumberedSection
        number={5}
        title="Details / Additional Information"
        helper="Share any additional details about your design, inspiration, setting style, band width, engraving, etc."
      >
        <NotesTextarea
          value={design.notes}
          onChange={(v) => setDesign({ notes: v })}
          maxLength={1000}
          rows={4}
          label=""
          eyebrowStyle={false}
          placeholder="Your notes here…"
        />
        <div className="mt-4">
          <ReferenceImagesUploader
            value={design.uploads}
            onChange={(v) => setDesign({ uploads: v })}
          />
        </div>
      </NumberedSection>

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => navigate(`/design/${collection}`)}
          className="inline-flex items-center gap-2 rounded-full bg-stone-100 px-6 py-3 text-sm font-medium text-stone-700 hover:bg-stone-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-2 rounded-full bg-neutral-900 px-7 py-3 text-sm font-medium text-gold-100 hover:bg-neutral-800"
        >
          Continue to Specifications
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
