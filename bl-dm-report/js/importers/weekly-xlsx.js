// Weekly_Stats_<season>.xlsx → season data. Reads the "Running Total" sheet.
import { loadXLSX } from '../core/loader.js';

export async function parseWeeklyStatsXlsx(file) {
  const XLSX = await loadXLSX();
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const ws = wb.Sheets['Running Total'];
  if (!ws) throw new Error('No "Running Total" sheet found');
  // TODO(feature): map rows → SeasonData { weeks: [...] }
  throw new Error('Weekly stats import not implemented yet');
}
