import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { extractFromImage } from "@/lib/openai";
import { createServiceClient } from "@/lib/supabase/service";

// Route Handler (not a Server Action) — dodges the 1MB Server Action body cap for image uploads.
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, reason: "missing_file" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const base64 = bytes.toString("base64");
  const mimeType = file.type || "image/jpeg";

  // Upload first, independent of extraction outcome — the photo is worth
  // keeping even if the vision model can't read it.
  const filePath = await uploadToStorage(bytes, mimeType, file.name);

  const result = await extractFromImage(base64, mimeType);
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason, filePath }, { status: 422 });
  }
  return NextResponse.json({ ok: true, data: result.data, filePath });
}

async function uploadToStorage(bytes: Buffer, mimeType: string, originalName: string): Promise<string | null> {
  try {
    const sb = createServiceClient();
    const path = `${randomUUID()}-${originalName}`;
    const { error } = await sb.storage.from("documents").upload(path, bytes, { contentType: mimeType });
    if (error) {
      console.error("storage upload failed:", error.message);
      return null;
    }
    return path;
  } catch (e) {
    console.error("storage upload threw:", e);
    return null;
  }
}
