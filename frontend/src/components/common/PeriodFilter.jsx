import {
  DEFAULT_PERIOD,
  describePeriod,
  todayValue,
  weekValueOf,
} from "../../utils/period";

const controlClass =
  "h-10 border border-slate-400 bg-white px-2.5 text-sm text-slate-900";

// Filter by day, week, or month. Used in every module and on the dashboard.
// `value` is { mode, value, picked } and is owned by the page.
export default function PeriodFilter({ value = DEFAULT_PERIOD, onChange }) {
  const mode = value.mode || "all";

  const handleMode = (nextMode) => {
    if (nextMode === "all") {
      onChange({ mode: "all", value: "", picked: "" });
      return;
    }

    const picked = todayValue("day");

    onChange({
      mode: nextMode,
      picked,
      value:
        nextMode === "day"
          ? picked
          : nextMode === "month"
          ? todayValue("month")
          : weekValueOf(picked),
    });
  };

  const handlePick = (raw) => {
    if (!raw) {
      onChange({ ...value, picked: "", value: "" });
      return;
    }

    if (mode === "week") {
      onChange({ mode, picked: raw, value: weekValueOf(raw) });
      return;
    }

    onChange({ mode, picked: raw, value: raw });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <label className="sr-only" htmlFor="period-mode">
        Filter by
      </label>
      <select
        id="period-mode"
        value={mode}
        onChange={(e) => handleMode(e.target.value)}
        className={controlClass}
      >
        <option value="all">All dates</option>
        <option value="day">By day</option>
        <option value="week">By week</option>
        <option value="month">By month</option>
      </select>

      {mode === "day" && (
        <input
          type="date"
          aria-label="Day"
          value={value.value || ""}
          onChange={(e) => handlePick(e.target.value)}
          className={controlClass}
        />
      )}

      {mode === "week" && (
        <>
          <input
            type="date"
            aria-label="Any day in the week"
            value={value.picked || ""}
            onChange={(e) => handlePick(e.target.value)}
            className={controlClass}
          />
          <span className="text-[13px] text-slate-600">
            {describePeriod(value)}
          </span>
        </>
      )}

      {mode === "month" && (
        <input
          type="month"
          aria-label="Month"
          value={value.value || ""}
          onChange={(e) => handlePick(e.target.value)}
          className={controlClass}
        />
      )}
    </div>
  );
}
