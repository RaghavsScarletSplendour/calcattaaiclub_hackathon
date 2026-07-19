import { daysUntil } from "@/lib/format";
import type { Reminder } from "@/lib/types";

export type FeedItem = Reminder & { person_name: string | null; asset_name: string | null };

/** PRD §7: nearest due_date, then amount desc, then per-person weighting (owned items first). */
export function sortActionFeed(items: FeedItem[]): FeedItem[] {
  return [...items].sort((a, b) => {
    const dueDiff = daysUntil(a.due_date) - daysUntil(b.due_date);
    if (dueDiff !== 0) return dueDiff;
    const amountDiff = (b.amount ?? 0) - (a.amount ?? 0);
    if (amountDiff !== 0) return amountDiff;
    const aWeight = a.person_id ? 1 : 0;
    const bWeight = b.person_id ? 1 : 0;
    return bWeight - aWeight;
  });
}
