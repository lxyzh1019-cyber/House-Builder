// Size engine (SPEC v1.3 §6.1–6.2: R4–R7, R15; chat-D16, chat-D36, chat-D42). Pure functions, no React,
// no Pascal. Sizes in ft unless named *Mm; items carry mm sizes (the furniture library's unit).
import { ruleValues } from '../rules.js'
import { ftToMm, mmToFt } from '../units.js'
import { arrangement, isShared, OPTIONS, placeBands } from './bands.js'

export { isShared }
export const ROOM_PLAIN = new Set(['garage', 'kitchen', 'backkitchen'])
const EPS = 1e-9
const plainSize = (room) => (room.size ? { w: room.size.w / 0.3048, d: room.size.d / 0.3048 } : { w: 0, d: 0 })
const sizeOf = (room, band) => (room.size ? { w: room.size.w / 0.3048, d: room.size.d / 0.3048 } : { w: band.w, d: band.d })
// The user moved, added or resized an item: the minimum is then the arrangement as placed (R4, chat-D42).
export const isPlaced = (room) => room.items.some((i) => i.pos || i.byHand || i.edited)

// Clearance an item carries when moved (chat-D42), in ft on its own sides: [left, right, back, front].
function carried(it, R, type) {
  if (it.part === 'desk' || it.part === 'kid_desk') return [0, 0, 0, R.desk_chair]
  if (it.part === 'table') return [R.dining_chair, R.dining_chair, R.dining_chair, R.dining_chair]
  if (it.part === 'bed' && type === 'primary') return [R.bed_side_zone, R.bed_side_zone, 0, R.bed_foot_walkway]
  if (it.part === 'bed' && type === 'kid') return [0, R.bed_side_zone, 0, 0]
  return [0, 0, 0, 0]
}
// Zones that move with their item instead of staying where the preset put them.
const CARRIED_ZONES = new Set(['desk_chair', 'chair_space', 'chair_zone', 'side_zone', 'bed_foot_walkway'])

// An item's box on the room floor (mm) with the clearance it carries, turned with the item.
function box(it, p, R, type) {
  const [l, r, t, b] = carried(it, R, type).map(ftToMm)
  const rot = ((p.rot || 0) % 360 + 360) % 360
  const [L, Rr, T, B] = rot === 90 ? [b, t, l, r] : rot === 180 ? [r, l, b, t] : rot === 270 ? [t, b, r, l] : [l, r, t, b]
  const hw = (rot % 180 === 0 ? it.w : it.d) / 2, hh = (rot % 180 === 0 ? it.d : it.w) / 2
  return { x0: p.cx - hw - L, x1: p.cx + hw + Rr, y0: p.cy - hh - T, y1: p.cy + hh + B }
}

// R4: the band minimum (chat-D36), or, once items are moved, the bounding rectangle of the items with the
// clearance each carries and the walkways where the preset put them (chat-D42). No rounding (SPEC §4).
export function minimumSize(room, overrides, ctx) {
  if (ROOM_PLAIN.has(room.type)) { const s = plainSize(room); return { ...s, band: s } }
  const R = ruleValues(overrides)
  const arr = arrangement(room, R, ctx)
  const band = { w: arr.w, d: arr.d }
  if (!isPlaced(room)) return { ...band, band }
  const S = sizeOf(room, band)
  const { place, fixed } = layoutRoom(room, S.w, S.d, overrides, ctx)
  const boxes = [...fixed, ...room.items.map((it) => box(it, place[it.id], R, room.type))]
  const x0 = Math.min(...boxes.map((b) => b.x0)), x1 = Math.max(...boxes.map((b) => b.x1))
  const y0 = Math.min(...boxes.map((b) => b.y0)), y1 = Math.max(...boxes.map((b) => b.y1))
  return { w: mmToFt(x1 - x0), d: mmToFt(y1 - y0), band, placed: true }
}

// chat-D16: a plain rectangle, tried either way round. Returns the orientation with the smaller shortfall.
function compare(min, W, D) {
  const a = { turned: false, shortW: Math.max(0, min.w - W), shortD: Math.max(0, min.d - D) }
  const b = { turned: true, shortW: Math.max(0, min.d - W), shortD: Math.max(0, min.w - D) }
  const tot = (o) => o.shortW + o.shortD
  return tot(b) < tot(a) - EPS ? b : a
}

