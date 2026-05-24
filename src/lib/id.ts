/**
 * Lightweight ID generator. Avoids extra deps; not cryptographically secure.
 * Used only for client-side mock entities and optimistic IDs.
 */
export function createId(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `${prefix}_${ts}${rand}`;
}
