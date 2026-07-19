import Link from "next/link";
import { formatDate, urgency, dueLabel, URGENCY_DOT, URGENCY_TEXT } from "@/lib/format";
import type { Person, Reminder } from "@/lib/types";

export type InsuranceItem = {
  id: string;
  label: string;
  meta: string;
};

export type IdentityDocItem = {
  id: string;
  label: string;
  meta: string;
  fileUrl: string | null;
};

export type PersonReminderItem = Reminder & { asset_name: string | null };

export type PersonProfileData = {
  person: Person;
  bloodGroup: string | null;
  allergies: string[];
  insurance: InsuranceItem[];
  identityDocs: IdentityDocItem[];
  reminders: PersonReminderItem[];
};

export function PersonProfile({ data }: { data: PersonProfileData }) {
  const { person, bloodGroup, allergies, insurance, identityDocs, reminders } = data;
  const roleLine = [person.role, person.dob ? `Born ${formatDate(person.dob)}` : null]
    .filter(Boolean)
    .join(" · ") || "—";

  return (
    <div className="px-11 py-7.5">
      <Link
        href="/"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        ‹ Home
      </Link>

      <div className="flex items-center gap-5">
        <div
          className="flex h-18 w-18 flex-shrink-0 items-center justify-center rounded-[24px] text-[32px] font-semibold text-white"
          style={{ background: person.color ?? "#8e8e93" }}
        >
          {person.initial ?? person.name[0]}
        </div>
        <div>
          <div className="text-[30px] font-semibold tracking-tight">{person.name}</div>
          <div className="mt-0.5 text-[15px] text-muted-foreground">{roleLine}</div>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 items-start gap-5">
        <HealthCard bloodGroup={bloodGroup} allergies={allergies} />
        <InsuranceCard insurance={insurance} />
        <IdentityDocsCard docs={identityDocs} />
        <ActionItemsCard reminders={reminders} />
      </div>
    </div>
  );
}

function HealthCard({ bloodGroup, allergies }: { bloodGroup: string | null; allergies: string[] }) {
  return (
    <div className="rounded-[18px] border border-border bg-card p-5.5">
      <div className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Health</div>
      <div className="mt-4 flex items-center justify-between border-b border-border pb-3.5">
        <span className="text-[15px] text-muted-foreground">Blood group</span>
        <span className="text-[16px] font-semibold">{bloodGroup ?? "—"}</span>
      </div>
      <div className="mt-3.5">
        <div className="mb-2.5 text-[15px] text-muted-foreground">Allergies</div>
        <div className="flex flex-wrap gap-2">
          {allergies.length > 0 ? (
            allergies.map((a, i) => (
              <span
                key={i}
                className="rounded-lg bg-red-50 px-3 py-1.5 text-[13px] font-semibold text-red-600 dark:bg-red-950/40 dark:text-red-300"
              >
                {a}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground/70">None recorded</span>
          )}
        </div>
      </div>
    </div>
  );
}

function InsuranceCard({ insurance }: { insurance: InsuranceItem[] }) {
  return (
    <div className="rounded-[18px] border border-border bg-card p-5.5">
      <div className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Insurance</div>
      <div className="mt-4 flex flex-col gap-3">
        {insurance.length > 0 ? (
          insurance.map((i) => (
            <div key={i.id} className="rounded-[13px] bg-muted px-4 py-3.5">
              <div className="text-[15px] font-semibold">{i.label}</div>
              <div className="mt-0.5 text-[13px] text-muted-foreground">{i.meta}</div>
            </div>
          ))
        ) : (
          <span className="text-sm text-muted-foreground/70">No policies on file</span>
        )}
      </div>
    </div>
  );
}

function IdentityDocsCard({ docs }: { docs: IdentityDocItem[] }) {
  return (
    <div className="rounded-[18px] border border-border bg-card p-5.5">
      <div className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
        Identity documents
      </div>
      <div className="mt-2 flex flex-col">
        {docs.length > 0 ? (
          docs.map((d, idx) => (
            <div
              key={d.id}
              className={`flex items-center justify-between py-3.5 ${
                idx < docs.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div>
                <div className="text-[15px] font-medium">{d.label}</div>
                <div className="mt-0.5 text-[13px] text-muted-foreground">{d.meta}</div>
              </div>
              {d.fileUrl ? (
                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-semibold text-primary hover:text-primary/80"
                >
                  View
                </a>
              ) : (
                <span className="text-[13px] font-semibold text-muted-foreground/50">View</span>
              )}
            </div>
          ))
        ) : (
          <span className="mt-2 text-sm text-muted-foreground/70">No documents on file</span>
        )}
      </div>
    </div>
  );
}

function ActionItemsCard({ reminders }: { reminders: PersonReminderItem[] }) {
  return (
    <div className="rounded-[18px] border border-border bg-card p-5.5">
      <div className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Action items</div>
      <div className="mt-4 flex flex-col gap-2.5">
        {reminders.length > 0 ? (
          reminders.map((r) => {
            const band = urgency(r.due_date);
            const rowClass =
              "flex items-center gap-3 rounded-[13px] bg-muted px-3.5 py-3 transition-colors";
            const inner = (
              <>
                <span
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-[5px]"
                  style={{ background: URGENCY_DOT[band] }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold">{r.name}</div>
                  <div className="mt-0.5 text-[13px] text-muted-foreground">{r.asset_name ?? r.type}</div>
                </div>
                <span
                  className="flex-shrink-0 text-[14px] font-semibold"
                  style={{ color: URGENCY_TEXT[band] }}
                >
                  {dueLabel(r.due_date)}
                </span>
              </>
            );
            return r.asset_id ? (
              <Link key={r.id} href={`/asset/${r.asset_id}`} className={`${rowClass} hover:bg-muted/70`}>
                {inner}
              </Link>
            ) : (
              <div key={r.id} className={rowClass}>
                {inner}
              </div>
            );
          })
        ) : (
          <span className="text-sm text-muted-foreground/70">All clear.</span>
        )}
      </div>
    </div>
  );
}
