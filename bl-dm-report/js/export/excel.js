// Export the Today report (and look-ahead) to an .xlsx download.
import { loadXLSX } from '../core/loader.js';

export async function exportDailyToExcel(date) {
  const XLSX = await loadXLSX();
  // TODO(feature): build sheet(s) from store and XLSX.writeFile(wb, `DM_Report_${date}.xlsx`)
  throw new Error('Excel export not implemented yet');
}
