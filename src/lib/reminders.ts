import { addMonths, formatISO } from "date-fns";
import type { ExtractionResult } from "@/lib/openai";
import type { Enums } from "@/lib/types";

export type DerivedReminder = {
  name: string;
  type: Enums<"reminder_type">;
  due_date: string;
  amount: number | null;
};

/** PRD §9: warranty -> purchase_date + warranty_months; insurance/puc/amc/identity -> expiry_date. */
export function deriveReminder(x: ExtractionResult): DerivedReminder | null {
  if (x.doc_type === "warranty" && x.purchase_date && x.warranty_months != null) {
    const due = addMonths(new Date(x.purchase_date), x.warranty_months);
    return { name: `${x.name} warranty expiry`, type: "warranty", due_date: formatISO(due, { representation: "date" }), amount: null };
  }
  if (["insurance", "puc", "amc", "identity"].includes(x.doc_type) && x.expiry_date) {
    return {
      name: `${x.name} ${x.doc_type} renewal`,
      type: x.doc_type as Enums<"reminder_type">,
      due_date: x.expiry_date,
      amount: x.amount,
    };
  }
  return null;
}
