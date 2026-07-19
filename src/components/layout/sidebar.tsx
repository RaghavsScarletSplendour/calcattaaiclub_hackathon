"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Person = { id: string; name: string; initial: string | null; color: string | null };

const NAV = [
  { href: "/", label: "Home" },
  { href: "/add", label: "Add via photo" },
  { href: "/assets", label: "Assets" },
] as const;

export function Sidebar({ people }: { people: Person[] }) {
  const pathname = usePathname();
  const peopleHref = people[0] ? `/person/${people[0].id}` : "/";
  const isPeopleActive = pathname.startsWith("/person");

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar px-4.5 py-6.5">
      <Link href="/" className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex h-7.5 w-7.5 items-center justify-center rounded-[9px] bg-primary text-sm font-bold text-primary-foreground">
          H
        </div>
        <span className="text-[17px] font-semibold tracking-tight text-sidebar-foreground">Homie</span>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {NAV.map((item) => (
          <NavLink key={item.href} href={item.href} active={pathname === item.href}>
            {item.label}
          </NavLink>
        ))}
        <NavLink href={peopleHref} active={isPeopleActive}>
          People
        </NavLink>
      </nav>

      <div className="mt-5.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
        Family
      </div>
      <div className="mt-2 flex flex-col gap-0.5">
        {people.map((p) => (
          <Link
            key={p.id}
            href={`/person/${p.id}`}
            className="flex items-center gap-2.5 rounded-[11px] px-3 py-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
          >
            <span
              className="flex h-5.5 w-5.5 items-center justify-center rounded-full text-[11px] font-bold text-white"
              style={{ background: p.color ?? "#8e8e93" }}
            >
              {p.initial ?? p.name[0]}
            </span>
            <span className="text-sm text-sidebar-foreground/80">{p.name}</span>
          </Link>
        ))}
      </div>

      <div className="mt-auto flex items-center gap-2.5 border-t border-sidebar-border px-2 pb-0.5 pt-3">
        <div className="flex h-8.5 w-8.5 items-center justify-center rounded-[11px] bg-black/[0.05] text-[13px] font-semibold text-muted-foreground dark:bg-white/[0.08]">
          H
        </div>
        <div>
          <div className="text-sm font-semibold text-sidebar-foreground">Household</div>
          <div className="text-xs text-muted-foreground">{people.length} members</div>
        </div>
      </div>
    </aside>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-[11px] px-3 py-2.5 text-[15px] transition-colors",
        active
          ? "bg-card font-semibold text-foreground shadow-sm"
          : "font-normal text-muted-foreground hover:bg-black/[0.03] dark:hover:bg-white/[0.05]"
      )}
    >
      <span className={cn("h-2 w-2 rounded-[3px]", active ? "bg-primary" : "bg-border")} />
      {children}
    </Link>
  );
}
