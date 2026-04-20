import { format, formatDistanceToNow, parseISO, differenceInDays } from "date-fns";

export const STAGES = ["Planted", "Growing", "Ready", "Harvested"];

export const CROP_TYPES = [
  "Maize", "Wheat", "Sorghum", "Beans", "Sweet Potatoes",
  "Tomatoes", "Kale", "Cassava", "Rice", "Sunflower",
  "Millet", "Barley", "Cabbage", "Onions", "Potatoes",
];

export const STAGE_PROGRESS = { Planted: 25, Growing: 55, Ready: 80, Harvested: 100 };

export const STATUS_CONFIG = {
  Active: {
    label: "Active",
    bg: "var(--success-bg)",
    color: "var(--success-text)",
    dot: "#2D5E1A",
    border: "var(--success-border)",
  },
  "At Risk": {
    label: "At Risk",
    bg: "var(--warning-bg)",
    color: "var(--warning-text)",
    dot: "#D4A94A",
    border: "var(--warning-border)",
  },
  Completed: {
    label: "Completed",
    bg: "var(--info-bg)",
    color: "var(--info-text)",
    dot: "#185FA5",
    border: "var(--info-border)",
  },
};

export const STAGE_CONFIG = {
  Planted:   { bg: "#F0EBE0", color: "#5C4A32", accent: "#5C4A32" },
  Growing:   { bg: "#EDF5E8", color: "#2D5E1A", accent: "#4A6B3A" },
  Ready:     { bg: "#FDF5E0", color: "#7A5500", accent: "#D4A94A" },
  Harvested: { bg: "#E8EFF8", color: "#1A3A6B", accent: "#185FA5" },
};

export const HEADER_COLORS = [
  "var(--sage-2)",
  "var(--terracotta)",
  "var(--amber-2)",
  "var(--earth)",
  "var(--sage-3)",
  "var(--terra-2)",
];

// ── Date formatting ────────────────────────────────────────────
export function fmtDate(dateStr) {
  if (!dateStr) return "—";
  try {
    return format(parseISO(dateStr), "d MMM yyyy");
  } catch {
    return dateStr;
  }
}

export function fmtRelative(dateStr) {
  if (!dateStr) return "—";
  try {
    return formatDistanceToNow(parseISO(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function daysSince(dateStr) {
  if (!dateStr) return 0;
  try {
    return differenceInDays(new Date(), parseISO(dateStr));
  } catch {
    return 0;
  }
}

// ── Avatar initials ────────────────────────────────────────────
export function getInitials(name = "") {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ── Error extraction from axios errors ────────────────────────
export function extractError(err) {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    err?.message ||
    "Something went wrong"
  );
}

// ── Class join helper ──────────────────────────────────────────
export function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}
