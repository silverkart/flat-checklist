const gbp0 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 });
const gbp2 = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2 });

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

export const fmt = {
  int: (v) => (isNum(v) ? Math.round(v).toLocaleString('en-GB') : '—'),
  gbp: (v) => (isNum(v) ? gbp0.format(v) : '—'),
  gbp2: (v) => (isNum(v) ? gbp2.format(v) : '—'),
  pct: (v) => (isNum(v) ? `${v.toFixed(1)}%` : '—'),
};

/** Parse user/CSV input to a number, or null. Accepts '£1,234.50', '85%', ''. */
export function num(v) {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const n = Number(String(v).replace(/[£,%\s]/g, ''));
  return Number.isFinite(n) ? n : null;
}
