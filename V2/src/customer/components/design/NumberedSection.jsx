export default function NumberedSection({ number, title, helper, required, children }) {
  return (
    <section className="card-panel p-6 md:p-8">
      <header className="flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-semibold text-white">
          {number}
        </span>
        <div>
          <h2 className="font-serif text-xl text-stone-900">
            {title}
            {required && <span className="text-gold-700"> *</span>}
          </h2>
          {helper && <p className="mt-1 text-xs text-stone-500">{helper}</p>}
        </div>
      </header>
      <div className="mt-5">{children}</div>
    </section>
  );
}
