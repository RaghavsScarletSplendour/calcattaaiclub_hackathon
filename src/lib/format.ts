import { differenceInCalendarDays, parseISO, format } from "date-fns";

/** ₹ with Indian digit grouping. */
export function formatINR(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return "₹" + new Intl.NumberFormat("en-IN").format(amount);
}

/** DD/MM/YYYY. */
export function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return format(parseISO(d), "dd/MM/yyyy");
}

export type Urgency = "red" | "amber" | "neutral";

/** Calendar days from today to `due` (negative = overdue). */
export function daysUntil(due: string): number {
  return differenceInCalendarDays(parseISO(due), new Date());
}

/** Matches the approved design's decorate(): red < 7 days, amber < 30, else neutral. */
export function urgency(due: string): Urgency {
  const d = daysUntil(due);
  if (d < 7) return "red";
  if (d < 30) return "amber";
  return "neutral";
}

export function dueLabel(due: string): string {
  const d = daysUntil(due);
  if (d < 0) return "Overdue";
  if (d === 0) return "Due today";
  return `${d} day${d === 1 ? "" : "s"}`;
}

/** Small status-dot color per urgency band. */
export const URGENCY_DOT: Record<Urgency, string> = {
  red: "#ff3b30",
  amber: "#ff9500",
  neutral: "#c7c7cc",
};

/** Days-remaining text color per urgency band. */
export const URGENCY_TEXT: Record<Urgency, string> = {
  red: "#ff3b30",
  amber: "#ff9500",
  neutral: "#6e6e73",
};
