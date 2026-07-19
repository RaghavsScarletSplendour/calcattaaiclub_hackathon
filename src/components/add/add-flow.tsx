"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ingestDocument } from "@/app/actions/ingest";
import type { ExtractionResult } from "@/lib/openai";

type Person = { id: string; name: string };
type Stage = "upload" | "reading" | "confirm" | "saving" | "done" | "error";

const DOC_TYPES = ["invoice", "warranty", "amc", "insurance", "rc", "puc", "identity", "property", "other"] as const;
const ASSET_TYPES = ["appliance", "vehicle"] as const;

export function AddFlow({ people }: { people: Person[] }) {
  const [stage, setStage] = useState<Stage>("upload");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState<ExtractionResult | null>(null);
  const [personId, setPersonId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleFile(file: File) {
    setStage("reading");
    setErrorMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/extract", { method: "POST", body: fd });
      const json = await res.json();
      if (!json.ok) {
        setErrorMsg(`Couldn't read that document (${json.reason}). Try another photo, or fill it in manually below.`);
        setForm(blankExtraction());
        setStage("confirm");
        return;
      }
      const data: ExtractionResult = json.data;
      setForm(data);
      if (data.person_hint) {
        const match = people.find((p) => p.name.toLowerCase() === data.person_hint!.toLowerCase());
        if (match) setPersonId(match.id);
      }
      setStage("confirm");
    } catch {
      setErrorMsg("Upload failed. Check your connection and try again.");
      setStage("error");
    }
  }

  function handleSave() {
    if (!form) return;
    setStage("saving");
    startTransition(async () => {
      try {
        await ingestDocument({ ...form, person_id: personId });
        toast.success("Saved — added to the action feed");
        router.push("/");
      } catch (e) {
        setErrorMsg(e instanceof Error ? e.message : "Save failed");
        setStage("error");
      }
    });
  }

  if (stage === "upload" || stage === "reading") {
    return (
      <div className="space-y-4">
        <label className="flex h-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm text-muted-foreground hover:bg-accent/50">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={stage === "reading"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {stage === "reading" ? "Reading document…" : "Tap to upload a photo of a document"}
        </label>
      </div>
    );
  }

  if (stage === "error") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">{errorMsg}</p>
        <Button variant="outline" onClick={() => setStage("upload")}>Try again</Button>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="space-y-4">
      {errorMsg && <p className="text-sm text-amber-600">{errorMsg}</p>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Name">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="For">
          <Select value={personId ?? "shared"} onValueChange={(v) => setPersonId(v === "shared" ? null : v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="shared">Shared / household</SelectItem>
              {people.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Entity">
          <Select value={form.entity} onValueChange={(v) => setForm({ ...form, entity: v as ExtractionResult["entity"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="asset">Asset</SelectItem>
              <SelectItem value="document_only">Document only</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {form.entity === "asset" && (
          <Field label="Asset type">
            <Select value={form.type ?? ""} onValueChange={(v) => setForm({ ...form, type: v as ExtractionResult["type"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
        )}
        <Field label="Document type">
          <Select value={form.doc_type} onValueChange={(v) => setForm({ ...form, doc_type: v as ExtractionResult["doc_type"] })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Brand"><Input value={form.brand ?? ""} onChange={(e) => setForm({ ...form, brand: e.target.value || null })} /></Field>
        <Field label="Purchase / issue date">
          <Input type="date" value={form.purchase_date ?? ""} onChange={(e) => setForm({ ...form, purchase_date: e.target.value || null })} />
        </Field>
        <Field label="Expiry date">
          <Input type="date" value={form.expiry_date ?? ""} onChange={(e) => setForm({ ...form, expiry_date: e.target.value || null })} />
        </Field>
        <Field label="Warranty (months)">
          <Input type="number" value={form.warranty_months ?? ""} onChange={(e) => setForm({ ...form, warranty_months: e.target.value ? Number(e.target.value) : null })} />
        </Field>
        <Field label="Amount / price">
          <Input type="number" value={form.amount ?? form.price ?? ""} onChange={(e) => { const v = e.target.value; setForm({ ...form, amount: v ? Number(v) : null, price: v ? Number(v) : null }); }} />
        </Field>
      </div>
      <Button onClick={handleSave} disabled={isPending || stage === "saving"}>
        {stage === "saving" ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function blankExtraction(): ExtractionResult {
  return {
    entity: "document_only", type: null, doc_type: "other", name: "",
    brand: null, model: null, serial_or_rc: null, purchase_date: null,
    price: null, dealer: null, warranty_months: null, expiry_date: null,
    amount: null, person_hint: null,
  };
}
