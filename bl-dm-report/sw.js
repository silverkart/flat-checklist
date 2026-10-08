// Offline support: precache the app shell; cache CDN libs and fonts on first use.
// Bump VERSION whenever any shell file changes.
const VERSION = 'v1';
const SHELL = `bl-dm-shell-${VERSION}`;
const RUNTIME = `bl-dm-runtime-${VERSION}`;

const SHELL_FILES = [
  './', 'index.html', 'manifest.webmanifest', 'sql/schema.sql',
  'css/tokens.css', 'css/base.css', 'css/components.css', 'css/print.css',
  'js/main.js', 'js/config.js',
  'js/core/store.js', 'js/core/router.js', 'js/core/dom.js', 'js/core/dates.js', 'js/core/format.js', 'js/core/loader.js',
  'js/calc/kpis.js', 'js/data/client.js', 'js/data/repo.js',
  'js/ui/kpi-tile.js', 'js/ui/stepper.js',
  'js/tabs/dashboard.js', 'js/tabs/today.js', 'js/tabs/lookahead.js', 'js/tabs/weekly.js', 'js/tabs/admin.js',
  'js/importers/index.js', 'js/importers/occupancy-xls.js', 'js/importers/occupancy-pdf.js',
  'js/importers/restaurant-csv.js', 'js/importers/weekly-xlsx.js', 'js/export/excel.js',
  'assets/icons/icon.svg',
];
const RUNTIME_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== SHELL && k !== RUNTIME).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;

  // Same-origin shell: network first (fresh deploys), fall back to cache offline.
  if (url.origin === location.origin) {
    e.respondWith(fetch(e.request)
      .then((res) => { const copy = res.clone(); caches.open(SHELL).then((c) => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request, { ignoreSearch: true })));
    return;
  }

  // Pinned CDN libs + fonts: cache first.
  if (RUNTIME_HOSTS.includes(url.hostname)) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone(); caches.open(RUNTIME).then((c) => c.put(e.request, copy)); return res;
    })));
  }
  // Everything else (Supabase API) goes straight to the network.
});
