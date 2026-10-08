// Admin: Supabase URL + anon key, connect/disconnect, first-time SQL schema.
import { html, toast } from '../core/dom.js';
import { getConfig, connect, disconnect, isConnected } from '../data/client.js';

export async function render(el) {
  const cfg = getConfig() || {};
  el.innerHTML = html`
    <div class="stack">
      <div class="card">
        <h2>Supabase connection</h2>
        <p class="muted small">Optional. Without it, everything is saved on this device only.</p>
        <div class="grid grid--2">
          <div class="field"><label for="sb-url">Project URL</label><input id="sb-url" placeholder="https://xxxx.supabase.co" value="${cfg.url || ''}" /></div>
          <div class="field"><label for="sb-key">Anon (public) key</label><input id="sb-key" type="password" value="${cfg.anonKey || ''}" /></div>
        </div>
        <div class="actions" style="margin-top:12px">
          <button class="btn btn--primary" id="sb-connect">${isConnected() ? 'Reconnect' : 'Connect'}</button>
          <button class="btn" id="sb-disconnect" ${isConnected() ? '' : 'disabled'}>Disconnect</button>
        </div>
      </div>
      <div class="card">
        <h3>First-time setup SQL</h3>
        <p class="muted small">Run once in the Supabase SQL editor.</p>
        <textarea class="input" id="sb-sql" rows="12" readonly style="font-family:ui-monospace,monospace;font-size:12px"></textarea>
      </div>
    </div>`;

  el.querySelector('#sb-connect').addEventListener('click', async () => {
    try {
      await connect({ url: el.querySelector('#sb-url').value.trim(), anonKey: el.querySelector('#sb-key').value.trim() });
      toast('Connected to Supabase');
    } catch (e) { toast(`Connect failed: ${e.message}`, 'error'); }
    render(el);
  });
  el.querySelector('#sb-disconnect').addEventListener('click', () => { disconnect(); render(el); });

  try { el.querySelector('#sb-sql').value = await (await fetch('sql/schema.sql')).text(); } catch { /* offline */ }
}
