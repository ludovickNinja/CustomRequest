import { Award, ShieldCheck, Truck } from 'lucide-react';

const ITEMS = [
  { icon: Award, label: 'Expert Craftsmanship', sub: 'Decades of master jewelers behind every piece.' },
  { icon: ShieldCheck, label: 'Quality Guarantee', sub: 'Every ring is inspected and certified.' },
  { icon: Truck, label: 'Free Shipping', sub: 'Complimentary insured delivery on every order.' },
];

export default function TrustFooter() {
  return (
    <div className="mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-8 border-t border-stone-200 px-6 py-10 md:grid-cols-3">
      {ITEMS.map(({ icon: Icon, label, sub }) => (
        <div key={label} className="flex items-start gap-3">
          <span className="mt-0.5 text-gold-600">
            <Icon className="h-7 w-7" strokeWidth={1.5} />
          </span>
          <div>
            <p className="text-sm font-semibold text-stone-800">{label}</p>
            <p className="text-xs text-stone-500">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
