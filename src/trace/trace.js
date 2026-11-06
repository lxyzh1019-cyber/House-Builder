// Plan intake (SPEC §11): trace a plan picture once. Pure functions, no screen code.
// A trace is stored with the project (Firestore). Points are picture pixels as { x, y } objects (Firestore
// cannot store nested arrays); metres come from the scale, so a corrected scale moves nothing on the
// picture. Openings sit on their wall at t (0 = wall start, 1 = wall end) with a width in metres.
//   trace = { image: { kind: 'sample' | 'local', name, w, h } | null,
//             scale: { a, b, ft } | null,            // two picture points and the real length between them
//             levels: [{ id, name, walls: [{ id, a, b, openings: [{ id, kind: 'door' | 'window', t, width }] }],
//                        rooms: [{ id, name, pts: [{ x, y }] }] }],
//             checks: [{ id, wallId, ft }],          // P2: sizes typed from the drawing
//             opacity }                              // P3: picture opacity under the model, 0–100
import { ftToM, mToFt } from '../units.js'
import { ruleValues } from '../rules.js'

let n = 0
export const tid = (p) => `${p}${Date.now().toString(36)}${(n++).toString(36)}`

export const newTrace = () => ({ image: null, scale: null, levels: [{ id: 'lv0', name: 'Level 0', walls: [], rooms: [] }], checks: [], opacity: 60 })

const dist = (a, b) => Math.hypot(b.x - a.x, b.y - a.y)
// Metres per picture pixel, or null until the scale is set.
export function mPerPx(trace) {
  const s = trace?.scale
  if (!s || !(s.ft > 0)) return null
  const d = dist(s.a, s.b)
  return d > 0 ? ftToM(s.ft) / d : null
}
export const pxToFt = (trace, px) => { const k = mPerPx(trace); return k ? mToFt(px * k) : null }
export const wallFt = (trace, w) => pxToFt(trace, dist(w.a, w.b))

// Snap a new point: to an existing wall end within r pixels, else square to the previous point when the
// line is within 8° of level or upright.
export function snapPoint(p, prev, ends, r) {
  let best = null, bd = r
  for (const e of ends) { const d = dist(p, e); if (d <= bd) { bd = d; best = e } }
  if (best) return { x: best.x, y: best.y }
  if (prev) {
    const ang = Math.abs((Math.atan2(p.y - prev.y, p.x - prev.x) * 180) / Math.PI) % 180
    if (ang < 8 || ang > 172) return { x: p.x, y: prev.y }
    if (Math.abs(ang - 90) < 8) return { x: prev.x, y: p.y }
  }
  return { x: p.x, y: p.y }
}
export const wallEnds = (level) => level.walls.flatMap((w) => [w.a, w.b])

// Nearest wall to a point: { wall, t, d } (d in pixels), or null.
export function nearestWall(level, p) {
  let best = null
  for (const w of level.walls) {
    const L2 = (w.b.x - w.a.x) ** 2 + (w.b.y - w.a.y) ** 2
    if (!L2) continue
    const t = Math.max(0, Math.min(1, ((p.x - w.a.x) * (w.b.x - w.a.x) + (p.y - w.a.y) * (w.b.y - w.a.y)) / L2))
    const q = { x: w.a.x + t * (w.b.x - w.a.x), y: w.a.y + t * (w.b.y - w.a.y) }
    const d = dist(p, q)
    if (!best || d < best.d) best = { wall: w, t, d }
  }
  return best
}

// A door or window centred where the user tapped, slid along the wall so it fits. null if it cannot fit.
export function placeOpening(trace, level, p, kind, widthM, r) {
  const k = mPerPx(trace), hit = nearestWall(level, p)
  if (!k || !hit || hit.d > r) return null
  const L = dist(hit.wall.a, hit.wall.b) * k
  if (widthM >= L) return null
  const half = widthM / 2 / L
  const t = Math.max(half, Math.min(1 - half, hit.t))
  return { wallId: hit.wall.id, opening: { id: tid('o'), kind, t, width: widthM } }
}

// Room area (ft²) from its corners (shoelace).
export function roomAreaFt2(trace, room) {
  const k = mPerPx(trace)
  if (!k || room.pts.length < 3) return null
  let a = 0
  room.pts.forEach((p, i) => { const q = room.pts[(i + 1) % room.pts.length]; a += p.x * q.y - q.x * p.y })
  return mToFt(mToFt(Math.abs(a / 2) * k * k))
}

// P2 size check: each typed size against its traced wall. status 'need' (fewer than 3 sizes), 'match'
// (3 or more, all within the tolerance) or 'again' (one or more off; `off` lists them).
export const CHECKS_NEEDED = 3
export function sizeCheck(trace, overrides) {
  const tolFt = ruleValues(overrides).traceTol / 12
  const walls = Object.fromEntries(trace.levels.flatMap((l) => l.walls).map((w) => [w.id, w]))
  const rows = trace.checks.filter((c) => walls[c.wallId]).map((c) => {
    const traced = wallFt(trace, walls[c.wallId])
    const diff = traced == null ? null : traced - c.ft
    return { ...c, traced, diff, ok: diff != null && Math.abs(diff) <= tolFt + 1e-9 }
  })
  const off = rows.filter((r) => !r.ok)
  const status = rows.length < CHECKS_NEEDED ? 'need' : off.length ? 'again' : 'match'
  return { rows, off, status, tolFt }
}

// Picture size in metres and where the traced plan sits in the Pascal scene (beside the lot, to its left).
export function traceFrame(trace, gapM) {
  const k = mPerPx(trace)
  if (!k || !trace.image) return null
  const wM = trace.image.w * k, hM = trace.image.h * k
  return { k, wM, hM, ox: -(wM + gapM), oz: 0 }
}
