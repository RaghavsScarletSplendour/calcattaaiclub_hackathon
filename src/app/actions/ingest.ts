"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { deriveReminder } from "@/lib/reminders";
import type { ExtractionResult } from "@/lib/openai";

// Matches the "<uuid>" or "<uuid>.<ext>" scheme /api/extract generates —
// rejects arbitrary client-supplied strings before they're linked in as file_url.
const FILE_PATH_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\.[a-z0-9]+)?$/i;

/** Only trust file_path if it looks like our own upload naming and the object actually exists. */
async function resolveFilePath(filePath: string | null): Promise<string | null> {
  if (!filePath || !FILE_PATH_PATTERN.test(filePath)) return null;
  const sb = createServiceClient();
  const { error } = await sb.storage.from("documents").createSignedUrl(filePath, 60);
  return error ? null : filePath;
}

export type IngestPayload = ExtractionResult & {
  person_id: string | null; // resolved by the confirm screen (person_hint match or manual pick)
  file_path: string | null; // storage object path from /api/extract, or null if upload failed
};

export async function ingestDocument(payload: IngestPayload) {
  const sb = await createClient();
  const filePath = await resolveFilePath(payload.file_path);

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
      file_url: filePath,
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
