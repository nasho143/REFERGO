import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { describeQuick, readQuick } from "../../utils/quickFilter";
import { describePeriod, periodFromParams } from "../../utils/period";

// Shown when a module was opened from a dashboard shortcut, so it is clear
// which records are listed and how to see everything again.
export default function QuickFilterBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const quick = readQuick(searchParams);
  const period = periodFromParams(searchParams);
  const chips = describeQuick(quick);
  if (period.mode !== "all" && period.value) {
    chips.push(describePeriod(period));
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 border border-blue-200 bg-blue-50 px-3 py-2 text-[13px]">
      <span className="font-semibold text-slate-700">Showing:</span>
      {chips.map((chip) => (
        <span
          key={chip}
          className="border border-blue-600 bg-white px-2 py-0.5 font-semibold text-blue-600"
        >
          {chip}
        </span>
      ))}
      <button
        type="button"
        onClick={() => navigate(location.pathname, { replace: true })}
        className="ml-auto font-semibold text-blue-600 underline hover:text-blue-800"
      >
        Show all records
      </button>
    </div>
  );
}
