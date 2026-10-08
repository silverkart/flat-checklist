// "Import Reports" entry point. Accepts many files at once, routes each to a parser,
// merges the normalised results into the store. The dashboard re-renders from state,
// so no save is required after import.
//
// Every parser returns an ImportResult:
//   {
//     source: string,                                        // file name
//     rooms?:  { [date]: { rooms_occupied?, sleepers? } },   // occupancy reports
//     covers?: { [date]: { [service]: { [area]: covers } } } // restaurant CSV
//   }
import { update, getState } from '../core/store.js';
import { parseOccupancyXls } from './occupancy-xls.js';
import { parseOccupancyPdf } from './occupancy-pdf.js';
import { parseRestaurantCsv } from './restaurant-csv.js';

function pickParser(file) {
  const ext = file.name.toLowerCase().split('.').pop();
  if (ext === 'xls' || ext === 'xlsx') return parseOccupancyXls;
  if (ext === 'pdf') return parseOccupancyPdf;
  if (ext === 'csv') return parseRestaurantCsv;
  return null;
}

/** @returns {Promise<{ok: string[], failed: {name: string, error: string}[]}>} */
export async function importFiles(fileList) {
  const ok = [];
  const failed = [];
  for (const file of fileList) {
    const parser = pickParser(file);
    if (!parser) { failed.push({ name: file.name, error: 'Unsupported file type' }); continue; }
    try {
      applyResult(await parser(file));
      ok.push(file.name);
    } catch (e) {
      failed.push({ name: file.name, error: e.message || String(e) });
    }
  }
  return { ok, failed };
}

/** Merge an ImportResult into state: today → daily report, future dates → look-ahead. */
export function applyResult(result) {
  const today = getState().currentDate;
  update((s) => {
    for (const [date, r] of Object.entries(result.rooms || {})) {
      if (date === today) {
        const d = (s.daily[date] ||= { report_date: date });
        if (r.rooms_occupied != null) d.rooms_occupied = r.rooms_occupied;
        if (r.sleepers != null) d.guests_total = r.sleepers;
      } else if (date > today) {
        const f = (s.forecast[date] ||= {});
        if (r.rooms_occupied != null) f.rooms_booked = r.rooms_occupied;
        if (r.sleepers != null) f.guests_est = r.sleepers;
      }
    }
    // TODO(feature): covers → today's breakfast/lunch/dinner + s.bookings for look-ahead
  });
}
