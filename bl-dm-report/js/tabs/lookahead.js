// 3-Day Look-ahead: rooms forecast + restaurant bookings by service × area for today+1..+3.
import { html } from '../core/dom.js';

export function render(el) {
  el.innerHTML = html`
    <div class="card">
      <h2>3-Day Look-ahead</h2>
      <p class="muted small">TODO(feature): rooms booked / guests est., covers by service (Lunch, Dinner, Afternoon Tea, Funeral Tea + custom) × area (Bar, Dining Room, Lounge, Dee Room + custom).</p>
    </div>`;
}
