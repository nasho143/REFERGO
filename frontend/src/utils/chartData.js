import { parseDate } from "./period";

// [{ name, value }] sorted by value, from any list of rows.
export function countBy(rows, getKey, { order, fallback = "Not specified" } = {}) {
  const map = new Map();

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const raw = getKey(row);
    const key = raw === null || raw === undefined || String(raw).trim() === ""
      ? fallback
      : String(raw).trim();
    map.set(key, (map.get(key) || 0) + 1);
  });

  const list = [...map.entries()].map(([name, value]) => ({ name, value }));

  if (order) {
    return list.sort(
      (a, b) =>
        (order.indexOf(a.name) === -1 ? 99 : order.indexOf(a.name)) -
        (order.indexOf(b.name) === -1 ? 99 : order.indexOf(b.name))
    );
  }

  return list.sort((a, b) => b.value - a.value);
}

// Counts per day when a day/week/month is selected, otherwise per month
// (last six months that have data).
export function countOverTime(rows, getDate, periodMode) {
  const perDay = periodMode && periodMode !== "all";
  const map = new Map();

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const d = parseDate(getDate(row));
    if (!d) return;
    const key = perDay
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
      : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    map.set(key, (map.get(key) || 0) + 1);
  });

  const keys = [...map.keys()].sort();
  const limited = perDay ? keys : keys.slice(-6);

  return limited.map((key) => ({
    name: labelForKey(key),
    value: map.get(key),
  }));
}

export function labelForKey(key) {
  const parts = String(key).split("-");
  if (parts.length === 3) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      .toLocaleDateString("en-PH", { month: "short", day: "numeric" });
  }
  if (parts.length === 2) {
    return new Date(Number(parts[0]), Number(parts[1]) - 1, 1)
      .toLocaleDateString("en-PH", { month: "short", year: "2-digit" });
  }
  return key;
}
