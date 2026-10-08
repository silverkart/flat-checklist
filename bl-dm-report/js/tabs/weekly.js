// Weekly Stats: entry grid (Rooms / Food & Bev / Covers views), season KPI strip,
// Excel import, Supabase save. Print shows only the last 2 weeks + season totals.
import { html } from '../core/dom.js';

export function render(el) {
  el.innerHTML = html`
    <div class="card">
      <h2>Weekly Stats</h2>
      <p class="muted small">TODO(feature): season KPI strip, entry grid with Rooms / F&amp;B / Covers views, import from Weekly_Stats workbook.</p>
    </div>`;
}
