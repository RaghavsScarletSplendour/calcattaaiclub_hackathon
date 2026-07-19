"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deriveReminder } from "@/lib/reminders";
import type { ExtractionResult } from "@/lib/openai";

export type IngestPayload = ExtractionResult & {
  person_id: string | null; // resolved by the confirm screen (person_hint match or manual pick)
};

export async function ingestDocument(payload: IngestPayload) {
  const sb = await createClient();

  // 1. asset (only when extraction identified a physical asset)
  let assetId: string | null = null;
  if (payload.entity === "asset" && payload.type) {
    const { data: asset, error: assetErr } = await sb
      .from("assets")
      .insert({
        type: payload.type,
        name: payload.name,
        brand: payload.brand,
        model: payload.model,
        serial_or_rc: payload.serial_or_rc,
        purchase_date: payload.purchase_date,
        price: payload.price,
        dealer: payload.dealer,
        owner_id: payload.person_id,
      })
      .select()
      .single();
    if (assetErr) throw new Error(`asset insert failed: ${assetErr.message}`);
    assetId = asset.id;
  }

  // 2. document
  const { data: doc, error: docErr } = await sb
    .from("documents")
    .insert({
      asset_id: assetId,
      owner_id: payload.person_id,
      doc_type: payload.doc_type,
      issue_date: payload.purchase_date,
      expiry_date: payload.expiry_date,
      amount: payload.amount,
      extracted_json: payload as unknown as Record<string, unknown>,
    })
    .select()
    .single();
  if (docErr) throw new Error(`document insert failed: ${docErr.message}`);

  // 3. derived reminder (must reference asset/person/document per the CHECK constraint)
  const derived = deriveReminder(payload);
  if (derived) {
    const { error: remErr } = await sb.from("reminders").insert({
      asset_id: assetId,
      person_id: payload.person_id,
      document_id: doc.id,
      name: derived.name,
      type: derived.type,
      due_date: derived.due_date,
      amount: derived.amount,
    });
    if (remErr) throw new Error(`reminder insert failed: ${remErr.message}`);
  }

  revalidatePath("/");
  return { assetId, documentId: doc.id };
}
