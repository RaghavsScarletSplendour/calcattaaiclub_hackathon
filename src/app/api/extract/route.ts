import { NextResponse } from "next/server";
import { extractFromImage } from "@/lib/openai";

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

  const result = await extractFromImage(base64, mimeType);
  if (!result.ok) {
    return NextResponse.json({ ok: false, reason: result.reason }, { status: 422 });
  }
  return NextResponse.json({ ok: true, data: result.data, imageDataUrl: `data:${mimeType};base64,${base64}` });
}
