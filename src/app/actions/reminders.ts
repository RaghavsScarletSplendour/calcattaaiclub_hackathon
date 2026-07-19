"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markReminderDone(reminderId: string) {
  const sb = await createClient();

  const { error } = await sb.from("reminders").update({ status: "dismissed" }).eq("id", reminderId);
  if (error) throw new Error(`reminder update failed: ${error.message}`);

  revalidatePath("/");
}
