// Lot board (SPEC §7). Pure functions; all lengths in ft here (the project stores metres).
// Lot frame: x from the left lot line to the right, y from the front (street) line to the rear.
// A room on the lot has place = { x, y, rot } in metres: x, y = top-left corner of its footprint as
// placed at its base size; rot = 0/90/180/270, turning clockwise as seen on the board.
import { ruleValues } from '../rules.js'
import { checkSize, minimumSize } from '../rooms/engine.js'
import { portsOf } from '../rooms/types.js'
import { mToFt, ftToM } from '../units.js'

const EPS = 0.05 // ft: edges this close count as touching

export function newLot(overrides) {
  const R = ruleValues(overrides)
  return { w: ftToM(R.lotW), d: ftToM(R.lotD), setbacks: { front: 0, rear: 0, left: 0, right: 0 } }
}
export const lotFt = (lot) => ({ w: mToFt(lot.w), d: mToFt(lot.d), front: mToFt(lot.setbacks?.front || 0), rear: mToFt(lot.setbacks?.rear || 0), left: mToFt(lot.setbacks?.left || 0), right: mToFt(lot.setbacks?.right || 0) })

// Lot side a room's own side faces after a clockwise turn.
const ORDER = ['n', 'e', 's', 'w']
export const lotSideOf = (localSide, rot) => ORDER[(ORDER.indexOf(localSide) + Math.round(rot / 90)) % 4]
export const localSideOf = (lotSide, rot) => ORDER[(ORDER.indexOf(lotSide) - Math.round(rot / 90) % 4 + 8) % 4]
const OPPOSITE = { n: 's', s: 'n', e: 'w', w: 'e' }

// Base size (ft): the size the user set, else the minimum with the walkway NOT shared (alone).
// Touching is decided on base footprints, so a room shrinking after it shares cannot lose its neighbour.
export function baseSize(room, rules) {
  if (room.size) return { w: mToFt(room.size.w), d: mToFt(room.size.d) }
  const m = minimumSize(room, rules, { shared: false })
  return { w: m.w, d: m.d }
}
const turn = (s, rot) => (rot % 180 === 0 ? { w: s.w, d: s.d } : { w: s.d, d: s.w })

export function baseFootprint(room, rules) {
  if (!room.place) return null
  const s = turn(baseSize(room, rules), room.place.rot || 0)
  return { x: mToFt(room.place.x), y: mToFt(room.place.y), w: s.w, d: s.d, rot: room.place.rot || 0 }
}

// Two footprints touch along a side: returns the lot side of `a` that touches `b`, or null.
export function touchingSide(a, b) {
  const overlapX = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)
  const overlapY = Math.min(a.y + a.d, b.y + b.d) - Math.max(a.y, b.y)
  if (overlapX > EPS) {
    if (Math.abs(a.y + a.d - b.y) < EPS) return 's'
    if (Math.abs(b.y + b.d - a.y) < EPS) return 'n'
  }
  if (overlapY > EPS) {
    if (Math.abs(a.x + a.w - b.x) < EPS) return 'e'
    if (Math.abs(b.x + b.w - a.x) < EPS) return 'w'
  }
  return null
}

// Everything the board and the rooms need: per room { base, fp (as drawn), shared, sharedWith, min,
// check, overlap, outside }. SPEC §7: an open living room touching another open room shares its walkway
// (minus the strip); alone, the strip is added back. Owner (2026-11-05): a size the user set stays;
// only the minimum and the check change. A room with no set size follows its minimum, keeping the
// shared side where it is.
export function lotState(rooms, lot, rules) {
  const L = lotFt(lot)
  const out = {}
  for (const r of rooms) out[r.id] = { base: baseFootprint(r, rules), shared: false, sharedWith: [] }
  for (const a of rooms) {
    const A = out[a.id].base
    if (!A) continue
    for (const b of rooms) {
      if (a === b || !out[b.id].base) continue
      const side = touchingSide(A, out[b.id].base)
      if (!side) continue
      const aPort = portsOf(a)[localSideOf(side, A.rot)], bPort = portsOf(b)[localSideOf(OPPOSITE[side], out[b.id].base.rot)]
      if (a.type === 'living' && aPort === 'open' && bPort === 'open') { out[a.id].shared = true; out[a.id].sharedWith.push({ id: b.id, side }) }
    }
  }
  for (const r of rooms) {
    const st = out[r.id]
    const ctx = st.base ? { shared: st.shared } : undefined
    st.min = minimumSize(r, rules, ctx)
    const size = r.size ? { w: mToFt(r.size.w), d: mToFt(r.size.d) } : { w: st.min.w, d: st.min.d }
    st.size = size
    st.check = r.size ? checkSize(r, size.w, size.d, rules, ctx) : null
    st.ctx = ctx
    if (st.base) {
      const s = turn(size, st.base.rot)
      const fp = { ...st.base, w: s.w, d: s.d }
      // Keep the shared side in place when the room shrinks.
      const side = st.sharedWith[0]?.side
      if (side === 's') fp.y = st.base.y + st.base.d - fp.d
      if (side === 'e') fp.x = st.base.x + st.base.w - fp.w
      st.fp = fp
    }
  }
  const placed = rooms.filter((r) => out[r.id].fp)
  for (const r of placed) { out[r.id].overlap = []; out[r.id].outside = [] }
  for (let i = 0; i < placed.length; i++) for (let j = i + 1; j < placed.length; j++) {
    const a = out[placed[i].id].fp, b = out[placed[j].id].fp
    const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(a.y + a.d, b.y + b.d) - Math.max(a.y, b.y)
    if (ox > EPS && oy > EPS) { out[placed[i].id].overlap.push(placed[j].id); out[placed[j].id].overlap.push(placed[i].id) }
  }
  for (const r of placed) {
    const f = out[r.id].fp, o = out[r.id].outside
    if (f.y < L.front - EPS) o.push('front setback')
    if (f.y + f.d > L.d - L.rear + EPS) o.push('rear setback')
    if (f.x < L.left - EPS) o.push('left setback')
    if (f.x + f.w > L.w - L.right + EPS) o.push('right setback')
  }
  return out
}

