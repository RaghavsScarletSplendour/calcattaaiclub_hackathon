import { createClient } from "@/lib/supabase/server";
import { sortActionFeed, type FeedItem } from "@/lib/coo";
import { ActionFeed } from "@/components/coo/action-feed";

export default async function HomePage() {
  const sb = await createClient();

  const [{ data: reminders }, { data: people }, { data: assets }] = await Promise.all([
    sb.from("reminders").select("*").eq("status", "upcoming"),
    sb.from("people").select("id, name, initial, color"),
    sb.from("assets").select("id, name"),
  ]);

  const peopleMap = new Map((people ?? []).map((p) => [p.id, p]));
  const assetMap = new Map((assets ?? []).map((a) => [a.id, a.name]));

  const items: FeedItem[] = (reminders ?? []).map((r) => ({
    ...r,
    person_name: r.person_id ? peopleMap.get(r.person_id)?.name ?? null : null,
    asset_name: r.asset_id ? assetMap.get(r.asset_id) ?? null : null,
  }));

  const sorted = sortActionFeed(items);
  const today = new Date();
  const dateLabel = today.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="px-11 py-7.5">
      <div className="text-[13px] font-medium text-muted-foreground">{dateLabel}</div>
      <h1 className="mt-0.5 text-[30px] font-semibold tracking-tight">Good morning</h1>
      <ActionFeed items={sorted} people={people ?? []} peopleMap={peopleMap} />
    </div>
  );
}
