// Test fit (SPEC §11 P5): a traced plan marked "test fit". Each traced room gets a room type and contents
// (a preset, or the type's questions), and Rooms from contents checks it at its traced size. R13: a traced
// room's size shows next to the same room type's minimum in Rooms, as a size you know.
// Saved in the trace: trace.fit = { on, rooms: { [tracedRoomId]: { type, preset, answers, items } } }.
// A new design copied from it is a separate set of rooms; the traced plan never changes (P5).
import { checkSize } from '../rooms/engine.js'
import { newId, newRoom, ROOM_TYPES } from '../rooms/types.js'
import { ftToM } from '../units.js'
import { mPerPx, pxToFt } from './trace.js'

const SQUARE = 0.01 // corners may be off square by 1% of the side

// The traced room as a plain rectangle (chat-D16), in feet: { w, d } (w along the picture's width), or null.
export function rectFt(trace, room) {
  if (!mPerPx(trace) || room.pts.length !== 4) return null
  const xs = room.pts.map((p) => p.x), ys = room.pts.map((p) => p.y)
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys)
  const tol = SQUARE * Math.max(x1 - x0, y1 - y0)
  const onCorner = (p) => (Math.abs(p.x - x0) <= tol || Math.abs(p.x - x1) <= tol) && (Math.abs(p.y - y0) <= tol || Math.abs(p.y - y1) <= tol)
  if (!room.pts.every(onCorner) || x1 - x0 <= tol || y1 - y0 <= tol) return null
  return { w: pxToFt(trace, x1 - x0), d: pxToFt(trace, y1 - y0) }
}

export const newFit = () => ({ on: false, rooms: {} })
export const fitOf = (trace, roomId) => trace.fit?.rooms?.[roomId] || null
// The contents chosen for a traced room: a room of that type, from its first preset (or the one named).
export function fitRoom(type, preset) {
  const r = newRoom(type, preset)
  return { type, preset: r.preset, answers: r.answers, items: r.items }
}

// Check my size for a traced room: checkSize's result, { status: 'not-rect' } or { status: 'no-type' }.
export function fitVerdict(trace, room, rules) {
  const fit = fitOf(trace, room.id)
  if (!fit) return { status: 'no-type' }
  const size = rectFt(trace, room)
  if (!size) return { status: 'not-rect' }
  if (ROOM_TYPES[fit.type]?.plain) return { status: 'plain', W: size.w, D: size.d }
  return checkSize({ ...fit, id: room.id, name: room.name, size: null }, size.w, size.d, rules)
}

// R13: traced rooms of this type with a rectangle size, while the plan is a test fit.
export function knownSizes(trace, type) {
  if (!trace?.fit?.on) return []
  const out = []
  for (const lv of trace.levels) for (const r of lv.rooms) {
    if (fitOf(trace, r.id)?.type !== type) continue
    const s = rectFt(trace, r)
    if (s) out.push({ id: r.id, name: r.name, w: s.w, d: s.d })
  }
  return out
}

// "Copy into Rooms as a new design": the typed rectangular rooms become new rooms at their traced size.
export function copyToRooms(trace) {
  const out = []
  for (const lv of trace.levels) for (const r of lv.rooms) {
    const fit = fitOf(trace, r.id), s = rectFt(trace, r)
    if (!fit || !s) continue
    out.push({ id: newId(), type: fit.type, name: r.name, preset: fit.preset, answers: structuredClone(fit.answers || {}), items: structuredClone(fit.items || []).map((i) => ({ ...i, id: newId() })), size: { w: ftToM(s.w), d: ftToM(s.d) }, source: { traceRoomId: r.id } })
  }
  return out
}
