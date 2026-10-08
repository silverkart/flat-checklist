// Dates are handled as ISO 'YYYY-MM-DD' strings in local time throughout the app.

export function toISO(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO() { return toISO(new Date()); }

export function addDays(iso, n) {
  const d = fromISO(iso);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

/** Hotel season key, e.g. '25-26'. Season runs Apr→Mar (adjust if v17 differs). */
export function seasonFor(iso, startMonth = 4) {
  const d = fromISO(iso);
  const y = d.getFullYear() % 100;
  const start = d.getMonth() + 1 >= startMonth ? y : y - 1;
  const pad = (n) => String((n + 100) % 100).padStart(2, '0');
  return `${pad(start)}-${pad(start + 1)}`;
}

export function formatLong(iso) {
  return fromISO(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatShort(iso) {
  return fromISO(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
