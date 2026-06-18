/**
 * Top-level form for step 3 (Design Details).
 *
 * The customer can build several rings in a single submission. This
 * component owns the list of designs — each rendered as a collapsible
 * `DesignCard` — and the "Add Another Design" button at the bottom.
 *
 * Validation happens on submit (Continue to Review). Each design is
 * validated independently; we don't let the customer add a new design
 * while any existing one still has errors, otherwise the page fills
 * with half-finished cards.
 */
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import DesignCard from './DesignCard.jsx';
import { colorsNeeded } from './MetalSection.jsx';
import { useCustomRequest } from '../../../state/CustomRequestContext.jsx';

/**
 * Validate one design. Returns an object of error messages keyed by
 * field; empty when the design is good to go.
 *
 * Project type drives whether the center stone block is required: for
 * Engagement Ring (or when no project type is set) it's always required.
 * For everything else it's only required when the user opted in via
 * the per-design `includeCenterStone` toggle.
 */
function validateDesign(design, projectType) {
  const centerStoneRequired = !projectType || projectType === 'Engagement Ring';
  const includeCenterStone = centerStoneRequired || design.includeCenterStone;
  const e = {};
  if (!design.skus.length) e.skus = 'Add at least one SKU.';
  const m = design.metal;
  const needed = colorsNeeded(m);
  if (!m.karat) e.metal = 'Choose a karat.';
  else if (m.karat === 'Other' && !m.karatOther.trim()) e.metal = 'Please specify the karat.';
  else if (m.colors.length !== needed) {
    e.metal = needed === 2
      ? 'Choose two colors for two-tone.'
      : m.tone === 'two-tone'
      ? 'Choose the gold color.'
      : 'Choose a color.';
  }

  if (includeCenterStone) {
    const cs = design.centerStone;
    const csErrors = {};
    if (!cs.type) csErrors.type = 'Required.';
    else if (cs.type === 'Gemstone' && !cs.typeOther.trim()) csErrors.typeOther = 'Please specify the gemstone.';
    if (!cs.shape) csErrors.shape = 'Required.';
    else if (cs.shape === 'Other' && !cs.shapeOther.trim()) csErrors.shapeOther = 'Please specify the shape.';
    if (!cs.carat || parseFloat(cs.carat) <= 0) csErrors.carat = 'Required.';
    if (!cs.color) csErrors.color = 'Required.';
    if (!cs.clarity) csErrors.clarity = 'Required.';
    if (Object.keys(csErrors).length) e.centerStone = csErrors;
  }

  return e;
}

export default function DesignDetailsForm() {
  const { collection } = useParams();
  const navigate = useNavigate();
  const {
    state,
    updateDesign,
    updateCenterStone,
    addDesign,
    removeDesign,
  } = useCustomRequest();
  const designs = state.designs;
  const projectType = state.contact.projectType;
  const centerStoneRequired = !projectType || projectType === 'Engagement Ring';
  const [showErrors, setShowErrors] = useState(false);
  // One boolean per design tracking whether its card is expanded. We
  // start with the most recent design open, the rest collapsed — that
  // matches the usual "I'm working on the new one" mental model.
  const [expanded, setExpanded] = useState(() => designs.map((_, i) => i === designs.length - 1));

  // Keep `expanded` in sync if designs are added/removed externally
  // (e.g. by navigating back to this page after a refresh). When new
  // designs appear we expand only the new ones; when designs are
  // removed we just truncate.
  useEffect(() => {
    setExpanded((prev) => {
      if (prev.length === designs.length) return prev;
      if (prev.length < designs.length) {
        return [
          ...prev.map(() => false),
          ...Array(designs.length - prev.length).fill(true),
        ];
      }
      return prev.slice(0, designs.length);
    });
  }, [designs.length]);

  const errorsPerDesign = designs.map((d) => validateDesign(d, projectType));
  const allValid = errorsPerDesign.every((e) => Object.keys(e).length === 0);

  function handleSubmit(e) {
    e.preventDefault();
    if (!allValid) {
      setShowErrors(true);
      // Expand the first design with errors so the user can see them.
      const firstBad = errorsPerDesign.findIndex((err) => Object.keys(err).length > 0);
      if (firstBad >= 0) {
        setExpanded((prev) => prev.map((_, i) => i === firstBad));
      }
      requestAnimationFrame(() => {
        const firstErrorEl = document.querySelector('.input-error, [data-error="true"]');
        if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }
    navigate(`/design/${collection}/review`);
  }

  function handleAddDesign() {
    if (!allValid) {
      setShowErrors(true);
      const firstBad = errorsPerDesign.findIndex((err) => Object.keys(err).length > 0);
      if (firstBad >= 0) {
        setExpanded((prev) => prev.map((_, i) => i === firstBad));
      }
      requestAnimationFrame(() => {
        const firstErrorEl = document.querySelector('.input-error, [data-error="true"]');
        if (firstErrorEl) firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }
    addDesign();
    // The new design becomes the last; collapse others, expand new.
    setExpanded(designs.map(() => false).concat([true]));
    requestAnimationFrame(() => {
      const cards = document.querySelectorAll('[data-design-card]');
      cards[cards.length - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function toggleExpanded(i) {
    setExpanded((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="px-1">
        <h2 className="font-serif text-4xl text-stone-900">
          {designs.length > 1 ? 'Tell Us About Your Rings' : 'Tell Us About Your Ring'}
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          Please provide the details below so we can create an accurate quote and renderings.
          {designs.length === 1
            ? ' You can add additional designs at the bottom of this page.'
            : ` ${designs.length} designs in this request.`}
        </p>
      </div>

      <div className="space-y-4">
        {designs.map((design, i) => (
          <div key={i} data-design-card>
            <DesignCard
              index={i}
              design={design}
              errors={showErrors ? errorsPerDesign[i] : undefined}
              projectType={projectType}
              canRemove={designs.length > 1}
              onUpdate={(patch) => updateDesign(i, patch)}
              onUpdateCenterStone={(patch) => updateCenterStone(i, patch)}
              onRemove={() => removeDesign(i)}
              isExpanded={expanded[i] ?? false}
              onToggle={() => toggleExpanded(i)}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddDesign}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-300 bg-white px-6 py-4 text-sm font-medium text-stone-600 transition hover:border-gold-400 hover:text-gold-700"
      >
        <Plus className="h-4 w-4" />
        Add Another Design
      </button>

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
          Continue to Review
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
