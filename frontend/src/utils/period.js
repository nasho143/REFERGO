// Shared date-range helpers used by the period filter in every module.
// A period is { mode: "all" | "day" | "week" | "month", value: string }.
//   day   -> value "YYYY-MM-DD"
//   week  -> value "YYYY-Www" (HTML <input type="week"> format)
//   month -> value "YYYY-MM"

export const DEFAULT_PERIOD = { mode: "all", value: "" };

const pad = (n) => String(n).padStart(2, "0");

// Monday of the given ISO week, at local midnight.
function isoWeekStart(year, week) {
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7;
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Returns [start, end) as Date objects, or null when no filter is active.
export function getPeriodRange({ mode, value }) {
  if (!mode || mode === "all" || !value) return null;

  if (mode === "day") {
    const [y, m, d] = value.split("-").map(Number);
    if (!y || !m || !d) return null;
    const start = new Date(y, m - 1, d);
    const end = new Date(y, m - 1, d + 1);
    return [start, end];
  }

  if (mode === "week") {
    const match = /^(\d{4})-W(\d{2})$/.exec(value);
    if (!match) return null;
    const start = isoWeekStart(Number(match[1]), Number(match[2]));
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return [start, end];
  }

  if (mode === "month") {
    const [y, m] = value.split("-").map(Number);
    if (!y || !m) return null;
    return [new Date(y, m - 1, 1), new Date(y, m, 1)];
  }

  return null;
}

export function parseDate(raw) {
  if (!raw) return null;
  const text = String(raw);
  // Plain dates ("2026-10-17") are read as local days, not UTC.
  const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text.substring(0, 10));
  if (plain && text.length <= 10) {
    return new Date(Number(plain[1]), Number(plain[2]) - 1, Number(plain[3]));
  }
  const d = new Date(text);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function matchesPeriod(raw, period) {
  const range = getPeriodRange(period);
  if (!range) return true;
  const d = parseDate(raw);
  if (!d) return false;
  return d >= range[0] && d < range[1];
}

export function filterByPeriod(rows, period, ...dateKeys) {
  if (!Array.isArray(rows)) return [];
  if (!getPeriodRange(period)) return rows;
  const keys = dateKeys.length ? dateKeys : ["created_at"];
  return rows.filter((row) => {
    // The first date the record actually has decides where it belongs.
    const key = keys.find((k) => row?.[k]);
    return key ? matchesPeriod(row[key], period) : false;
  });
}

export function todayValue(mode) {
  const now = new Date();
  if (mode === "day") {
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }
  if (mode === "month") {
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  }
  if (mode === "week") {
    return weekValueOf(todayValue("day"));
  }
  return "";
}

// "2026-10-17" -> "2026-W42" (ISO week that contains that day).
export function weekValueOf(dayValue) {
  const d = parseDate(dayValue);
  if (!d) return "";
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = t.getDay() || 7;
  t.setDate(t.getDate() + 4 - day);
  const yearStart = new Date(t.getFullYear(), 0, 1);
  const week = Math.ceil(((t - yearStart) / 86400000 + 1) / 7);
  return `${t.getFullYear()}-W${pad(week)}`;
}

export function describePeriod({ mode, value }) {
  const range = getPeriodRange({ mode, value });
  if (!range) return "All time";
  const fmt = (d, opts) => d.toLocaleDateString("en-PH", opts);
  if (mode === "day") {
    return fmt(range[0], { month: "long", day: "numeric", year: "numeric" });
  }
  if (mode === "month") {
    return fmt(range[0], { month: "long", year: "numeric" });
  }
  const last = new Date(range[1]);
  last.setDate(last.getDate() - 1);
  return `${fmt(range[0], { month: "short", day: "numeric" })} – ${fmt(last, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })}`;
}

// ---- Applicant age helpers -------------------------------------------------

export function calcAge(birthdate) {
  const b = parseDate(birthdate);
  if (!b) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const beforeBirthday =
    now.getMonth() < b.getMonth() ||
    (now.getMonth() === b.getMonth() && now.getDate() < b.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 && age < 120 ? age : null;
}

export const AGE_GROUPS = [
  { label: "18 & below", min: 0, max: 18 },
  { label: "19–24", min: 19, max: 24 },
  { label: "25–34", min: 25, max: 34 },
  { label: "35–44", min: 35, max: 44 },
  { label: "45 & above", min: 45, max: 200 },
];

export function ageGroupOf(age) {
  if (age === null || age === undefined) return null;
  return AGE_GROUPS.find((g) => age >= g.min && age <= g.max)?.label || null;
}

// ---- Period <-> URL (dashboard shortcuts carry the period they were showing) ----

const pad2 = (n) => String(n).padStart(2, "0");

export function periodFromParams(searchParams) {
  const mode = searchParams.get("mode");
  const date = searchParams.get("date");

  if (!["day", "week", "month"].includes(mode) || !date) return DEFAULT_PERIOD;

  const range = getPeriodRange({ mode, value: date });
  if (!range) return DEFAULT_PERIOD;

  const start = range[0];
  const picked = `${start.getFullYear()}-${pad2(start.getMonth() + 1)}-${pad2(start.getDate())}`;

  return { mode, value: date, picked };
}

export function periodToParams(period) {
  return period && period.mode !== "all" && period.value
    ? { mode: period.mode, date: period.value }
    : {};
}
