import { createClient } from "@/lib/supabase/server";
import { AddFlow } from "@/components/add/add-flow";

export default async function AddPage() {
  const sb = await createClient();
  const { data: people } = await sb.from("people").select("id, name").order("name");

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold">Add via photo</h1>
      <AddFlow people={people ?? []} />
    </div>
  );
}
