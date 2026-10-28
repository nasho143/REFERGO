import { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Link } from "react-router-dom";
import { colorFor } from "../../utils/chartColors";
import { SkeletonCharts } from "./Skeleton";

// Small, specific graphs. Each module passes the datasets it needs.
// chart = { title, type: "bar" | "donut" | "line", data, series?, note?, to? }
//
// Click a bar, a slice, a legend item or a point: it floats up and the rest of
// the graph fades and blurs. Click it again, click empty space, or press
// "Clear" to go back.

const tooltipStyle = {
  border: "1px solid #b6bbcb",
  borderRadius: 2,
  boxShadow: "none",
  fontSize: 12,
  padding: "4px 8px",
};

const SHADOW = "drop-shadow(0 5px 6px rgba(20, 24, 60, 0.45))";

// Look of one part of a graph while another part is in focus.
function focusStyle(active, index, kind) {
  if (active === null) return { cursor: "pointer" };

  if (active === index) {
    return {
      cursor: "pointer",
      filter: SHADOW,
      transform:
        kind === "bar" ? "translateY(-4px) scaleX(1.08)" : "scale(1.07)",
      transformBox: kind === "bar" ? "fill-box" : "view-box",
      transformOrigin: kind === "bar" ? "center bottom" : "50% 50%",
    };
  }

  return { cursor: "pointer", opacity: 0.25, filter: "blur(1.5px)" };
}

function Empty() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-50 px-3 text-center text-[13px] text-slate-500">
      No data for this selection.
    </div>
  );
}

