import { parseDate } from "./period";
import { periodToParams } from "./period";

// ---------------------------------------------------------------------------
// Dashboard shortcuts open a module with a filter in the address, for example
//   /referrals?status=Hired&mode=month&date=2026-10
// These helpers build those addresses and apply the filters, so a module shows
// exactly the records the shortcut counted.
// ---------------------------------------------------------------------------

export const QUICK_KEYS = [
  "status",
  "gender",
  "ready",
  "incomplete",
  "interviewed",
  "followup",
  "interviews",
  "vstatus",
  "approval",
];

// linkTo("/referrals", { status: "Hired" }, period)
export function linkTo(path, params = {}, period = null) {
  const all = { ...params, ...(period ? periodToParams(period) : {}) };
  const qs = Object.entries(all)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&");

  return qs ? `${path}?${qs}` : path;
}

export function readQuick(searchParams) {
  const quick = {};
  QUICK_KEYS.forEach((key) => {
    const value = searchParams.get(key);
    if (value) quick[key] = value;
  });
  return quick;
}

const LABELS = {
  followup: { due: "Follow-ups due" },
  interviews: { week: "Interviews this week", today: "Interviews today" },
  vstatus: { open: "Active vacancies", expiring: "Vacancies expiring soon" },
  ready: { 1: "Ready for referral" },
  incomplete: { 1: "Incomplete profiles" },
  interviewed: { 1: "Interviewed" },
};

export function describeQuick(quick) {
  return Object.entries(quick).map(([key, value]) => {
    if (key === "status") return value.replace(",", " / ");
    if (key === "gender") return value;
    if (key === "approval") return `${value} approval`;
    return LABELS[key]?.[value] || value;
  });
}

// ---- Shared record tests ---------------------------------------------------

const TERMINAL = ["hired", "rejected", "failed", "cancelled", "expired"];

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const weekBounds = () => {
  const today = startOfDay(new Date());
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));
  const next = new Date(monday);
  next.setDate(monday.getDate() + 7);
  return [monday, next];
};

export const matchesApproval = (row, value) =>
  String(row?.approval_status || "").trim().toLowerCase() ===
  String(value).trim().toLowerCase();

export function referralMatches(r, quick) {
  if (quick.status) {
    const wanted = quick.status.split(",").map((x) => x.trim().toLowerCase());
    if (!wanted.includes(String(r.status || "").trim().toLowerCase())) return false;
  }
  if (quick.interviewed && !r.interview_date) return false;

  if (quick.followup === "due") {
    const due = parseDate(r.next_follow_up);
    const today = startOfDay(new Date());
    if (!due || startOfDay(due) > today) return false;
    if (TERMINAL.includes(String(r.status || "").trim().toLowerCase())) return false;
  }

  if (quick.interviews) {
    const d = parseDate(r.interview_date);
    if (!d) return false;
    const day = startOfDay(d);
    if (quick.interviews === "today") {
      if (day.getTime() !== startOfDay(new Date()).getTime()) return false;
    } else {
      const [from, to] = weekBounds();
      if (day < from || day >= to) return false;
    }
  }

  if (quick.approval && !matchesApproval(r, quick.approval)) return false;
  return true;
}

export function applicantMatches(a, quick) {
  if (quick.gender && a.gender !== quick.gender) return false;
  if (quick.ready && !(Number(a.job_readiness_score || 0) >= 80)) return false;
  if (quick.incomplete && !(Number(a.profile_completion_score || 0) < 100)) return false;
  if (quick.approval && !matchesApproval(a, quick.approval)) return false;
  return true;
}

// Same rules as the Job Vacancies page.
export function vacancyState(v) {
  if (v.status === "Closed") return "Closed";
  if (!v.deadline) return "Active";
  const today = startOfDay(new Date());
  const deadline = parseDate(v.deadline);
  if (!deadline) return "Active";
  const diff = (startOfDay(deadline) - today) / 86400000;
  if (diff < 0) return "Expired";
  if (diff <= 7) return "Expiring Soon";
  return "Active";
}

export function vacancyMatches(v, quick) {
  const state = vacancyState(v);
  if (quick.vstatus === "open" && !(state === "Active" || state === "Expiring Soon")) return false;
  if (quick.vstatus === "expiring" && state !== "Expiring Soon") return false;
  if (quick.status && state.toLowerCase() !== quick.status.toLowerCase()) return false;
  if (quick.approval && !matchesApproval(v, quick.approval)) return false;
  return true;
}

export function employerMatches(e, quick) {
  if (quick.approval && !matchesApproval(e, quick.approval)) return false;
  return true;
}
