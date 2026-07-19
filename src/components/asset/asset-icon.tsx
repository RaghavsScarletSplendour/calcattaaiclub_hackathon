import { createElement, type ComponentType } from "react";
import * as LucideIcons from "lucide-react";

type IconComponent = ComponentType<{ className?: string }>;

/** "air-vent" -> "AirVent" */
function kebabToPascal(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

/** Short text fallback derived from the asset name, e.g. "Honda Activa 6G" -> "HA6". */
function fallbackAbbrev(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase();
  return words
    .slice(0, 4)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** `assets.icon` holds a lucide-react icon slug (e.g. "air-vent", "car"). Resolve it to the
 *  matching "*Icon"-suffixed component (the import style already used across this codebase). */
function resolveIcon(icon: string | null | undefined): IconComponent | null {
  if (!icon) return null;
  const key = `${kebabToPascal(icon)}Icon`;
  const icons = LucideIcons as unknown as Record<string, IconComponent>;
  return icons[key] ?? null;
}

/** Dark rounded-square badge used for an asset's tile/header icon. Renders the asset's
 *  lucide icon when `icon` resolves to a known component, otherwise falls back to a short
 *  text abbreviation derived from its name so the square is never blank. */
export function AssetIconBadge({
  icon,
  name,
  size = 48,
  radius = 14,
  iconClassName = "h-5.5 w-5.5",
  textClassName = "text-xs",
}: {
  icon: string | null;
  name: string;
  size?: number;
  radius?: number;
  iconClassName?: string;
  textClassName?: string;
}) {
  const Icon = resolveIcon(icon);
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center bg-foreground text-white"
      style={{ width: size, height: size, borderRadius: radius }}
    >
      {Icon ? (
        createElement(Icon, { className: iconClassName })
      ) : (
        <span className={`font-bold tracking-wide ${textClassName}`}>{fallbackAbbrev(name)}</span>
      )}
    </div>
  );
}
