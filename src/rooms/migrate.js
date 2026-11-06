// Saved rooms <-> rooms in the app (SPEC v1.3 §4 room fields; chat-D41 for rooms saved before v1.3).
// Saved: { id, type, name, preset, level, options, items, minimum, chosenSize, bedroomReady, ports, place, ... }.
// In the app the chosen size is `size` (metres), as the lot board, budget and test fit read it.
import { minimumSize } from './engine.js'
import { itemsFor, LEVELS, ROOM_TYPES } from './types.js'
import { PRESET_OF, presetDefaults } from './bands.js'
import { OPTIONS } from './bands.js'
import { ftToM } from '../units.js'

// chat-D41: a room saved before v1.3 keeps its type, name, set size, place and ports; its contents reset
// to the v1.3 preset, keeping the answers that still exist.
export function fromOld(room) {
  const a = room.answers || {}, o = {}
  const has = (k, list) => list.includes(a[k])
  if (room.type === 'living') {
    if (has('tv', ['55', '65', '75', '85'])) o.tv_in = Number(a.tv)
    if (a.seats === '6-8') o.seats = '6-8'
    if (a.open === 'yes' || a.open === 'no') o.open = a.open === 'yes'
  }
  if (room.type === 'office') {
    if (has('desk', ['5', '6'])) o.desk_len = Number(a.desk)
    if (has('people', ['1', '2'])) o.desks = Number(a.people)
    if (has('storage', ['shelf', 'none'])) o.shelf = a.storage === 'shelf'
    if (has('guest', ['yes', 'no'])) o.sofa_bed = a.guest === 'yes'
  }
  if (room.type === 'dining' && has('seats', ['4', '6', '8'])) o.seats = a.seats
  if (room.type === 'primary') { if (has('bed', ['queen', 'king'])) o.bed = a.bed; if (has('storage', ['yes', 'no'])) o.dresser = a.storage === 'yes' }
  if (room.type === 'kid') { if (a.bed === 'twin') o.bed = 'twin'; if (has('desk', ['yes', 'no'])) o.desk = a.desk === 'yes' }
  if (room.type === 'mudroom' && has('people', ['2', '4', '6'])) o.people = Number(a.people)
  const { answers, ...rest } = room
  if (ROOM_TYPES[room.type]?.plain) return { ...rest, level: 'main', options: {} }
  const options = { ...presetDefaults(room.type), ...o }
  return { ...rest, preset: PRESET_OF[room.type], level: 'main', options, items: itemsFor(room.type, options) }
}

export function fromSaved(room) {
  let r = room.options ? { ...room } : fromOld(room)
  if (r.chosenSize !== undefined) { r.size = r.chosenSize; delete r.chosenSize }
  delete r.minimum; delete r.bedroomReady
  if (!LEVELS.includes(r.level)) r.level = 'main'
  return r
}

export function toSaved(room, rules) {
  const { size, ...rest } = room
  const m = minimumSize(room, rules)
  return { ...rest, chosenSize: size ?? null, minimum: { w: ftToM(m.w), d: ftToM(m.d) }, bedroomReady: !!room.options?.bedroom_ready }
}

// Options a test fit saved before v1.3 ({ type, preset, answers, items }) -> { type, preset, options, items }.
export function fitFromSaved(f) {
  if (!f || f.options || !ROOM_TYPES[f.type] || ROOM_TYPES[f.type].plain) return f
  const r = fromOld({ ...f, id: 'fit' })
  return { type: f.type, preset: r.preset, options: r.options, items: r.items }
}
export { OPTIONS }
