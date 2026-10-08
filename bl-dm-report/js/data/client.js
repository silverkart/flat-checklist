// Supabase connection. Optional: when not connected, every data call is a no-op
// and the app runs from localStorage alone.
import { SUPABASE_CFG_KEY } from '../config.js';
import { loadSupabase } from '../core/loader.js';

let client = null;
const listeners = new Set();

export function getConfig() {
  try { return JSON.parse(localStorage.getItem(SUPABASE_CFG_KEY) || 'null'); } catch { return null; }
}

export function isConnected() { return client !== null; }
export function getClient() { return client; }

export function onConnectionChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }
const notify = () => listeners.forEach((fn) => fn(isConnected()));

/** Connect with { url, anonKey }; saves config and verifies with a cheap query. */
export async function connect({ url, anonKey }) {
  const { createClient } = await loadSupabase();
  const c = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error } = await c.from('dm_daily_report').select('report_date', { head: true, count: 'exact' }).limit(1);
  if (error) throw error;
  client = c;
  localStorage.setItem(SUPABASE_CFG_KEY, JSON.stringify({ url, anonKey }));
  notify();
}

export function disconnect({ forget = false } = {}) {
  client = null;
  if (forget) localStorage.removeItem(SUPABASE_CFG_KEY);
  notify();
}

/** Reconnect on boot if config is saved. Failures are silent (offline is fine). */
export async function autoConnect() {
  const cfg = getConfig();
  if (!cfg?.url || !cfg?.anonKey || !navigator.onLine) return;
  try { await connect(cfg); } catch (e) { console.warn('Supabase auto-connect failed', e); }
}
