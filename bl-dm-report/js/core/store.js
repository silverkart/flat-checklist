// Single source of truth. Every tab reads from here and re-renders on change.
// The store is persisted to localStorage so the app works fully offline;
// Supabase (js/data/) is an optional sync layer on top.

import { STORAGE_KEY, DEFAULT_SERVICE_TYPES, DEFAULT_AREAS } from '../config.js';
import { todayISO } from './dates.js';

/**
 * State shape
 * {
 *   currentDate: 'YYYY-MM-DD',
 *   daily:    { [date]: DailyReport },                       // dm_daily_report
 *   forecast: { [date]: { rooms_booked, guests_est } },      // rooms_booking_forecast
 *   bookings: { [date]: { [service]: { [area]: covers } } }, // restaurant_booking
 *   lookups:  { serviceTypes: string[], areas: string[] },   // restaurant_service_type / restaurant_area
 *   weekly:   { [season]: SeasonData },                      // dm_weekly_stats
 * }
 *
 * DailyReport = { report_date, duty_manager, rooms_occupied, guests_total,
 *   rooms_revenue_gbp, budget_revenue_gbp, breakfast_covers, lunch_covers,
 *   dinner_covers, dinner_walkins, vip_notes, maintenance_notes }
 */
function initialState() {
  return {
    currentDate: todayISO(),
    daily: {},
    forecast: {},
    bookings: {},
    lookups: { serviceTypes: [...DEFAULT_SERVICE_TYPES], areas: [...DEFAULT_AREAS] },
    weekly: {},
  };
}

let state = load();
const listeners = new Set();

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    // currentDate always starts at today on a fresh load.
    return saved ? { ...initialState(), ...saved, currentDate: todayISO() } : initialState();
  } catch {
    return initialState();
  }
}

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* quota / private mode */ }
}

export function getState() { return state; }

/** Apply a mutation: update(s => { s.daily[d] = {...} }). Persists and notifies. */
export function update(mutator) {
  const next = structuredClone(state);
  mutator(next);
  state = next;
  persist();
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ── Convenience selectors ─────────────────────────── */
export const getDaily = (date) => state.daily[date] || { report_date: date };
export const getForecast = (date) => state.forecast[date] || {};
export const getBookings = (date) => state.bookings[date] || {};
