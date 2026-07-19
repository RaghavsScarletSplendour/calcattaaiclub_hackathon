import { createClient } from "@/lib/supabase/server";
import { AssetsList, type AssetListItem } from "@/components/asset/assets-list";

export default async function AssetsPage() {
  const sb = await createClient();

  const [{ data: assets }, { data: people }] = await Promise.all([
    sb.from("assets").select("*").order("name"),
    sb.from("people").select("id, name"),
  ]);

  const peopleMap = new Map((people ?? []).map((p) => [p.id, p.name]));
  const items: AssetListItem[] = (assets ?? []).map((a) => ({
    ...a,
    owner_name: a.owner_id ? (peopleMap.get(a.owner_id) ?? null) : null,
  }));

  return <AssetsList assets={items} />;
}
