// Today: daily report form + Import Reports + Save / Export.
import { html, raw, toast } from '../core/dom.js';
import { getState, getDaily } from '../core/store.js';
import { stepper, bindSteppers } from '../ui/stepper.js';
import { TOTAL_ROOMS } from '../config.js';
import { importFiles } from '../importers/index.js';

export function render(el) {
  const date = getState().currentDate;
  const r = getDaily(date);

  el.innerHTML = html`
    <form class="stack" id="today-form" autocomplete="off">
      <div class="card">
        <div class="card__head">
          <h2>Today</h2>
          <div class="actions">
            <label class="btn btn--gold">Import Reports
              <input type="file" id="import-files" multiple accept=".xls,.xlsx,.pdf,.csv" hidden />
            </label>
          </div>
        </div>
        <div class="grid grid--2">
          <div class="field"><label for="report_date">Date</label><input id="report_date" type="date" value="${date}" /></div>
          <div class="field"><label for="duty_manager">Duty manager</label><input id="duty_manager" value="${r.duty_manager || ''}" /></div>
          ${raw(stepper({ id: 'rooms_occupied', label: `Rooms occupied (of ${TOTAL_ROOMS})`, value: r.rooms_occupied ?? '', max: TOTAL_ROOMS }))}
          ${raw(stepper({ id: 'guests_total', label: 'Guests / sleepers', value: r.guests_total ?? '' }))}
        </div>
        <p class="muted small">TODO(feature): revenue, budget, auto ADR/RevPAR/occupancy, covers, walk-ins, notes, Save + Export.</p>
      </div>
    </form>`;

  bindSteppers(el);
  el.querySelector('#import-files').addEventListener('change', async (e) => {
    const { ok, failed } = await importFiles(e.target.files);
    e.target.value = '';
    if (ok.length) toast(`Imported ${ok.length} file(s)`);
    failed.forEach((f) => toast(`${f.name}: ${f.error}`, 'error'));
    render(el); // show imported values in the form
  });
}
