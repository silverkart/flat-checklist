import { html } from '../core/dom.js';

/** Number stepper markup: [−][ value ][+]. Wire with bindSteppers(root). */
export function stepper({ id, label, value = '', min = 0, max = 999 }) {
  return html`
    <div class="field">
      <label for="${id}">${label}</label>
      <div class="stepper" data-stepper>
        <button type="button" data-step="-1" aria-label="Decrease">−</button>
        <input id="${id}" name="${id}" type="number" inputmode="numeric" min="${min}" max="${max}" value="${value}" />
        <button type="button" data-step="1" aria-label="Increase">+</button>
      </div>
    </div>`;
}

export function bindSteppers(root) {
  root.querySelectorAll('[data-stepper]').forEach((el) => {
    const input = el.querySelector('input');
    el.querySelectorAll('[data-step]').forEach((btn) => btn.addEventListener('click', () => {
      const min = Number(input.min), max = Number(input.max);
      const next = Math.min(max, Math.max(min, (Number(input.value) || 0) + Number(btn.dataset.step)));
      input.value = next;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }));
  });
}
