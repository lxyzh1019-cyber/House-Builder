// Rules table (SPEC R12): every value the size engine uses, with unit, source, evidence tag and date.
// E1 own experience · E2 a quote or spec sheet with its source · E3 general knowledge (a starting value).
// A row older than 2 years is flagged for refresh. Projects may override `value` per row.
import PRESETS from './data/presets.json'
// Size rows come from src/data/presets.json (SPEC v1.3 §6.3–6.4, chat-D36); their ids are the JSON keys.
const V13 = 'SPEC v1.3 §6.3–6.4 starting value'
const SIZE_ROWS = [
  ['walkway_main', 'Main walkway', 'ft'], ['walkway_side', 'Side walkway', 'ft'], ['shared_strip', 'Rear walkway strip left when open to a neighbour', 'ft'],
  ['tv_factor', 'Seat to TV screen (x screen diagonal)', '× diagonal'], ['tv_factor_low', 'Seat to TV screen, low end of the range', '× diagonal'], ['tv_factor_high', 'Seat to TV screen, high end of the range', '× diagonal'],
  ['tv_band', 'TV band (screen off the wall)', 'ft'], ['eye_to_sofa_back', 'Eye to sofa back', 'ft'], ['seat_depth', 'Sofa or seat-group depth', 'ft'],
  ['desk_depth', 'Desk depth', 'ft'], ['desk_chair', 'Desk chair space behind each desk', 'ft'], ['shelf_depth', 'Shelf wall depth', 'ft'],
  ['dining_chair', 'Dining chair space on every side of the table', 'ft'], ['bed_side_zone', 'Bed side zone (nightstand at the head end)', 'ft'], ['bed_foot_walkway', 'Bed foot walkway', 'ft'],
  ['dresser_depth', 'Dresser depth', 'ft'], ['closet_depth', 'Closet depth', 'ft'], ['locker_depth', 'Mudroom locker depth', 'ft'],
  ['door_zone', 'Mudroom door zone width', 'ft'], ['bench_depth', 'Mudroom bench depth', 'ft'], ['sofa_bed_open', 'Sofa bed open length', 'ft'], ['sofa_bed_width', 'Sofa bed width', 'ft'],
].map(([id, label, unit]) => ({ id, label, value: PRESETS.rules[id], unit, tag: 'E3', date: '2026-11-06', source: V13 }))

export const RULES = [
  ...SIZE_ROWS,
  { id: 'facingSeats', label: 'Seats facing each other, no TV', value: 8, unit: 'ft apart', tag: 'E3', date: '2026-11-06', source: 'SPEC v1.3 §6.3 (kept for the later no-TV preset)' },
  { id: 'rateLow', label: 'Build rate, low', value: 175, unit: 'C$/ft²', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §6 R7 default' },
  { id: 'rateHigh', label: 'Build rate, high', value: 275, unit: 'C$/ft²', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §6 R7 default' },
  { id: 'lotW', label: 'Lot width (new project)', value: 60, unit: 'ft', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §7 default' },
  { id: 'lotD', label: 'Lot depth (new project)', value: 100, unit: 'ft', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §7 default' },
  { id: 'lotSnap', label: 'Lot board snap', value: 2, unit: 'ft', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §7' },
  { id: 'edgeSnap', label: 'Snap to a neighbour room edge within', value: 1, unit: 'ft', tag: 'E3', date: '2026-11-05', source: 'Assumed starting value (Claude, 2026-11-05) so rooms can touch when sizes are not whole 2 ft steps' },
  { id: 'traceTol', label: 'Plan trace: a size may differ from the drawing by', value: 3, unit: 'in', tag: 'E3', date: '2026-11-05', source: 'Assumed starting value (Claude, 2026-11-05), plan approved by the owner; replace with a sourced row' },
]

// Rule ids saved before v1.3 -> their v1.3 ids (a project's own values carry over). Rows v1.3 dropped
// (TV stand zone, seat gap, size step, office 10 ft side, the 2.5 ft strip) are left out.
export const OLD_RULE_IDS = { walkway: 'walkway_main', tvRatio: 'tv_factor', deskChair: 'desk_chair', shelfWall: 'shelf_depth', diningChair: 'dining_chair', sofaBedOpen: 'sofa_bed_open', bedSide: 'bed_side_zone' }
export function migrateRules(overrides = {}) {
  const out = {}
  for (const [k, v] of Object.entries(overrides)) {
    if (OLD_RULE_IDS[k]) { if (!(OLD_RULE_IDS[k] in overrides)) out[OLD_RULE_IDS[k]] = v }
    else if (RULES.some((r) => r.id === k)) out[k] = v
  }
  return out
}

export const REFRESH_YEARS = 2
export function needsRefresh(row, today = new Date()) {
  const d = new Date(row.date)
  return (today - d) / (365.25 * 24 * 3600 * 1000) > REFRESH_YEARS
}

// Values keyed by id, with a project's overrides applied ({ walkway: 3.5, ... }).
export function ruleValues(overrides = {}) {
  const v = {}
  for (const r of RULES) v[r.id] = Number.isFinite(overrides[r.id]) ? overrides[r.id] : r.value
  return v
}
