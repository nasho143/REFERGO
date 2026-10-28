import { Link } from "react-router-dom";

const pct = (part, whole) =>
  whole > 0 ? Math.round((part / whole) * 100) : 0;

// A row of rates (percentages) with a bar, so progress reads at a glance.
// item = { label, part, whole, unit, to?, color? }
export default function KeyRates({ items = [] }) {
  return (
    <section
      aria-label="Key rates"
      className="grid grid-cols-2 gap-px border border-slate-300 bg-slate-200 lg:grid-cols-4"
    >
      {items.map((item) => {
        const value = pct(item.part, item.whole);

        const body = (
          <>
            <span className="block text-[12.5px] font-semibold text-slate-600">
              {item.label}
            </span>
            <span className="mt-0.5 block font-serif text-[28px] font-bold leading-none text-blue-600">
              {value}%
            </span>
            <span
              aria-hidden="true"
              className="mt-2 block h-1.5 bg-slate-100"
            >
              <span
                className="block h-full"
                style={{ width: `${value}%`, background: item.color || "#202860" }}
              />
            </span>
            <span className="mt-1.5 block text-[12px] text-slate-600">
              {item.part} of {item.whole} {item.unit}
            </span>
          </>
        );

        return item.to ? (
          <Link
            key={item.label}
            to={item.to}
            aria-label={`${item.label}: ${value}%. ${item.part} of ${item.whole} ${item.unit}.`}
            className="block bg-white px-4 py-3 no-underline hover:bg-blue-50"
          >
            {body}
          </Link>
        ) : (
          <div key={item.label} className="bg-white px-4 py-3">
            {body}
          </div>
        );
      })}
    </section>
  );
}
