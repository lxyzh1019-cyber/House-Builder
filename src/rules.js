// Rules table (SPEC R12): every value the size engine uses, with unit, source, evidence tag and date.
// E1 own experience · E2 a quote or spec sheet with its source · E3 general knowledge (a starting value).
// A row older than 2 years is flagged for refresh. Projects may override `value` per row.
export const RULES = [
  { id: 'walkway', label: 'Main walkway', value: 3, unit: 'ft', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §6 starting value' },
  { id: 'tvRatio', label: 'Seat to TV screen (x screen diagonal)', value: 1.4, unit: '× diagonal', tag: 'E3', date: '2026-11-04', source: 'THX 40°, SMPTE 30° (range 1.2–1.6); SPEC v1 §6' },
  { id: 'facingSeats', label: 'Seats facing each other, no TV', value: 8, unit: 'ft apart', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §6 starting value' },
  { id: 'deskChair', label: 'Desk chair space behind each desk', value: 3, unit: 'ft', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §6 starting value' },
  { id: 'shelfWall', label: 'Shelf wall depth', value: 1, unit: 'ft', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §6 starting value' },
  { id: 'diningChair', label: 'Dining chair space on every side of the table', value: 3, unit: 'ft', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §6 starting value' },
  { id: 'sofaBedOpen', label: 'Sofa bed open length', value: 6.5, unit: 'ft', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §6 starting value' },
  { id: 'sharedStrip', label: 'Walkway strip saved when open to a neighbour', value: 2.5, unit: 'ft', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §6 R10 and §7' },
  { id: 'rateLow', label: 'Build rate, low', value: 175, unit: 'C$/ft²', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §6 R7 default' },
  { id: 'rateHigh', label: 'Build rate, high', value: 275, unit: 'C$/ft²', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §6 R7 default' },
  { id: 'tvStand', label: 'TV stand zone depth', value: 1.5, unit: 'ft', tag: 'E3', date: '2026-11-05', source: 'chat-D21 (size model, owner approved 2026-11-05)' },
  { id: 'seatGap', label: 'Gap between seat pieces at a corner', value: 0.5, unit: 'ft', tag: 'E3', date: '2026-11-05', source: 'chat-D21 (size model, owner approved 2026-11-05)' },
  { id: 'sizeStep', label: 'Room sizes round up to', value: 0.5, unit: 'ft', tag: 'E3', date: '2026-11-05', source: 'chat-D21 (size model, owner approved 2026-11-05)' },
  { id: 'officeMinSide', label: 'Office: every side at least (bedroom-ready)', value: 10, unit: 'ft', tag: 'E3', date: '2026-11-05', source: 'chat-D22 (office side, owner approved 2026-11-05); see open item L5' },
  { id: 'lotW', label: 'Lot width (new project)', value: 60, unit: 'ft', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §7 default' },
  { id: 'lotD', label: 'Lot depth (new project)', value: 100, unit: 'ft', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §7 default' },
  { id: 'lotSnap', label: 'Lot board snap', value: 2, unit: 'ft', tag: 'E3', date: '2026-11-04', source: 'SPEC v1 §7' },
  { id: 'edgeSnap', label: 'Snap to a neighbour room edge within', value: 1, unit: 'ft', tag: 'E3', date: '2026-11-05', source: 'Assumed starting value (Claude, 2026-11-05) so rooms can touch when sizes are not whole 2 ft steps' },
  { id: 'bedSide', label: 'Walking space beside a bed', value: 2.5, unit: 'ft', tag: 'E3', date: '2026-11-05', source: 'Assumed starting value (Claude, 2026-11-05); replace with a sourced row' },
]

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
