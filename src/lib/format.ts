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

export type Urgency = "red" | "amber" | "green";

/** Calendar days from today to `due` (negative = overdue). */
export function daysUntil(due: string): number {
  return differenceInCalendarDays(parseISO(due), new Date());
}

/** PRD §7: red < 7 days, amber < 30, else green. */
export function urgency(due: string): Urgency {
  const d = daysUntil(due);
  if (d < 7) return "red";
  if (d < 30) return "amber";
  return "green";
}

export function dueLabel(due: string): string {
  const d = daysUntil(due);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return "Due today";
  if (d === 1) return "Due tomorrow";
  return `in ${d} days`;
}

/** Tailwind classes per urgency band (light + dark). */
export const URGENCY_CLASSES: Record<Urgency, string> = {
  red: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900",
  amber:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900",
  green:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900",
};
