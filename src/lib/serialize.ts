// Convert Prisma objects to plain serializable objects for Client Components.
// Uses JSON round-trip which handles Decimal (has toJSON), Date (to ISO string),
// and strips any non-serializable values like functions.
export function serialize<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
