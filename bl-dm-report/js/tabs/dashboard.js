// Dashboard: KPI tiles (yest · today · tmrw), VIP + maintenance notes, next-3-days table.
import { html, raw } from '../core/dom.js';
import { getState, getDaily } from '../core/store.js';
import { addDays, formatLong } from '../core/dates.js';
import { deriveDaily } from '../calc/kpis.js';
import { fmt } from '../core/format.js';
import { kpiTile } from '../ui/kpi-tile.js';

export function render(el) {
  const today = getState().currentDate;
  const days = [addDays(today, -1), today, addDays(today, 1)].map((d) => {
    const r = getDaily(d);
    return { r, k: deriveDaily(r) };
  });
  const tile = (label, pick, f, accent) => raw(kpiTile({
    label, accent,
    yesterday: f(pick(days[0])), today: f(pick(days[1])), tomorrow: f(pick(days[2])),
  }));

  el.innerHTML = html`
    <div class="stack">
      <div class="card__head"><h2>Dashboard</h2><span class="muted small">${formatLong(today)}</span></div>
      <div class="grid grid--kpi">
        ${tile('Rooms occupied', (d) => d.r.rooms_occupied, fmt.int)}
        ${tile('Occupancy', (d) => d.k.occupancy, fmt.pct)}
        ${tile('Guests / sleepers', (d) => d.r.guests_total, fmt.int)}
        ${tile('Rooms revenue', (d) => d.r.rooms_revenue_gbp, fmt.gbp, 'gold')}
        ${tile('ADR', (d) => d.k.adr, fmt.gbp2, 'gold')}
        ${tile('RevPAR', (d) => d.k.revpar, fmt.gbp2, 'gold')}
        ${tile('Rev vs budget', (d) => d.k.budget.pct, fmt.pct, 'gold')}
        ${tile('Breakfast', (d) => d.r.breakfast_covers, fmt.int)}
        ${tile('Lunch', (d) => d.r.lunch_covers, fmt.int)}
        ${tile('Dinner', (d) => d.r.dinner_covers, fmt.int)}
        ${tile('Walk-ins', (d) => d.r.dinner_walkins, fmt.int)}
      </div>
      <div class="grid grid--2">
        <div class="card"><h3>VIP / special notes</h3><p class="muted">${days[1].r.vip_notes || 'None'}</p></div>
        <div class="card"><h3>Maintenance / H&amp;S</h3><p class="muted">${days[1].r.maintenance_notes || 'None'}</p></div>
      </div>
      <div class="card">
        <h3>Next 3 days at a glance</h3>
        <p class="muted small">TODO(feature): rooms booked, guests, breakfast / lunch / dinner / afternoon tea / funeral tea covers.</p>
      </div>
    </div>`;
}
