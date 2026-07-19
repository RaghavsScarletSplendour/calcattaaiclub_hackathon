import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssetDetail, type AssetDetailData } from "@/components/asset/asset-detail";

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createClient();

  const { data: asset } = await sb.from("assets").select("*").eq("id", id).maybeSingle();
  if (!asset) notFound();

  const [{ data: expenses }, { data: reminders }, { data: contact }, { data: people }] = await Promise.all([
    sb.from("expenses").select("*").eq("asset_id", id).order("date", { ascending: false }),
    sb
      .from("reminders")
      .select("*")
      .eq("asset_id", id)
      .eq("status", "upcoming")
      .order("due_date", { ascending: true }),
    sb.from("contacts").select("*").eq("linked_asset_id", id).maybeSingle(),
    sb.from("people").select("id, name"),
  ]);

  const ownerName = asset.owner_id
    ? ((people ?? []).find((p) => p.id === asset.owner_id)?.name ?? null)
    : null;

  const data: AssetDetailData = {
    asset,
    ownerName,
    expenses: expenses ?? [],
    reminders: reminders ?? [],
    contact: contact ?? null,
  };

  return <AssetDetail data={data} />;
}
