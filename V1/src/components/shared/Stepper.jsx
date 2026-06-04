import { Check } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Choose Collection' },
  { id: 2, label: 'Contact Information' },
  { id: 3, label: 'Design Details' },
  { id: 4, label: 'Specifications' },
  { id: 5, label: 'Review & Submit' },
];

export default function Stepper({ currentStep }) {
  return (
    <div className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex items-start justify-between gap-2">
          {STEPS.map((step, idx) => {
            const isComplete = step.id < currentStep;
            const isActive = step.id === currentStep;
            return (
              <div key={step.id} className="flex flex-1 items-start">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={
                      'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition ' +
                      (isComplete
                        ? 'border-gold-500 bg-gold-500 text-white'
                        : isActive
                        ? 'border-gold-500 bg-gold-500 text-white'
                        : 'border-stone-300 bg-white text-stone-400')
                    }
                  >
                    {isComplete ? <Check className="h-4 w-4" /> : step.id}
                  </div>
                  <span
                    className={
                      'mt-2 text-center text-xs sm:text-sm ' +
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
                {idx < STEPS.length - 1 && (
                  <div
                    className={
                      'mx-1 mt-[18px] h-px flex-1 ' +
                      (isComplete ? 'bg-gold-400' : 'bg-stone-200')
                    }
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
