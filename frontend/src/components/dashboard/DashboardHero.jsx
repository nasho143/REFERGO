import PeriodFilter from "../common/PeriodFilter";
import { describePeriod } from "../../utils/period";

// Period filter only. No welcome message and no page title.
export default function DashboardHero({ period, setPeriod }) {
  return (
    <section className="flex flex-wrap items-center justify-between gap-3 border border-slate-300 bg-white px-4 py-2.5">
      <p className="text-[13px] text-slate-600">
        Showing: <strong className="text-slate-800">{describePeriod(period)}</strong>
      </p>

      <PeriodFilter value={period} onChange={setPeriod} />
    </section>
  );
}
