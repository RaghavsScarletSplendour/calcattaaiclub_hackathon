import Link from "next/link";
import { formatDate, formatINR, urgency, dueLabel, URGENCY_DOT, URGENCY_TEXT } from "@/lib/format";
import { AssetIconBadge } from "@/components/asset/asset-icon";
import type { Asset, Contact, Expense, Reminder } from "@/lib/types";

export type AssetDetailData = {
  asset: Asset;
  /** Resolved owner name, or null when the asset is shared/household (owner_id is null). */
  ownerName: string | null;
  expenses: Expense[];
  /** This asset's open (status: 'upcoming') reminders, nearest-due first. */
  reminders: Reminder[];
  /** The contacts row with linked_asset_id = this asset, if any. */
  contact: Contact | null;
};

export function AssetDetail({ data }: { data: AssetDetailData }) {
  const { asset, ownerName, expenses, reminders, contact } = data;
  const metaLine = `${capitalize(asset.type)} · ${asset.room_or_unit ?? "—"} · owner ${ownerName ?? "Shared"}`;

  return (
    <div className="px-11 py-7.5">
      <Link
        href="/assets"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        ‹ Assets
      </Link>

      <div className="flex items-center gap-5">
        <AssetIconBadge
          icon={asset.icon}
          name={asset.name}
          size={72}
          radius={22}
          iconClassName="h-8 w-8"
          textClassName="text-lg"
        />
        <div>
          <div className="text-[30px] font-semibold tracking-tight">{asset.name}</div>
          <div className="mt-0.5 text-[15px] text-muted-foreground">{metaLine}</div>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-[1.3fr_1fr] items-start gap-5">
        <div className="flex flex-col gap-5">
          <PurchaseCard asset={asset} />
          <LinkedExpensesCard expenses={expenses} />
        </div>
        <div className="flex flex-col gap-5">
          <RemindersCard reminders={reminders} />
          {contact && <ContactCard contact={contact} />}
        </div>
      </div>
    </div>
  );
}

function PurchaseCard({ asset }: { asset: Asset }) {
  const fields: { label: string; value: string }[] = [
    { label: "Brand", value: asset.brand ?? "—" },
    { label: "Model", value: asset.model ?? "—" },
    { label: "Serial / RC", value: asset.serial_or_rc ?? "—" },
    { label: "Purchased", value: formatDate(asset.purchase_date) },
    { label: "Price", value: formatINR(asset.price) },
    { label: "Dealer", value: asset.dealer ?? "—" },
  ];

  return (
    <div className="rounded-[18px] border border-border bg-card p-5.5">
      <div className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Purchase</div>
      <div className="mt-4 grid grid-cols-3 gap-4.5">
        {fields.map((f) => (
          <div key={f.label}>
            <div className="text-xs text-muted-foreground/70">{f.label}</div>
            <div className="mt-0.75 text-[15px] font-semibold">{f.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LinkedExpensesCard({ expenses }: { expenses: Expense[] }) {
  const total = expenses.reduce((sum, e) => sum + (e.amount ?? 0), 0);

  return (
    <div className="rounded-[18px] border border-border bg-card p-5.5">
      <div className="flex items-baseline justify-between">
        <div className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
          Linked expenses
        </div>
        <div className="text-sm text-muted-foreground">
          Total <span className="font-semibold text-foreground">{formatINR(total)}</span>
        </div>
      </div>
      <div className="mt-2 flex flex-col">
        {expenses.length > 0 ? (
          expenses.map((e, idx) => (
            <div
              key={e.id}
              className={`flex items-center justify-between py-3.25 ${
                idx < expenses.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div>
                <div className="text-[15px] font-medium">{e.name}</div>
                <div className="text-[13px] text-muted-foreground">{formatDate(e.date)}</div>
              </div>
              <span className="text-[15px] font-semibold">{formatINR(e.amount)}</span>
            </div>
          ))
        ) : (
          <span className="pt-2 text-sm text-muted-foreground/70">No expenses linked yet.</span>
        )}
      </div>
    </div>
  );
}

function RemindersCard({ reminders }: { reminders: Reminder[] }) {
  return (
    <div className="rounded-[18px] border border-border bg-card p-5.5">
      <div className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Reminders</div>
      <div className="mt-4 flex flex-col gap-2.5">
        {reminders.length > 0 ? (
          reminders.map((r) => {
            const band = urgency(r.due_date);
            return (
              <div key={r.id} className="flex items-center gap-3 rounded-[13px] bg-muted px-3.5 py-3">
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-[5px]"
                  style={{ background: URGENCY_DOT[band] }}
                />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold">{r.name}</div>
                  <div className="mt-0.5 text-[13px] text-muted-foreground">Due {formatDate(r.due_date)}</div>
                </div>
                <span className="flex-shrink-0 text-[14px] font-semibold" style={{ color: URGENCY_TEXT[band] }}>
                  {dueLabel(r.due_date)}
                </span>
              </div>
            );
          })
        ) : (
          <span className="text-sm text-muted-foreground/70">No reminders.</span>
        )}
      </div>
    </div>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  return (
    <div className="rounded-[18px] border border-border bg-card p-5.5">
      <div className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
        Point of contact
      </div>
      <div className="mt-4 flex items-center gap-3.5">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px] bg-accent text-base font-semibold text-accent-foreground">
          {contact.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold">{contact.name}</div>
          <div className="truncate text-[13px] text-muted-foreground">{humanizeRole(contact.role)}</div>
        </div>
      </div>
      {contact.phone && (
        <a
          href={`tel:${contact.phone.replace(/\s+/g, "")}`}
          className="mt-4 block rounded-xl bg-primary py-2.75 text-center text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Call {contact.phone}
        </a>
      )}
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function humanizeRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
