// Restaurant BookingSummaryReport.csv
// Columns: Grouping Type, Value, Covers.
// A "Visit Date" row sets the current date; following "Service" rows give covers per service.

/** Minimal RFC-4180 CSV parser (quoted fields, escaped quotes, CRLF). */
export function parseCsv(text) {
  const rows = [];
  let row = [], field = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((f) => f.trim() !== ''));
}

export async function parseRestaurantCsv(file) {
  const rows = parseCsv(await file.text());
  // TODO(feature): walk Visit Date / Service rows → covers map; test against test-fixtures/BookingSummaryReport.csv
  throw new Error('Restaurant CSV import not implemented yet');
}
