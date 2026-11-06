// Batch D (SPEC §15): structures the owner fills in. Pure functions; data lives in the project's `plan` field.
import { newIdea, pid } from './plan.js'

// 15.1 Step owners: who leads, which AI, time (h) and cost (C$) on each gate; a stage sums them.
export function stageEffort(steps, gateIds) {
  let hours = 0, cost = 0
  for (const id of gateIds) { const s = steps?.[id] || {}; if (Number.isFinite(s.hours)) hours += s.hours; if (Number.isFinite(s.cost)) cost += s.cost }
  return { hours, cost }
}

// 15.2 Pain points (Stage 1).
export const HOW_OFTEN = ['daily', 'weekly', 'rarely']
export const newPain = () => ({ id: pid('pp'), roomId: null, text: '', often: 'daily', who: '', sent: false })
// Send a pain point to the idea inbox once: it arrives as captured, tagged with its room name.
export function sendPain(pains, ideas, painId, by, roomName = '') {
  const p = pains.find((x) => x.id === painId)
  if (!p || p.sent || !p.text.trim()) return { pains, ideas }
  return { pains: pains.map((x) => (x.id === painId ? { ...x, sent: true } : x)), ideas: [...ideas, newIdea(p.text.trim(), by, roomName)] }
}

// 15.3 Pictures we like: the style profile is the tags counted, highest first (ties keep the order first seen).
export const newPicture = () => ({ id: pid('pic'), source: '', roomId: null, tags: [] })
export function styleProfile(pictures) {
  const count = new Map()
  for (const p of pictures || []) for (const raw of p.tags || []) { const tag = raw.trim().toLowerCase(); if (tag) count.set(tag, (count.get(tag) || 0) + 1) }
  return [...count.entries()].map(([tag, n]) => ({ tag, n })).sort((a, b) => b.n - a.n)
}

// 15.4 Lot checklist for buying the lot: starts with the checked Red Deer items (SPEC §14), plus the owner's own.
export const LOT_START = ['zone', 'title', 'soils', 'setbacks', 'grade']
export const ITEM_STATES = ['open', 'done', 'na']
export const newLotItem = (text = '') => ({ id: pid('li'), text, status: 'open', note: '' })

// 15.5 Design sprints D4a–D4g: the 7 Stage 2 sprints of SPEC §1, in that order.
export const SPRINTS = [
  { id: 'D4a', key: 'layout' }, { id: 'D4b', key: 'kitchen' }, { id: 'D4c', key: 'hidden' }, { id: 'D4d', key: 'exterior' },
  { id: 'D4e', key: 'windows' }, { id: 'D4f', key: 'finishes' }, { id: 'D4g', key: 'furniture' },
]
// A sprint's checks: each covered room's Check my size status, and the §14.1 code items still open.
export function sprintChecks(sprint, rooms, lotStateById, code, codeItems) {
  const fit = (sprint?.roomIds || []).map((id) => {
    const r = rooms.find((x) => x.id === id), s = lotStateById?.[id]
    return { id, name: r?.name || '', status: !r ? 'gone' : s?.check?.status || 'min' }
  })
  return { fit, openCode: codeItems.filter((c) => (code?.[c.id] || 'open') === 'open').map((c) => c.id) }
}

// 15.6 Design item cards.
export const VERDICTS = ['fits', 'nofit', 'unknown']
export const newItemCard = () => ({ id: pid('ic'), item: '', rulesLimit: '', codeId: null, physicalLimit: '', verdict: 'unknown', impactRoomIds: [], proposals: [], keep: null })

// 15.7 Review criteria sheet: total = sum(weight × score) / sum(weights), to 1 decimal; a failed gate replaces the total.
export function sheetTotal(sheet, optionId) {
  const crit = sheet?.criteria || []
  const score = (c) => sheet?.scores?.[`${optionId}|${c.id}`]
  if (crit.some((c) => c.gate && sheet?.gateFail?.[`${optionId}|${c.id}`])) return { failsGate: true, total: null }
  let w = 0, s = 0
  for (const c of crit) { const v = score(c); if (Number.isFinite(c.weight) && c.weight > 0 && Number.isFinite(v)) { w += c.weight; s += c.weight * v } }
  return { failsGate: false, total: w > 0 ? Math.round((s / w) * 10) / 10 : null }
}
export const newSheet = () => ({ id: pid('rs'), context: '', criteria: [], options: [], scores: {}, gateFail: {}, conditions: '', costScore: null })

