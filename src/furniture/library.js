import { FURNISH2_LIBRARY } from './furnish2-library.js'
import { ftToMm } from '../units.js'

const inMm = (inch) => Math.round(inch * 25.4)
const ft = (f) => Math.round(ftToMm(f))
// TV width from its diagonal (16:9 screen): width = diagonal x 16 / sqrt(16² + 9²).
export const tvWidthMm = (diagIn) => inMm((diagIn * 16) / Math.hypot(16, 9))

// Items this app adds (North American sizes and items the room questions need). Not from Furnish2.
const APP_ITEMS = [
  { id: 'app-queen', type: 'bed', name: 'Queen Bed', category: 'Bedroom', w: inMm(60), d: inMm(80) },
  { id: 'app-king', type: 'bed', name: 'King Bed', category: 'Bedroom', w: inMm(76), d: inMm(80) },
  { id: 'app-twin', type: 'bed', name: 'Twin Bed', category: 'Bedroom', w: inMm(38), d: inMm(75) },
  { id: 'app-full', type: 'bed', name: 'Full Bed', category: 'Bedroom', w: inMm(54), d: inMm(75) },
  { id: 'app-desk4', type: 'desk', name: 'Desk 4 ft', category: 'Study & Leisure', w: Math.round(ftToMm(4)), d: inMm(30) },
  { id: 'app-desk5', type: 'desk', name: 'Desk 5 ft', category: 'Study & Leisure', w: Math.round(ftToMm(5)), d: inMm(30) },
  { id: 'app-desk6', type: 'desk', name: 'Desk 6 ft', category: 'Study & Leisure', w: Math.round(ftToMm(6)), d: inMm(30) },
  { id: 'app-shelfwall', type: 'bookshelf', name: 'Shelf Wall', category: 'Study & Leisure', w: Math.round(ftToMm(6)), d: Math.round(ftToMm(1)) },
  { id: 'app-table8', type: 'table', name: '8-Seat Dining Table', category: 'Dining & Kitchen', w: 2400, d: 1000 },
  { id: 'app-locker', type: 'cabinet', name: 'Locker (per person)', category: 'Entry', w: inMm(15), d: inMm(18) },
  // Band parts (SPEC v1.3 §6.3–6.4): sizes the band rules give, so a preset's items fill its bands exactly.
  { id: 'app-seats-4', type: 'sofa', name: 'Seat group, 4 seats (L-sectional)', category: 'Living Room', w: ft(10.5), d: ft(3) },
  { id: 'app-seats-6-8', type: 'sofa', name: 'Seat group, 6–8 seats (L-sectional + 2 chairs)', category: 'Living Room', w: ft(12), d: ft(3) },
  { id: 'app-seats-10+', type: 'sofa', name: 'Seat group, 10+ seats', category: 'Living Room', w: ft(14), d: ft(3) },
  { id: 'app-sofabed', type: 'sofa', name: 'Sofa Bed (7 ft, opens 6.5 ft)', category: 'Living Room', w: ft(7), d: ft(3) },
  { id: 'app-table-4', type: 'table', name: 'Dining table, 4 seats', category: 'Dining & Kitchen', w: ft(4), d: ft(3) },
  { id: 'app-table-6', type: 'table', name: 'Dining table, 6 seats', category: 'Dining & Kitchen', w: ft(6), d: ft(3) },
  { id: 'app-table-8', type: 'table', name: 'Dining table, 8 seats', category: 'Dining & Kitchen', w: ft(8), d: ft(3.5) },
  { id: 'app-dresser', type: 'dresser', name: 'Dresser (20 in deep)', category: 'Bedroom', w: ft(5), d: inMm(20) },
  { id: 'app-closet', type: 'wardrobe', name: 'Closet (2 ft deep)', category: 'Bedroom', w: ft(6), d: ft(2) },
  { id: 'app-kiddesk', type: 'desk', name: 'Kid desk 4 x 2 ft', category: 'Study & Leisure', w: ft(4), d: ft(2) },
  { id: 'app-bench', type: 'bench', name: 'Mudroom bench', category: 'Entry', w: ft(4), d: ft(1.5) },
  { id: 'app-boottray', type: 'cabinet', name: 'Boot tray', category: 'Entry', w: inMm(30), d: inMm(15) },
  ...[55, 65, 75, 85].map((d) => ({ id: `app-tv${d}`, type: 'tv', name: `${d}" TV`, category: 'Appliances', w: tvWidthMm(d), d: 80, diagIn: d })),
]

export const LIBRARY = [...FURNISH2_LIBRARY, ...APP_ITEMS]
export const byId = (id) => LIBRARY.find((i) => i.id === id)
export const byName = (name) => LIBRARY.find((i) => i.name === name)
