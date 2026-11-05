import { FURNISH2_LIBRARY } from './furnish2-library.js'
import { ftToMm } from '../units.js'

const inMm = (inch) => Math.round(inch * 25.4)
// TV width from its diagonal (16:9 screen): width = diagonal x 16 / sqrt(16² + 9²).
export const tvWidthMm = (diagIn) => inMm((diagIn * 16) / Math.hypot(16, 9))

// Items this app adds (North American sizes and items the room questions need). Not from Furnish2.
const APP_ITEMS = [
  { id: 'app-queen', type: 'bed', name: 'Queen Bed', category: 'Bedroom', w: inMm(60), d: inMm(80) },
  { id: 'app-king', type: 'bed', name: 'King Bed', category: 'Bedroom', w: inMm(76), d: inMm(80) },
  { id: 'app-twin', type: 'bed', name: 'Twin Bed', category: 'Bedroom', w: inMm(39), d: inMm(75) },
  { id: 'app-full', type: 'bed', name: 'Full Bed', category: 'Bedroom', w: inMm(54), d: inMm(75) },
  { id: 'app-desk4', type: 'desk', name: 'Desk 4 ft', category: 'Study & Leisure', w: Math.round(ftToMm(4)), d: inMm(30) },
  { id: 'app-desk5', type: 'desk', name: 'Desk 5 ft', category: 'Study & Leisure', w: Math.round(ftToMm(5)), d: inMm(30) },
  { id: 'app-desk6', type: 'desk', name: 'Desk 6 ft', category: 'Study & Leisure', w: Math.round(ftToMm(6)), d: inMm(30) },
  { id: 'app-shelfwall', type: 'bookshelf', name: 'Shelf Wall', category: 'Study & Leisure', w: Math.round(ftToMm(6)), d: Math.round(ftToMm(1)) },
  { id: 'app-table8', type: 'table', name: '8-Seat Dining Table', category: 'Dining & Kitchen', w: 2400, d: 1000 },
  { id: 'app-locker', type: 'cabinet', name: 'Locker (per person)', category: 'Entry', w: inMm(15), d: inMm(18) },
  ...[55, 65, 75, 85].map((d) => ({ id: `app-tv${d}`, type: 'tv', name: `${d}" TV`, category: 'Appliances', w: tvWidthMm(d), d: 80, diagIn: d })),
]

export const LIBRARY = [...FURNISH2_LIBRARY, ...APP_ITEMS]
export const byId = (id) => LIBRARY.find((i) => i.id === id)
export const byName = (name) => LIBRARY.find((i) => i.name === name)
