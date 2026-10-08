/** Tiny tagged-template helper: html`<p>${x}</p>` with escaping of interpolated values. */
export function html(strings, ...values) {
  return strings.reduce((out, s, i) => out + s + (i < values.length ? render(values[i]) : ''), '');
}

/** Mark a string as trusted (already-built HTML) so html`` won't escape it. */
export function raw(s) { return { __raw: String(s) }; }

function render(v) {
  if (v === null || v === undefined || v === false) return '';
  if (Array.isArray(v)) return v.map(render).join('');
  if (typeof v === 'object' && '__raw' in v) return v.__raw;
  return escape(String(v));
}

export function escape(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

let toastTimer;
export function toast(msg, kind = 'info') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.dataset.kind = kind;
  el.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.hidden = true; }, 3000);
}
