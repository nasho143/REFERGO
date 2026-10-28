import { filterByPeriod, calcAge, ageGroupOf, AGE_GROUPS } from "./period";

const lower = (v) => String(v || "").trim().toLowerCase();

const monthKey = (raw) => {
  const text = String(raw || "");
  const d = new Date(text);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

function topBy(rows, getName, limit) {
  const map = new Map();

  rows.forEach((row) => {
    const name = String(getName(row) || "").trim() || "Unknown";
    const entry = map.get(name) || { name, total_referrals: 0, hired: 0 };
    entry.total_referrals += 1;
    if (lower(row.status) === "hired") entry.hired += 1;
    map.set(name, entry);
  });

  return [...map.values()]
    .sort((a, b) => b.total_referrals - a.total_referrals || a.name.localeCompare(b.name))
    .slice(0, limit);
}

// Builds every number, graph and table in the report from the raw records,
// so the screen, the PDF, and the Excel file always agree with each other.
export function buildReport(raw = {}, period) {
  const applicantData = filterByPeriod(raw.applicantData, period, "date_added");
  const employerData = filterByPeriod(raw.employerData, period, "date_added");
  const vacancyData = filterByPeriod(raw.vacancyData, period, "date_added");
  const referralData = filterByPeriod(raw.referralData, period, "date_referred");

  const referrals = referralData.length;
  const count = (name) => referralData.filter((r) => lower(r.status) === name).length;

  const hired = count("hired");
  const rejected = count("rejected") + count("failed");
  const pending = count("pending");
  const interviewed = referralData.filter((r) => r.interview_date).length;

  // Referral status
  const statusMap = new Map();
  referralData.forEach((r) => {
    const key = String(r.status || "").trim() || "Unknown";
    statusMap.set(key, (statusMap.get(key) || 0) + 1);
  });
  const status = [...statusMap.entries()]
    .map(([name, total]) => ({ status: name, total }))
    .sort((a, b) => b.total - a.total);

  // Monthly
  const monthly = new Map();
  referralData.forEach((r) => {
    const key = monthKey(r.date_referred);
    if (!key) return;
    const m = monthly.get(key) || {
      month: key,
      total_referred: 0,
      interviewed: 0,
      hired: 0,
      rejected: 0,
      pending: 0,
    };
    m.total_referred += 1;
    if (r.interview_date) m.interviewed += 1;
    const st = lower(r.status);
    if (st === "hired") m.hired += 1;
    if (st === "rejected" || st === "failed") m.rejected += 1;
    if (st === "pending") m.pending += 1;
    monthly.set(key, m);
  });
  const monthlyData = [...monthly.values()].sort((a, b) =>
    a.month.localeCompare(b.month)
  );

  // Applicant demographics
  const genderMap = new Map();
  applicantData.forEach((a) => {
    const key = a.gender || "Not specified";
    genderMap.set(key, (genderMap.get(key) || 0) + 1);
  });
  const gender = [...genderMap.entries()].map(([name, value]) => ({ name, value }));

  const ageGroups = [
    ...AGE_GROUPS.map((g) => ({
      name: g.label,
      value: applicantData.filter((a) => ageGroupOf(calcAge(a.birthdate)) === g.label).length,
    })),
    {
      name: "Not specified",
      value: applicantData.filter((a) => calcAge(a.birthdate) === null).length,
    },
  ];

  const activeVacancies = vacancyData.filter(
    (v) => lower(v.status) === "active"
  ).length;

  return {
    applicants: applicantData.length,
    employers: employerData.length,
    vacancies: vacancyData.length,
    activeVacancies,
    referrals,
    interviewed,
    hired,
    rejected,
    pending,
    placementRate: referrals > 0 ? Number(((hired / referrals) * 100).toFixed(2)) : 0,

    status,
    monthlyData,
    topPositions: topBy(referralData, (r) => r.position_title, 10).map((x) => ({
      position_title: x.name,
      total_referrals: x.total_referrals,
      hired: x.hired,
    })),
    topEmployers: topBy(referralData, (r) => r.company_name, 10).map((x) => ({
      company_name: x.name,
      total_referrals: x.total_referrals,
      hired: x.hired,
    })),
    gender,
    ageGroups,

    applicantData,
    employerData,
    vacancyData,
    referralData,
  };
}

const pctOf = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

// Short written findings, used on the Reports page and in the exports.
export function buildFindings(report, periodLabel) {
  const scope = periodLabel === "All dates" ? "overall" : `for ${periodLabel}`;
  const out = [];

  if (report.referrals === 0) {
    out.push(`No referrals were recorded ${scope}.`);
  } else {
    out.push(
      `${report.referrals} referral${report.referrals === 1 ? "" : "s"} ${scope}: ${report.hired} hired (${report.placementRate}% placement rate), ${report.pending} pending and ${report.rejected} rejected.`
    );
    out.push(
      `${report.interviewed} of ${report.referrals} referrals (${pctOf(report.interviewed, report.referrals)}%) have an interview date on record.`
    );
  }

  const bestPosition = report.topPositions[0];
  const bestEmployer = report.topEmployers[0];
  if (bestPosition && bestEmployer) {
    out.push(
      `Most referred position: ${bestPosition.position_title} (${bestPosition.total_referrals}). Most referrals went to ${bestEmployer.company_name} (${bestEmployer.total_referrals}).`
    );
  }

  const months = report.monthlyData;
  if (months.length >= 2) {
    const a = months[months.length - 2];
    const b = months[months.length - 1];
    const diff = b.total_referred - a.total_referred;
    out.push(
      diff === 0
        ? `Referral volume was unchanged between ${a.month} and ${b.month} (${b.total_referred}).`
        : `Referrals ${diff > 0 ? "rose" : "fell"} from ${a.total_referred} in ${a.month} to ${b.total_referred} in ${b.month}.`
    );
  }

  if (report.applicants > 0) {
    const known = report.gender.filter((g) => g.name !== "Not specified");
    const knownTotal = known.reduce((s, g) => s + g.value, 0);
    const topG = [...known].sort((x, y) => y.value - x.value)[0];
    const topA = [...report.ageGroups]
      .filter((g) => g.name !== "Not specified")
      .sort((x, y) => y.value - x.value)[0];
    const parts = [];
    if (topG && knownTotal > 0) {
      parts.push(`${topG.name} applicants lead (${pctOf(topG.value, knownTotal)}% of those with gender recorded)`);
    }
    if (topA && topA.value > 0) parts.push(`the largest age group is ${topA.name} (${topA.value})`);
    if (parts.length) out.push(`Of ${report.applicants} applicants, ${parts.join("; ")}.`);
  }

  return out;
}
