// Bootstrap: router, store subscriptions, Supabase auto-connect, service worker.
import { initRouter, onTabShow } from './core/router.js';
import { getState, subscribe } from './core/store.js';
import { formatLong } from './core/dates.js';
import { autoConnect, onConnectionChange } from './data/client.js';
import * as dashboard from './tabs/dashboard.js';
import * as today from './tabs/today.js';
import * as lookahead from './tabs/lookahead.js';
import * as weekly from './tabs/weekly.js';
import * as admin from './tabs/admin.js';

const tabs = { dashboard, today, lookahead, weekly, admin };
const panel = (name) => document.getElementById(`panel-${name}`);

for (const [name, mod] of Object.entries(tabs)) onTabShow(name, () => mod.render(panel(name)));

// Dashboard and Weekly are always rendered so print works from any tab.
function renderAlwaysOn() {
  dashboard.render(panel('dashboard'));
  weekly.render(panel('weekly'));
  document.getElementById('hdr-date').textContent = formatLong(getState().currentDate);
}
subscribe(renderAlwaysOn);

onConnectionChange((online) => {
  const b = document.getElementById('conn-badge');
  b.dataset.state = online ? 'online' : 'offline';
  b.textContent = online ? 'Synced' : 'Offline';
});

renderAlwaysOn();
initRouter();
autoConnect();

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW registration failed', e));
}
