/**
 * How this app draws a field it was never told about.
 *
 * The contract promises `name` and `type` on a repository and `host` on an upstream, and says
 * nothing about the rest — while the service on the other side is being built at the same time as
 * this client and will grow fields before either has a reason to release. Two ways out of that:
 * draw only what is promised and lose everything else silently, or draw whatever arrives.
 *
 * This is the second, and the trade is stated rather than hidden. An unknown field gets a column
 * headed by its own name, humanised, and a cell rendered by what the value **is** rather than by
 * what it was assumed to be. Nothing here guesses a *meaning*: a number is a number, not a byte
 * count formatted with a unit it may not have, because a field named `size` that turned out to be
 * a row count would then be wrong in a way nobody could see. When the contract pins those fields,
 * they graduate to real columns with real formatting and leave this path.
 *
 * The one thing this does not do is drop a value it cannot draw. An object becomes its JSON, which
 * is ugly and true, rather than `[object Object]`, which is neither.
 */

/** What is drawn where there is nothing to draw — one em dash, everywhere. */
export const NONE = '—';

/**
 * The extra field names across a set of rows, in the order the service sent them.
 *
 * First-seen order rather than alphabetical, because the service's own order is information: a
 * listing puts its identity fields first and its bookkeeping last, and sorting throws that away.
 * Rows are scanned in full — a field present on only the last row still earns its column, which is
 * what makes a nullable field visible instead of invisible.
 */
export function extraColumns(
  rows: readonly Readonly<Record<string, unknown>>[],
  promised: readonly string[],
): readonly string[] {
  const seen = new Set(promised);
  const columns: string[] = [];
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }
  return columns;
}

/** `lastAccessedAt` → `Last accessed at`; `cached_at` → `Cached at`. A field name, made readable. */
export function columnLabel(field: string): string {
  const words = field
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .trim()
    .toLowerCase();
  return words ? words.charAt(0).toUpperCase() + words.slice(1) : field;
}

/**
 * One value, drawn by its type and nothing else.
 *
 * `null`, `undefined` and the empty string all become {@link NONE}: an empty cell is
 * indistinguishable from a cell that failed to render, and none of the three is worth telling apart
 * in a column this app does not understand.
 */
export function cellText(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return NONE;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value.toLocaleString('en-GB') : String(value);
  }
  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }
  if (Array.isArray(value)) {
    return value.length === 0 ? NONE : value.map(cellText).join(', ');
  }
  return JSON.stringify(value) ?? String(value);
}

/** A row's value for a field, without letting the compiler pretend it knows what it is. */
export function fieldOf(row: Readonly<Record<string, unknown>>, field: string): unknown {
  return row[field];
}
