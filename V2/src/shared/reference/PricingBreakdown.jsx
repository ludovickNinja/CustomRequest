/**
 * Pricing breakdown for one reference, shared by the customer and admin
 * design-detail pages. The numbers are filled in by the admin/factory and
 * read straight from the reference's `pricing` object.
 *
 * Visibility differs by audience:
 *   - customer — only sees pricing once the admin has *published* it.
 *   - admin    — always sees it, with a draft/published indicator.
 */

function formatMoney(amount, currency = 'USD') {
  if (amount === null || amount === undefined || amount === '') return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `$${amount}`;
  }
}

export default function PricingBreakdown({ design, audience = 'customer' }) {
  const { pricing, price, currency = 'USD', pricePublished } = design;
  const hidden = audience === 'customer' && !pricePublished;

  return (
    <section className="card-panel p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-serif text-xl text-stone-900">Pricing</h2>
        {audience === 'admin' && (
          <span
            className={
              'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
              (pricePublished ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500')
            }
          >
            {pricePublished ? 'Published' : 'Draft'}
          </span>
        )}
      </div>

      {hidden || !pricing ? (
        <p className="mt-3 rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
          {hidden
            ? 'Our team is preparing your quote. Pricing will appear here once it’s ready.'
            : 'Not yet quoted.'}
        </p>
      ) : (
        <dl className="mt-3 space-y-2 text-sm text-stone-800">
          <div>
            <dt className="inline font-semibold">Estimated Total: </dt>
            <dd className="inline">{formatMoney(price, currency)}</dd>
          </div>
          <div>
            <dt className="font-semibold">Breakdown:</dt>
            <dd className="text-stone-600">
              Gram Weight: {pricing.gramWeight} • Metal Karat: {pricing.metalKarat} • Diamond Summary:{' '}
              {pricing.diamondSummary}
            </dd>
          </div>
          <div>
            <dt className="font-semibold">Timeline:</dt>
            <dd className="text-stone-600">
              Estimate valid for {pricing.estimateValidDays} days. Delivery target: {pricing.deliveryDays} business days.
            </dd>
          </div>
        </dl>
      )}
    </section>
  );
}
