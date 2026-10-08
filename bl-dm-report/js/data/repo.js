// Table-level persistence. Each function is a no-op (returns null) when offline.
// Column names follow the existing Supabase schema (see sql/schema.sql).
import { getClient } from './client.js';

const db = () => getClient();

/* ── dm_daily_report ───────────────────────────────── */
export async function saveDaily(report) {
  if (!db()) return null;
  // TODO(feature): upsert on report_date
  throw new Error('saveDaily not implemented yet');
}
export async function loadDailyRange(fromDate, toDate) {
  if (!db()) return null;
  // TODO(feature): select * where report_date between from/to
  throw new Error('loadDailyRange not implemented yet');
}

/* ── rooms_booking_forecast ────────────────────────── */
export async function saveForecast(date, { rooms_booked, guests_est }) {
  if (!db()) return null;
  throw new Error('saveForecast not implemented yet');
}

/* ── restaurant_booking + lookups ──────────────────── */
export async function loadLookups() {
  if (!db()) return null;
  // TODO(feature): restaurant_service_type, restaurant_area
  throw new Error('loadLookups not implemented yet');
}
export async function saveBookings(date, byServiceArea) {
  if (!db()) return null;
  throw new Error('saveBookings not implemented yet');
}

/* ── dm_weekly_stats ───────────────────────────────── */
export async function saveSeason(season, data) {
  if (!db()) return null;
  throw new Error('saveSeason not implemented yet');
}
export async function loadSeason(season) {
  if (!db()) return null;
  throw new Error('loadSeason not implemented yet');
}
