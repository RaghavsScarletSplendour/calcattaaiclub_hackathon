"use client";

import { useState } from "react";
import Link from "next/link";
import { formatINR, urgency, dueLabel, URGENCY_DOT, URGENCY_TEXT } from "@/lib/format";
import type { FeedItem } from "@/lib/coo";

type Person = { id: string; name: string; initial: string | null; color: string | null };

export function ActionFeed({
  items,
  people,
  peopleMap,
}: {
  items: FeedItem[];
  people: Person[];
  peopleMap: Map<string, Person>;
}) {
  const [filter, setFilter] = useState<string | null>(null);
  const visible = filter ? items.filter((i) => i.person_id === filter) : items;
  const [hero, ...rest] = visible;

  return (
    <div>
      <div className="mt-5 flex flex-wrap gap-2.5">
        <FilterChip label="All" active={filter === null} onClick={() => setFilter(null)} />
        {people.map((p) => (
          <FilterChip
            key={p.id}
            label={p.name}
            avatarColor={p.color}
            avatarInitial={p.initial}
            active={filter === p.id}
            onClick={() => setFilter(p.id)}
          />
        ))}
      </div>

      <div className="pb-10 pt-1.5">
        {visible.length === 0 && (
          <div className="mt-15 py-15 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[20px] bg-emerald-50 text-3xl text-emerald-500 dark:bg-emerald-950/40">
              ✓
            </div>
            <div className="mt-4.5 text-[22px] font-semibold tracking-tight">All caught up</div>
            <div className="mt-1.5 text-[15px] text-muted-foreground">Nothing needs attention right now.</div>
          </div>
        )}

        {hero && (
          <Link
            href={itemHref(hero)}
            className="mb-6.5 flex cursor-pointer items-center gap-5.5 rounded-[20px] border border-primary/30 bg-accent p-6 shadow-[0_10px_34px_rgba(94,92,230,0.16)] transition-shadow hover:shadow-[0_14px_40px_rgba(94,92,230,0.24)]"
          >
            <Avatar person={hero.person_id ? peopleMap.get(hero.person_id) : undefined} size={52} fontSize={22} />
            <div className="flex-1">
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">Relevant now</span>
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                  {hero.type}
                </span>
              </div>
              <div className="mt-1.5 text-[22px] font-semibold tracking-tight">{hero.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {[hero.person_name, hero.asset_name].filter(Boolean).join(" · ") || "Household"}
              </div>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-xl font-semibold" style={{ color: URGENCY_TEXT[urgency(hero.due_date)] }}>
                {dueLabel(hero.due_date)}
              </div>
              {hero.amount != null && <div className="mt-1 text-[15px] text-muted-foreground">{formatINR(hero.amount)}</div>}
            </div>
          </Link>
        )}

        {rest.length > 0 && (
          <>
            <div className="mb-3 flex items-baseline justify-between px-1">
              <div className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">Action items</div>
              <div className="text-[13px] text-muted-foreground/70">
                {rest.length} item{rest.length === 1 ? "" : "s"}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {rest.map((item) => {
                const band = urgency(item.due_date);
                return (
                  <Link
                    key={item.id}
                    href={itemHref(item)}
                    className="flex items-center gap-4 rounded-[16px] border border-border bg-card p-4 transition-colors hover:border-foreground/15 hover:shadow-[0_4px_14px_rgba(0,0,0,0.05)]"
                  >
                    <span
                      className="h-2.5 w-2.5 flex-shrink-0 rounded-[5px]"
                      style={{ background: URGENCY_DOT[band] }}
                    />
                    <Avatar person={item.person_id ? peopleMap.get(item.person_id) : undefined} size={40} fontSize={15} />
                    <div className="min-w-0 flex-1">
                      <div className="text-[16px] font-semibold">{item.name}</div>
                      <div className="mt-0.5 text-[13px] text-muted-foreground">
                        {[item.person_name, item.asset_name].filter(Boolean).join(" · ") || "Household"}
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-[15px] font-semibold" style={{ color: URGENCY_TEXT[band] }}>
                        {dueLabel(item.due_date)}
                      </div>
                      <div className="mt-0.5 text-xs font-medium text-muted-foreground/70">
                        {item.amount != null ? formatINR(item.amount) : item.type}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function itemHref(item: FeedItem): string {
  if (item.asset_id) return `/asset/${item.asset_id}`;
  if (item.person_id) return `/person/${item.person_id}`;
  return "/";
}

function Avatar({ person, size, fontSize }: { person?: Person; size: number; fontSize: number }) {
  return (
    <span
      className="flex flex-shrink-0 items-center justify-center rounded-[30%] font-semibold text-white"
      style={{ width: size, height: size, fontSize, background: person?.color ?? "#8e8e93" }}
    >
      {person?.initial ?? "H"}
    </span>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  avatarColor,
  avatarInitial,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  avatarColor?: string | null;
  avatarInitial?: string | null;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
        active ? "bg-foreground text-background" : "border border-border bg-card hover:bg-muted"
      }`}
    >
      {avatarColor && (
        <span
          className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ background: avatarColor }}
        >
          {avatarInitial}
        </span>
      )}
      {label}
    </button>
  );
}