// 2 ft grid snap, plus snapping an edge onto a neighbour's edge (within edgeSnap) so rooms whose sizes are
// not whole 2 ft steps can still touch. Works on the base footprint's top-left corner (ft).
export function snapCorner(x, y, w, d, others, rules) {
  const R = ruleValues(rules)
  const g = (v) => Math.round(v / R.lotSnap) * R.lotSnap
  let nx = g(x), ny = g(y), bx = R.edgeSnap, by = R.edgeSnap
  for (const o of others) {
    for (const c of [o.x, o.x + o.w, o.x - w, o.x + o.w - w]) if (Math.abs(c - x) < bx) { bx = Math.abs(c - x); nx = c }
    for (const c of [o.y, o.y + o.d, o.y - d, o.y + o.d - d]) if (Math.abs(c - y) < by) { by = Math.abs(c - y); ny = c }
  }
  return { x: Math.round(nx * 1000) / 1000, y: Math.round(ny * 1000) / 1000 }
}

const clusterOf = (clusters, id) => (clusters || []).find((c) => c.roomIds.includes(id))

// Move a room to a new top-left (ft, before snapping). A room in a glued cluster moves the whole cluster.
export function moveRoom(rooms, clusters, id, xFt, yFt, rules) {
  const room = rooms.find((r) => r.id === id)
  const A = baseFootprint(room, rules)
  const group = clusterOf(clusters, id)?.roomIds ?? [id]
  const others = rooms.filter((r) => !group.includes(r.id)).map((r) => baseFootprint(r, rules)).filter(Boolean)
  const s = snapCorner(xFt, yFt, A.w, A.d, others, rules)
  const dx = s.x - A.x, dy = s.y - A.y
  return rooms.map((r) => (group.includes(r.id) && r.place ? { ...r, place: { ...r.place, x: ftToM(mToFt(r.place.x) + dx), y: ftToM(mToFt(r.place.y) + dy) } } : r))
}

// Turn a room 90° clockwise about its centre, then snap its corner to the grid.
export function rotateRoom(rooms, id, rules) {
  return rooms.map((r) => {
    if (r.id !== id || !r.place) return r
    const A = baseFootprint(r, rules)
    const rot = ((r.place.rot || 0) + 90) % 360
    const s = turn(baseSize(r, rules), rot)
    const cx = A.x + A.w / 2, cy = A.y + A.d / 2
    const R = ruleValues(rules)
    const x = Math.round((cx - s.w / 2) / R.lotSnap) * R.lotSnap, y = Math.round((cy - s.d / 2) / R.lotSnap) * R.lotSnap
    return { ...r, place: { x: ftToM(x), y: ftToM(y), rot } }
  })
}

// Put a room on the lot at the first free 2 ft grid spot inside the buildable area (front-left first).
export function placeRoom(rooms, lot, id, rules) {
  const R = ruleValues(rules), L = lotFt(lot)
  const room = rooms.find((r) => r.id === id)
  const s = baseSize(room, rules)
  const taken = rooms.filter((r) => r.id !== id).map((r) => baseFootprint(r, rules)).filter(Boolean)
  const free = (x, y) => taken.every((o) => !(x < o.x + o.w - EPS && x + s.w > o.x + EPS && y < o.y + o.d - EPS && y + s.d > o.y + EPS))
  const x0 = Math.ceil(L.left / R.lotSnap) * R.lotSnap, y0 = Math.ceil(L.front / R.lotSnap) * R.lotSnap
  for (let y = y0; y + s.d <= L.d - L.rear + EPS; y += R.lotSnap) for (let x = x0; x + s.w <= L.w - L.right + EPS; x += R.lotSnap) {
    if (free(x, y)) return rooms.map((r) => (r.id === id ? { ...r, place: { x: ftToM(x), y: ftToM(y), rot: 0 } } : r))
  }
  return rooms.map((r) => (r.id === id ? { ...r, place: { x: ftToM(x0), y: ftToM(y0), rot: 0 } } : r))
}

// P6 site review: what the zone allows (typed from the land title or the City zoning map) and how much
// of the lot the placed rooms cover. Coverage = area under the placed rooms (overlaps counted once) /
// lot area. `site` = { zone, maxHeightFt, maxCoveragePct } (empty values = not set).
export const newSite = () => ({ zone: '', maxHeightFt: null, maxCoveragePct: null })
export function coverage(lot, state) {
  const L = lotFt(lot)
  const fps = Object.values(state || {}).map((s) => s.fp).filter(Boolean)
  const xs = [...new Set(fps.flatMap((f) => [f.x, f.x + f.w]))].sort((a, b) => a - b)
  const ys = [...new Set(fps.flatMap((f) => [f.y, f.y + f.d]))].sort((a, b) => a - b)
  let area = 0
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
    const cx = (xs[i] + xs[i + 1]) / 2, cy = (ys[j] + ys[j + 1]) / 2
    if (fps.some((f) => cx > f.x && cx < f.x + f.w && cy > f.y && cy < f.y + f.d)) area += (xs[i + 1] - xs[i]) * (ys[j + 1] - ys[j])
  }
  const lotArea = L.w * L.d
  const pct = lotArea > 0 ? (area / lotArea) * 100 : 0
  const max = lot.site?.maxCoveragePct
  return { area, lotArea, pct, over: Number.isFinite(max) && max > 0 && pct > max + 1e-9 }
}