// 15.8 Systems fine-tune checklist: the 9 lines of the SPEC §12 row.
export const SYSTEMS = ['smart', 'hvac', 'radon', 'filters', 'humidity', 'efficiency', 'ev', 'solar', 'sound']

// 15.9 Work packages.
export const SUPPLIERS = ['builder', 'owner', 'trade']
export const newPackage = () => ({ id: pid('wp'), trade: '', scope: '', allowance: null, supplier: 'builder', diy: false })
export const allowanceTotal = (pkgs) => (pkgs || []).reduce((a, p) => a + (Number.isFinite(p.allowance) ? p.allowance : 0), 0)

// 15.10 Builder price against the budget's build range and goal.
export function priceCheck(price, bs) {
  if (!Number.isFinite(price)) return null
  return { aboveHigh: price > bs.build.hi + 1e-9, belowLow: price < bs.build.lo - 1e-9, overGoal: Number.isFinite(bs.left?.hi) ? price > bs.build.hi + bs.left.hi : false }
}

// 15.11 Possession walk: open items per room.
export const newWalkItem = (roomId, text = '') => ({ id: pid('pw'), roomId, text, fixed: false, date: null })
export const openWalkItems = (items, roomId) => (items || []).filter((i) => !i.fixed && (roomId == null || i.roomId === roomId)).length

// 15.12 Lego soft checks (warnings only; each can be turned off). Footprints are lot-board footprints in ft.
export const WET = new Set(['kitchen', 'backkitchen']) // bathroom and laundry join when those room types exist
const touch = (a, b, eps = 0.05) => {
  const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(a.y + a.d, b.y + b.d) - Math.max(a.y, b.y)
  return (ox > eps && (Math.abs(a.y + a.d - b.y) < eps || Math.abs(b.y + b.d - a.y) < eps)) || (oy > eps && (Math.abs(a.x + a.w - b.x) < eps || Math.abs(b.x + b.w - a.x) < eps))
}
const over = (a, b) => Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x) > 0.05 && Math.min(a.y + a.d, b.y + b.d) - Math.max(a.y, b.y) > 0.05
// Wet rooms on the lot that neither touch another wet room on their level nor sit over or under one.
export function lonelyWetRooms(rooms, st) {
  const wet = rooms.filter((r) => WET.has(r.type) && st?.[r.id]?.fp)
  const lvl = (r) => r.level || 'main'
  return wet.filter((a) => !wet.some((b) => b !== a && ((lvl(a) === lvl(b) && touch(st[a.id].fp, st[b.id].fp)) || (lvl(a) !== lvl(b) && over(st[a.id].fp, st[b.id].fp))))).map((r) => r.id)
}
// Per level: the bounding rectangle of the placed rooms, the share of it the rooms fill (100% = a rectangle) and the
// rest as the hallway share, shown next to the 12% target with no pass or fail.
export function shapeStats(rooms, st, level = 'main') {
  const fps = rooms.filter((r) => (r.level || 'main') === level && st?.[r.id]?.fp).map((r) => st[r.id].fp)
  if (!fps.length) return null
  const x0 = Math.min(...fps.map((f) => f.x)), x1 = Math.max(...fps.map((f) => f.x + f.w)), y0 = Math.min(...fps.map((f) => f.y)), y1 = Math.max(...fps.map((f) => f.y + f.d))
  const box = (x1 - x0) * (y1 - y0)
  const xs = [...new Set(fps.flatMap((f) => [f.x, f.x + f.w]))].sort((a, b) => a - b), ys = [...new Set(fps.flatMap((f) => [f.y, f.y + f.d]))].sort((a, b) => a - b)
  let filled = 0
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
    const cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2
    if (fps.some((f) => cx > f.x && cx < f.x + f.w && cy > f.y && cy < f.y + f.d)) filled += (xs[i + 1] - xs[i]) * (ys[j + 1] - ys[j])
  }
  return { box, filled, fillPct: (filled / box) * 100, hallPct: ((box - filled) / box) * 100, target: 12 }
}
export const unmarkedRooms = (rooms) => rooms.filter((r) => r.phase !== 'now' && r.phase !== 'later').map((r) => r.id)