// Option steps, smallest first (SPEC §6.4), and the optional items that can be left out (SPEC §6.2).
const STEPS = {
  living: { seats: ['4', '6-8', '10+'], tv_in: OPTIONS.tv_in },
  office: { desks: [1, 2], desk_len: OPTIONS.desk_len },
  dining: { seats: ['4', '6', '8'] },
  primary: { bed: ['twin', 'queen', 'king'] },
  kid: { bed: ['twin', 'queen', 'king'] },
  mudroom: { gear: ['normal', 'heavy'] },
}
const OPTIONAL = { office: ['sofa_bed', 'shelf', 'bedroom_ready'], primary: ['dresser'], kid: ['desk'], mudroom: ['bench_opposite'] }
const stepMsg = (type, key, v) => {
  if (key === 'seats') return type === 'living' ? ['chg.seats', { n: v }] : ['chg.table', { n: v }]
  if (key === 'tv_in') return ['chg.tv', { n: v }]
  if (key === 'desks') return ['chg.desks', { n: v }]
  if (key === 'desk_len') return ['chg.desk', { n: v }]
  if (key === 'bed') return [`chg.bed.${v}`]
  if (key === 'gear') return ['chg.gear']
  return ['chg.other']
}

// R6, SPEC §6.2 Smallest changes: for each short side, one change at a time, in this order: (1) the next
// smaller option, (2) the low end of a range rule (seat to TV 1.2x), (3) leaving out an optional item. Every
// single change that closes that side's gap is listed with the side's new size. Walkways and required
// clearances are never offered. Returns [{ side: 'w' | 'd', msg, ft, patch }].
export function smallestChanges(room, W, D, overrides, ctx) {
  if (ROOM_PLAIN.has(room.type)) return []
  const R = ruleValues(overrides)
  const now = arrangement(room, R, ctx)
  const c = compare(now, W, D)
  const target = { w: c.turned ? D : W, d: c.turned ? W : D }
  const o = now.options
  const tries = []
  for (const [key, list] of Object.entries(STEPS[room.type] || {})) {
    const i = list.findIndex((v) => String(v) === String(o[key]))
    if (i > 0) tries.push({ patch: { [key]: list[i - 1] }, msg: stepMsg(room.type, key, list[i - 1]) })
  }
  if (room.type === 'living' && o.tv_factor !== 'low') tries.push({ patch: { tv_factor: 'low' }, msg: ['chg.tvLow', { k: R.tv_factor_low }] })
  for (const key of OPTIONAL[room.type] || []) if (o[key]) tries.push({ patch: { [key]: false }, msg: [`chg.leave.${key}`] })
  const out = []
  for (const side of ['w', 'd']) {
    if (now[side] <= target[side] + EPS) continue
    for (const t of tries) {
      const next = arrangement({ ...room, options: { ...o, ...t.patch } }, R, ctx)
      if (next[side] < now[side] - EPS && next[side] <= target[side] + EPS) out.push({ side, msg: t.msg, ft: next[side], patch: t.patch })
    }
  }
  return out
}

// R5–R7: "Check my size".
export function checkSize(room, W, D, overrides, ctx) {
  const R = ruleValues(overrides)
  const min = minimumSize(room, overrides, ctx)
  const c = compare(min, W, D)
  if (c.shortW > EPS || c.shortD > EPS) {
    return { status: 'too-small', min, W, D, shortW: c.shortW, shortD: c.shortD, turned: c.turned, changes: smallestChanges(room, W, D, overrides, ctx) }
  }
  const spare = W * D - min.w * min.d
  return { status: 'fits', min, W, D, turned: c.turned, spare, costLow: spare * R.rateLow, costHigh: spare * R.rateHigh }
}

// Notes on the room card, as [key, params] for src/i18n.js: egress window (sofa bed or bedroom-ready, R15),
// homework spot (q5.3), boot tray (q4.2), and that building-code minimum areas are not checked yet (SPEC §6.3).
export function roomNotes(room, overrides) {
  if (ROOM_PLAIN.has(room.type)) return []
  const R = ruleValues(overrides)
  const o = room.options || {}
  const notes = []
  if (egressNeeded(room)) notes.push(['note.egress', { ft: R.sofa_bed_open }])
  if (o.homework_spot) notes.push(['note.homework'])
  if (o.boot_tray) notes.push(['note.bootTray'])
  if (o.big_gathering) notes.push(['note.bigGathering'])
  notes.push(['note.codeMin'])
  return notes
}
export const egressNeeded = (room) => !!(room.options?.sofa_bed || room.options?.bedroom_ready)

