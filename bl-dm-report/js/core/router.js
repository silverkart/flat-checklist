// Tab navigation. The active tab is mirrored in the URL hash (#today etc.).
import { $$ } from './dom.js';

const TABS = ['dashboard', 'today', 'lookahead', 'weekly', 'admin'];
const onShow = new Map();

/** Register a callback fired each time a tab becomes visible. */
export function onTabShow(tab, fn) { onShow.set(tab, fn); }

export function showTab(tab) {
  if (!TABS.includes(tab)) tab = 'dashboard';
  $$('.tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  $$('.panel').forEach((p) => { p.hidden = p.dataset.panel !== tab; });
  if (location.hash !== `#${tab}`) history.replaceState(null, '', `#${tab}`);
  onShow.get(tab)?.();
}

export function initRouter() {
  $$('.tab').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));
  window.addEventListener('hashchange', () => showTab(location.hash.slice(1)));
  showTab(location.hash.slice(1));
}
