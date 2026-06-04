/**
 * Top-of-page progress indicator used on every customer flow page.
 *
 * The caller passes `currentStep` (1-based). Earlier steps render as
 * "complete" (gold + checkmark), the current step as "active" (gold +
 * number), and later steps as "upcoming" (muted).
 *
 * Each step gets an equal-width column so the bubbles sit at 1/8, 3/8,
 * 5/8, 7/8 across the row. The connector lines are absolutely
 * positioned between adjacent bubble centers with a small gap so the
 * line stops cleanly at the bubble edge.
 */
import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Choose Collection' },
  { id: 2, label: 'Contact Information' },
  { id: 3, label: 'Design Details' },
  { id: 4, label: 'Review & Submit' },
];

export default function Stepper({ currentStep }) {
  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-5xl px-6 py-6 sm:px-12">
        <div className="flex items-start">
          {STEPS.map((step, idx) => {
            const isComplete = step.id < currentStep;
            const isActive = step.id === currentStep;
            return (
              <div
                key={step.id}
                className="relative flex flex-1 flex-col items-center"
              >
                {idx > 0 && (
                  <span
                    aria-hidden="true"
                    className={
                      'pointer-events-none absolute top-[18px] h-px left-[calc(-50%+22px)] right-[calc(50%+22px)] ' +
                      (isComplete ? 'bg-gold-400' : 'bg-stone-200')
                    }
                  />
                )}
                <div
                  className={
                    'relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition ' +
                    (isComplete || isActive
                      ? 'border-gold-500 bg-gold-500 text-white'
                      : 'border-stone-300 bg-white text-stone-400')
                  }
                >
                  {isComplete ? <Check className="h-4 w-4" /> : step.id}
                </div>
                <span
                  className={
                    'mt-2 px-1 text-center text-xs sm:text-sm ' +
                    (isActive
                      ? 'font-semibold text-gold-700'
                      : isComplete
                      ? 'font-medium text-stone-700'
                      : 'text-stone-400')
                  }
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
