export const PALETTE = [
  "#202860",
  "#e01838",
  "#c9a800",
  "#1e6b3c",
  "#3a4789",
  "#5c6280",
  "#ee7a8b",
  "#959fcb",
];

const STATUS_COLORS = {
  pending: "#c9a800",
  approved: "#1e6b3c",
  active: "#1e6b3c",
  hired: "#1e6b3c",
  male: "#202860",
  female: "#e01838",
  rejected: "#c8142f",
  failed: "#c8142f",
  inactive: "#5c6280",
  closed: "#5c6280",
  filled: "#3a4789",
  expired: "#5c6280",
  "expiring soon": "#c9a800",
  cancelled: "#5c6280",
  "no response": "#5c6280",
  "not specified": "#b6bbcb",
  "for interview": "#3a4789",
  "interview scheduled": "#3a4789",
  "ready for referral": "#1e6b3c",
  "not yet ready": "#c9a800",
};

export function colorFor(name, index = 0) {
  return (
    STATUS_COLORS[String(name || "").trim().toLowerCase()] ||
    PALETTE[index % PALETTE.length]
  );
}

