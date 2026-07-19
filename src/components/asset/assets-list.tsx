import Link from "next/link";
import { AssetIconBadge } from "@/components/asset/asset-icon";
import type { Asset } from "@/lib/types";

export type AssetListItem = Asset & { owner_name: string | null };

export function AssetsList({ assets }: { assets: AssetListItem[] }) {
  const vehicles = assets.filter((a) => a.type === "vehicle");
  const appliances = assets.filter((a) => a.type === "appliance");

  return (
    <div className="px-11 py-7.5">
      <div className="text-[30px] font-semibold tracking-tight">Assets</div>
      <div className="mt-1 text-[15px] text-muted-foreground">
        Everything the household owns, organized and ready to open.
      </div>

      {vehicles.length > 0 && <AssetGroup title="Vehicles" assets={vehicles} />}
      {appliances.length > 0 && <AssetGroup title="Home appliances" assets={appliances} />}
    </div>
  );
}

function AssetGroup({ title, assets }: { title: string; assets: AssetListItem[] }) {
  return (
    <div className="mt-7 first:mt-0">
      <div className="mb-3 px-1 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      <div className="grid grid-cols-3 gap-4">
        {assets.map((asset) => (
          <AssetTile key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
}

function AssetTile({ asset }: { asset: AssetListItem }) {
  const ownerLabel = asset.owner_name ? `Owner: ${asset.owner_name}` : "Shared";
  const subline = [asset.room_or_unit, ownerLabel].filter(Boolean).join(" · ");

  return (
    <Link
      href={`/asset/${asset.id}`}
      className="flex items-center gap-3.5 rounded-[18px] border border-border bg-card p-5 transition-colors hover:border-foreground/15 hover:shadow-[0_4px_14px_rgba(0,0,0,0.05)]"
    >
      <AssetIconBadge icon={asset.icon} name={asset.name} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[16px] font-semibold">{asset.name}</div>
        <div className="mt-0.5 truncate text-[13px] text-muted-foreground">{subline}</div>
      </div>
    </Link>
  );
}
