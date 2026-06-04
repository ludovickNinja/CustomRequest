import { ShieldCheck, Headphones, Clock } from 'lucide-react';

const ITEMS = [
  {
    icon: ShieldCheck,
    label: 'Secure & Confidential',
    sub: 'Your information is safe with us.',
  },
  {
    icon: Headphones,
    label: 'Dedicated Support',
    sub: "We're here to help.",
  },
  {
    icon: Clock,
    label: 'Response within 24–48 Business Hours',
    sub: "We'll get back to you quickly.",
  },
];

export default function PageFooter() {
  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-6 md:grid-cols-3">
        {ITEMS.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-start gap-3">
            <span className="mt-0.5 text-gold-600">
              <Icon className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <div>
              <p className="text-sm font-semibold text-stone-800">{label}</p>
              <p className="text-xs text-stone-500">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </footer>
  );
}
