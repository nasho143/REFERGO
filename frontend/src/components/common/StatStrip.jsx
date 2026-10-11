// A ruled summary table of figures. Used on every page that shows totals,
// so counts always look like entries in the same official register.
export default function StatStrip({ title, note, items = [] }) {
  return (
    <section className="border border-slate-400 bg-white">
      {title && (
        <div className="border-b border-slate-400 bg-slate-100 px-5 py-2.5">
          <h2 className="!text-base">{title}</h2>
          {note && <p className="text-[13px] text-slate-600">{note}</p>}
        </div>
      )}

      <dl
        className="grid grid-cols-2 sm:[grid-template-columns:repeat(var(--cols),minmax(0,1fr))]"
        style={{ "--cols": items.length }}
      >
        {items.map((item) => (
          <div key={item.label} className="px-5 py-4">
            <dt className="text-sm font-semibold text-slate-600">
              {item.label}
            </dt>
            <dd className="mt-1 font-serif text-[32px] font-bold leading-none text-blue-600">
              {Number(item.value) || 0}
              {item.suffix && (
                <span className="ml-1 text-xl">{item.suffix}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