// Where everything sits in a room of Wft x Dft (mm, origin at the top-left inside corner; x along the
// width, y along the depth, the back wall at y = 0). Returns { place: { [itemId]: { cx, cy, rot } },
// walkways: [{ x, y, w, d, label, kind }], fixed: [boxes of the walkways that stay put], W, D }.
export function layoutRoom(room, Wft, Dft, overrides, ctx) {
  const W = ftToMm(Wft), D = ftToMm(Dft)
  const place = {}, walkways = [], fixed = []
  if (ROOM_PLAIN.has(room.type)) return { place, walkways, fixed, W, D }
  const R = ruleValues(overrides)
  const arr = arrangement(room, R, ctx)
  const { slots, zones } = placeBands(arr, Wft)
  const mm = (z) => ({ x: ftToMm(z.x), y: ftToMm(z.y), w: ftToMm(z.w), d: ftToMm(z.d) })
  for (const z of zones) {
    const r = mm(z)
    walkways.push({ ...r, label: z.kind === 'walk' ? 'walkway' : 'clearance', kind: z.kind, key: z.key })
    if (!CARRIED_ZONES.has(z.key)) fixed.push({ x0: r.x, x1: r.x + r.w, y0: r.y, y1: r.y + r.d })
  }
  const slotOf = (key) => slots.find((s) => `${s.band}/${s.part}/${s.i}` === key)
  const zoneOf = (key, k = 0) => zones.filter((z) => z.key === key)[k]
  const put = (it, cx, cy, rot = 0) => { place[it.id] = { cx: Math.round(cx), cy: Math.round(cy), rot } }
  for (const it of room.items) {
    const s = it.slot && slotOf(it.slot)
    if (s) {
      const r = mm(s)
      // A sofa bed sits closed at the back of its open band.
      const cy = it.part === "sofa_bed" ? r.y + ((it.rot || 0) % 180 === 0 ? it.d : it.w) / 2 : r.y + r.d / 2
      put(it, r.x + r.w / 2, cy, it.rot || 0)
    }
  }
  // Items that sit in a clearance next to another item: desk chairs, dining chairs, nightstands, coffee table, boot tray.
  for (const it of room.items) {
    if (place[it.id] || !it.attach) continue
    const [what, k] = it.attach.split(':'), n = Number(k) || 0
    if (what === 'coffee') { const z = zoneOf('viewing_gap'); if (z) put(it, ftToMm(z.x + z.w / 2), ftToMm(z.y + z.d / 2)) }
    if (what === 'deskchair') {
      const desk = room.items.find((x) => x.part === 'desk' && x.slot?.endsWith(`/${n}`)) || room.items.find((x) => x.part === 'kid_desk')
      const p = desk && place[desk.id]
      if (p && desk.part === 'kid_desk') put(it, p.cx - desk.d / 2 - it.d / 2 - 100, p.cy, 270)
      else if (p) put(it, p.cx, p.cy + desk.d / 2 + it.d / 2 + 100, 0)
    }
    if (what === 'chair') {
      const table = room.items.find((x) => x.part === 'table'), p = table && place[table.id]
      if (p) {
        const per = Math.ceil((it.of || 6) / 2), top = n < per, j = top ? n : n - per
        put(it, p.cx - table.w / 2 + (table.w / per) * (j + 0.5), top ? p.cy - table.d / 2 - it.d / 2 + 120 : p.cy + table.d / 2 + it.d / 2 - 120, top ? 180 : 0)
      }
    }
    if (what === 'nightstand') {
      const bed = room.items.find((x) => x.part === 'bed'), p = bed && place[bed.id]
      if (p) put(it, n === 0 && room.type === 'primary' ? p.cx - bed.w / 2 - it.w / 2 - 50 : p.cx + bed.w / 2 + it.w / 2 + 50, p.cy - bed.d / 2 + it.d / 2)
    }
    if (what === 'boottray') { const z = zoneOf('door_zone'); if (z) put(it, ftToMm(z.x + z.w / 2), ftToMm(z.y + z.d / 2)) }
  }
  // Items added by hand: centre of the room. Positions the user dragged win over the preset layout.
  for (const it of room.items) if (!place[it.id]) put(it, W / 2, D / 2)
  for (const it of room.items) if (it.pos) place[it.id] = { ...it.pos }
  return { place, walkways, fixed, W, D }
}
