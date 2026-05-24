/**
 * Tiny formatting helpers used across the UI.
 * Pure functions; no React dependency.
 */

export function formatDate(value: string | number | Date, locale = "en-US"): string {
  const d = new Date(value);
  return d.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value: string | number | Date, locale = "en-US"): string {
  const d = new Date(value);
  return d.toLocaleString(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelative(value: string | number | Date): string {
  const now = Date.now();
  const then = new Date(value).getTime();
  const diff = now - then;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return formatDate(value);
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function truncate(input: string, max = 80): string {
  if (input.length <= max) return input;
  return `${input.slice(0, max - 1)}…`;
}