function BarView({ data, active, onSelect }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 6, left: -22, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d5d8e2" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 10.5 }}
          tickLine={false}
          axisLine={false}
          interval={0}
          tickFormatter={(v) =>
            String(v).length > 11 ? `${String(v).slice(0, 10)}…` : v
          }
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 10.5 }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#eef0f8" }} />
        <Bar
          dataKey="value"
          name="Total"
          maxBarSize={34}
          onClick={(_, index, event) => {
            event?.stopPropagation?.();
            onSelect(index);
          }}
        >
          {data.map((entry, i) => (
            <Cell
              key={entry.name}
              className="chart-seg"
              fill={entry.color || colorFor(entry.name, i)}
              style={focusStyle(active, i, "bar")}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DonutView({ data, active, onSelect }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="flex h-full items-center gap-3">
      <div className="h-full w-[46%] min-w-[90px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="56%"
              outerRadius="88%"
              paddingAngle={2}
              stroke="none"
              onClick={(_, index, event) => {
                event?.stopPropagation?.();
                onSelect(index);
              }}
            >
              {data.map((entry, i) => (
                <Cell
                  key={entry.name}
                  className="chart-seg"
                  fill={entry.color || colorFor(entry.name, i)}
                  style={focusStyle(active, i, "slice")}
                />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="min-w-0 flex-1 space-y-1 text-[12.5px]">
        {data.map((entry, i) => {
          const dim = active !== null && active !== i;

          return (
            <li key={entry.name}>
              <button
                type="button"
                aria-pressed={active === i}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(i);
                }}
                className={`chart-seg flex w-full items-center gap-2 px-1 py-0.5 text-left hover:bg-slate-100 ${
                  active === i ? "bg-slate-100 font-bold" : ""
                }`}
                style={dim ? { opacity: 0.35 } : undefined}
              >
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 shrink-0"
                  style={{ background: entry.color || colorFor(entry.name, i) }}
                />
                <span className="truncate text-slate-700">{entry.name}</span>
                <span className="ml-auto font-semibold text-slate-900">
                  {entry.value}
                  <span className="ml-1 font-normal text-slate-500">
                    ({total ? Math.round((entry.value / total) * 100) : 0}%)
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// active for line charts = { key, i } (which line, which point)
function LineView({
  data,
  active,
  onSelect,
  series = [{ key: "value", name: "Total", color: "#202860" }],
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#d5d8e2" />
        <XAxis dataKey="name" tick={{ fontSize: 10.5 }} tickLine={false} axisLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 10.5 }} tickLine={false} axisLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        {series.map((s) => {
          const lineDim = active && active.key !== s.key;
          const lineLift = active && active.key === s.key;

          return (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.name}
              stroke={s.color}
              strokeWidth={lineLift ? 3 : 2}
              className="chart-seg"
              isAnimationActive={false}
              activeDot={false}
              style={
                lineDim
                  ? { opacity: 0.25, filter: "blur(1.2px)" }
                  : lineLift
                  ? { filter: "drop-shadow(0 3px 4px rgba(20, 24, 60, 0.4))" }
                  : undefined
              }
              dot={(p) => {
                if (p.cx === undefined || p.cy === undefined) return null;

                const isActive =
                  active && active.key === s.key && active.i === p.index;
                const dimDot = active && !isActive;

                return (
                  <g
                    key={`${s.key}-${p.index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect({ key: s.key, i: p.index });
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <circle cx={p.cx} cy={p.cy} r={10} fill="transparent" />
                    <circle
                      className="chart-seg"
                      cx={p.cx}
                      cy={p.cy}
                      r={isActive ? 6 : 3}
                      fill={s.color}
                      stroke="#fff"
                      strokeWidth={isActive ? 2 : 1}
                      style={
                        isActive
                          ? { filter: SHADOW }
                          : dimDot
                          ? { opacity: 0.25, filter: "blur(1px)" }
                          : undefined
                      }
                    />
                  </g>
                );
              }}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}

const sameSelection = (a, b) =>
  a === b ||
  (a && b && typeof a === "object" && a.key === b.key && a.i === b.i);

export function MiniChart({ title, type = "bar", data = [], series, note, to }) {
  const isLine = type === "line";
  const [active, setActive] = useState(null);

  const clean = Array.isArray(data) ? data : [];
  const hasData = isLine ? clean.length > 0 : clean.some((d) => Number(d.value) > 0);
  const visible = isLine ? clean : clean.filter((d) => Number(d.value) > 0);

  const select = (value) =>
    setActive((previous) => (sameSelection(previous, value) ? null : value));

  const focused = active !== null && active !== undefined;

  return (
    <figure className="min-w-0 border border-slate-300 bg-white">
      <figcaption className="flex items-baseline justify-between gap-2 border-b border-slate-300 bg-slate-50 px-3 py-1.5">
        <span className="text-[13px] font-bold text-slate-800">{title}</span>

        <span className="flex items-baseline gap-3">
          {isLine && series && (
            <span className="flex gap-3 text-[11.5px] text-slate-600">
              {series.map((s) => (
                <span key={s.key} className="flex items-center gap-1">
                  <span aria-hidden="true" className="h-2 w-2" style={{ background: s.color }} />
                  {s.name}
                </span>
              ))}
            </span>
          )}

          {focused && (
            <button
              type="button"
              onClick={() => setActive(null)}
              className="text-[12px] font-semibold text-slate-600 underline hover:text-slate-900"
            >
              Clear
            </button>
          )}

          {to && (
            <Link
              to={to}
              className="text-[12px] font-semibold text-blue-600 underline hover:text-blue-800"
            >
              View
            </Link>
          )}
        </span>
      </figcaption>

      <div
        className="h-[150px] p-2"
        onClick={() => setActive(null)}
      >
        {!hasData ? (
          <Empty />
        ) : type === "donut" ? (
          <DonutView data={visible} active={active} onSelect={select} />
        ) : isLine ? (
          <LineView data={visible} series={series} active={active} onSelect={select} />
        ) : (
          <BarView data={visible} active={active} onSelect={select} />
        )}
      </div>

      {note && (
        <p className="border-t border-slate-200 px-3 py-1.5 text-[12px] text-slate-600">
          {note}
        </p>
      )}
    </figure>
  );
}

export default function MiniCharts({ charts = [], loading = false }) {
  if (loading) return <SkeletonCharts count={charts.length || 3} />;

  if (!charts.length) return null;

  return (
    <section
      aria-label="Graphs"
      className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
    >
      {charts.map((chart) => (
        <MiniChart key={chart.title} {...chart} />
      ))}
    </section>
  );
}
