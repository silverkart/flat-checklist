// PDF version of the occupancy report — same fields as occupancy-xls.js.
// Text is extracted with pdf.js, then the day label / Totals lines are parsed.
import { loadPdfJs } from '../core/loader.js';

export async function extractPdfLines(file) {
  const pdfjs = await loadPdfJs();
  const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const lines = [];
  for (let p = 1; p <= pdf.numPages; p++) {
    const { items } = await (await pdf.getPage(p)).getTextContent();
    // Group text items into lines by their y position.
    const rows = new Map();
    for (const it of items) {
      const y = Math.round(it.transform[5]);
      rows.set(y, [...(rows.get(y) || []), it]);
    }
    [...rows.entries()]
      .sort((a, b) => b[0] - a[0])
      .forEach(([, its]) => lines.push(its.sort((a, b) => a.transform[4] - b.transform[4]).map((i) => i.str).join(' ').trim()));
  }
  return lines.filter(Boolean);
}

export async function parseOccupancyPdf(file) {
  const lines = await extractPdfLines(file);
  // TODO(feature): port parser from v17
  throw new Error('Occupancy .pdf import not implemented yet');
}
