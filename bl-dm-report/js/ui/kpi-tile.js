import { html } from '../core/dom.js';

/** KPI tile: big "today" value with yesterday · tomorrow underneath. Values are pre-formatted strings. */
export function kpiTile({ label, yesterday, today, tomorrow, accent }) {
  return html`
    <div class="kpi ${accent === 'gold' ? 'kpi--gold' : ''}">
      <div class="kpi__label">${label}</div>
      <div class="kpi__value">${today}</div>
      <div class="kpi__trio"><span>Yest <b>${yesterday}</b></span><span>Tmrw <b>${tomorrow}</b></span></div>
    </div>`;
}
