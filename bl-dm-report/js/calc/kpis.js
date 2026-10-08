// Pure KPI calculations — no DOM, no state. Easy to unit-test.
import { TOTAL_ROOMS } from '../config.js';

const ok = (n) => typeof n === 'number' && Number.isFinite(n);

export function occupancyPct(roomsOccupied, totalRooms = TOTAL_ROOMS) {
  return ok(roomsOccupied) && totalRooms ? (roomsOccupied / totalRooms) * 100 : null;
}

/** Average Daily Rate = rooms revenue / rooms occupied. */
export function adr(roomsRevenue, roomsOccupied) {
  return ok(roomsRevenue) && ok(roomsOccupied) && roomsOccupied > 0 ? roomsRevenue / roomsOccupied : null;
}

/** Revenue per Available Room = rooms revenue / total rooms. */
export function revpar(roomsRevenue, totalRooms = TOTAL_ROOMS) {
  return ok(roomsRevenue) && totalRooms ? roomsRevenue / totalRooms : null;
}

/** Revenue vs budget as { diff, pct }. */
export function vsBudget(actual, budget) {
  if (!ok(actual) || !ok(budget) || budget === 0) return { diff: null, pct: null };
  return { diff: actual - budget, pct: ((actual - budget) / budget) * 100 };
}

/** All derived KPIs for one DailyReport. */
export function deriveDaily(r = {}) {
  return {
    occupancy: occupancyPct(r.rooms_occupied),
    adr: adr(r.rooms_revenue_gbp, r.rooms_occupied),
    revpar: revpar(r.rooms_revenue_gbp),
    budget: vsBudget(r.rooms_revenue_gbp, r.budget_revenue_gbp),
  };
}
