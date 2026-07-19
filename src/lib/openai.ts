import OpenAI from "openai";

const client = new OpenAI();

// PRD §9 extraction contract — hand-written strict json_schema (no Zod: see plan B5).
const EXTRACTION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  properties: {
    entity: { type: "string", enum: ["asset", "document_only"] },
    type: { type: ["string", "null"], enum: ["appliance", "vehicle", null] },
    doc_type: {
      type: "string",
      enum: ["invoice", "warranty", "amc", "insurance", "rc", "puc", "identity", "property", "other"],
    },
    name: { type: "string" },
    brand: { type: ["string", "null"] },
    model: { type: ["string", "null"] },
    serial_or_rc: { type: ["string", "null"] },
    purchase_date: { type: ["string", "null"], description: "YYYY-MM-DD or null" },
    price: { type: ["number", "null"] },
    dealer: { type: ["string", "null"] },
    warranty_months: { type: ["number", "null"] },
    expiry_date: { type: ["string", "null"], description: "YYYY-MM-DD or null" },
    amount: { type: ["number", "null"] },
    person_hint: { type: ["string", "null"] },
  },
  required: [
    "entity", "type", "doc_type", "name", "brand", "model", "serial_or_rc",
    "purchase_date", "price", "dealer", "warranty_months", "expiry_date",
    "amount", "person_hint",
  ],
} as const;

export type ExtractionResult = {
  entity: "asset" | "document_only";
  type: "appliance" | "vehicle" | null;
  doc_type: "invoice" | "warranty" | "amc" | "insurance" | "rc" | "puc" | "identity" | "property" | "other";
  name: string;
  brand: string | null;
  model: string | null;
  serial_or_rc: string | null;
  purchase_date: string | null;
  price: number | null;
  dealer: string | null;
  warranty_months: number | null;
  expiry_date: string | null;
  amount: number | null;
  person_hint: string | null;
};

export type ExtractOutcome =
  | { ok: true; data: ExtractionResult }
  | { ok: false; reason: string };

/** base64 (no data-url prefix) + mime -> structured extraction, or a refusal/error reason. */
export async function extractFromImage(base64: string, mimeType: string): Promise<ExtractOutcome> {
  const response = await client.responses.create({
    model: "gpt-5.6-terra",
    input: [
      {
        role: "system",
        content:
          "You extract structured data from a photo of a household document (invoice, warranty, insurance policy, RC, PUC, identity document, etc). Fill every field you can find; use null for anything not present. Never block on partial extraction.",
      },
      {
        role: "user",
        content: [
          { type: "input_text", text: "Extract the fields from this document image." },
          { type: "input_image", image_url: `data:${mimeType};base64,${base64}`, detail: "high" },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "document_extraction",
        strict: true,
        schema: EXTRACTION_SCHEMA,
      },
    },
  });

  const message = response.output.find((item) => item.type === "message") as
    | { type: "message"; content: Array<{ type: string; text?: string; refusal?: string }> }
    | undefined;
  const content = message?.content?.[0];

  if (!content) return { ok: false, reason: "empty_response" };
  if (content.type === "refusal") return { ok: false, reason: content.refusal ?? "refused" };
  if (content.type === "output_text" && content.text) {
    try {
      return { ok: true, data: JSON.parse(content.text) as ExtractionResult };
    } catch {
      return { ok: false, reason: "unparseable_json" };
    }
  }
  return { ok: false, reason: "unexpected_output" };
}
