import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatINR } from "@/lib/format";
import {
  PersonProfile,
  type IdentityDocItem,
  type InsuranceItem,
  type PersonReminderItem,
} from "@/components/person/person-profile";
import type { Doc } from "@/lib/types";

export default async function PersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();

  const { data: person } = await sb.from("people").select("*").eq("id", id).maybeSingle();
  if (!person) notFound();

  const [{ data: facts }, { data: identityDocRows }, { data: reminderRows }, { data: assets }] =
    await Promise.all([
      sb.from("person_facts").select("*").eq("person_id", id),
      sb.from("documents").select("*").eq("owner_id", id).eq("doc_type", "identity"),
      sb
        .from("reminders")
        .select("*")
        .eq("person_id", id)
        .eq("status", "upcoming")
        .order("due_date", { ascending: true }),
      sb.from("assets").select("id, name"),
    ]);

  // Insurance facts point at a document (policy) for the renewal/amount meta.
  const insuranceFacts = (facts ?? []).filter((f) => f.kind === "insurance");
  const insuranceDocIds = insuranceFacts
    .map((f) => f.document_id)
    .filter((docId): docId is string => Boolean(docId));

  const { data: insuranceDocRows } =
    insuranceDocIds.length > 0
      ? await sb.from("documents").select("*").in("id", insuranceDocIds)
      : { data: [] as Doc[] };
  const insuranceDocMap = new Map((insuranceDocRows ?? []).map((d) => [d.id, d]));

  const bloodGroup = (facts ?? []).find((f) => f.kind === "blood_group")?.value ?? null;
  const allergies = (facts ?? [])
    .filter((f) => f.kind === "allergy")
    .map((f) => f.value)
    .filter((v): v is string => Boolean(v));

  const insurance: InsuranceItem[] = insuranceFacts.map((f) => {
    const doc = f.document_id ? insuranceDocMap.get(f.document_id) : undefined;
    const metaParts: string[] = [];
    if (doc?.expiry_date) metaParts.push(`Expires ${formatDate(doc.expiry_date)}`);
    if (doc?.amount != null) metaParts.push(formatINR(doc.amount));
    return {
      id: f.id,
      label: f.value ?? "Insurance policy",
      meta: metaParts.length > 0 ? metaParts.join(" · ") : "No document on file",
    };
  });

  const identityDocs: IdentityDocItem[] = (identityDocRows ?? []).map((d) => ({
    id: d.id,
    label: identityDocLabel(d),
    meta: identityDocMeta(d),
    fileUrl: d.file_url,
  }));

  const assetMap = new Map((assets ?? []).map((a) => [a.id, a.name]));
  const reminders: PersonReminderItem[] = (reminderRows ?? []).map((r) => ({
    ...r,
    asset_name: r.asset_id ? (assetMap.get(r.asset_id) ?? null) : null,
  }));

  return (
    <PersonProfile
      data={{
        person,
        bloodGroup,
        allergies,
        insurance,
        identityDocs,
        reminders,
      }}
    />
  );
}

function identityDocLabel(doc: Doc): string {
  const extracted = doc.extracted_json;
  if (extracted && typeof extracted === "object" && !Array.isArray(extracted)) {
    const record = extracted as Record<string, unknown>;
    const name = record.name ?? record.document_name ?? record.type;
    if (typeof name === "string" && name.trim().length > 0) return name;
  }
  return `${doc.doc_type.charAt(0).toUpperCase()}${doc.doc_type.slice(1)} document`;
}

function identityDocMeta(doc: Doc): string {
  if (doc.expiry_date) return `Expires ${formatDate(doc.expiry_date)}`;
  if (doc.issue_date) return `Issued ${formatDate(doc.issue_date)}`;
  return "On file";
}
