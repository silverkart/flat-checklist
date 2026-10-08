// Banchory Lodge occupancy report (.xls / .xlsx).
// Layout: "Room Type" header rows carrying day labels like "Thu 25 Jun 2026",
// then a Totals row per day with Avl / Let / Tot / Occ% / Slprs columns.
// "Let" → rooms_occupied, "Slprs" → sleepers.
import { loadXLSX } from '../core/loader.js';

/** @returns {Promise<import('./index.js').ImportResult>} */
export async function parseOccupancyXls(file) {
  const XLSX = await loadXLSX();
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  // TODO(feature): port parser from v17 and test against test-fixtures/BANCHORY_Occupancy.xls
  throw new Error('Occupancy .xls import not implemented yet');
}
