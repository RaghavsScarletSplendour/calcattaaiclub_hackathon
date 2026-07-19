import type { Database } from "@/lib/database.types";

type Public = Database["public"];

export type Tables<T extends keyof Public["Tables"]> = Public["Tables"][T]["Row"];
export type Enums<T extends keyof Public["Enums"]> = Public["Enums"][T];

export type Person = Tables<"people">;
export type Asset = Tables<"assets">;
export type Doc = Tables<"documents">;
export type PersonFact = Tables<"person_facts">;
export type Expense = Tables<"expenses">;
export type Reminder = Tables<"reminders">;
export type Contact = Tables<"contacts">;
