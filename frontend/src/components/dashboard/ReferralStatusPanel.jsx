import { Link } from "react-router-dom";
import { colorFor } from "../../utils/chartColors";
import { linkTo } from "../../utils/quickFilter";

// Referral status at a glance. Every tile opens the Referrals page
// already filtered to that status.
export default function ReferralStatusPanel({ status = [], total = 0, period = null }) {
  const rows = status
    .map((s) => ({ name: s.status || "Unknown", total: Number(s.total) || 0 }))
    .filter((s) => s.total > 0);

  return (
    <section
      aria-labelledby="status-title"
      className="border border-slate-300 bg-white"
    >
      <div className="flex items-baseline justify-between border-b border-slate-300 bg-slate-50 px-4 py-2">
        <h2 id="status-title" className="!text-[15px]">
          Referral status
        </h2>
        <Link
          to={linkTo("/referrals", {}, period)}
          className="text-[12.5px] font-semibold text-blue-600 underline hover:text-blue-800"
        >
          View all
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="px-4 py-5 text-sm text-slate-500">
          No referrals in this selection.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-px bg-slate-200 sm:grid-cols-3 lg:grid-cols-6">
          {rows.map((row, i) => {
            const share = total > 0 ? Math.round((row.total / total) * 100) : 0;
            const color = colorFor(row.name, i);

            return (
              <li key={row.name} className="bg-white">
                <Link
                  to={linkTo("/referrals", { status: row.name }, period)}
                  aria-label={`${row.name}: ${row.total} referrals. Open filtered list.`}
                  className="block px-3 py-2.5 no-underline hover:bg-blue-50"
                >
                  <span className="block text-[12.5px] font-semibold text-slate-600">
                    {row.name}
                  </span>
                  <span className="mt-0.5 flex items-baseline gap-1.5">
                    <span className="font-serif text-2xl font-bold text-blue-600">
                      {row.total}
                    </span>
                    <span className="text-[12px] text-slate-500">{share}%</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-1.5 block h-1.5 bg-slate-100"
                  >
                    <span
                      className="block h-full"
                      style={{ width: `${share}%`, background: color }}
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
