// Room types (SPEC v1.3 R1), their options and questions (R3, §6.4–6.5) and items (R2). Each type has one
// preset from src/data/presets.json; its options make real furniture items from the library, one per band
// part (chat-D36). The user can then add, remove, move, rotate and resize items.
import { byId, byName } from '../furniture/library.js'
import { arrangement, OPTIONS, placeBands, presetDefaults, PRESET_OF } from './bands.js'
import { ruleValues } from '../rules.js'
import { ftToMm } from '../units.js'

let n = 0
export const newId = () => `i${Date.now().toString(36)}${(n++).toString(36)}`

// One item instance: sizes in mm (the furniture library's unit).
export function makeItem(lib, extra = {}) {
  if (!lib) throw new Error('Unknown library item')
  return { id: newId(), libId: lib.id, name: lib.name, type: lib.type, w: lib.w, d: lib.d, ...extra }
}

// A choice list: [value, English, 简体中文].
const yesNo = [[true, 'yes', '是'], [false, 'no', '否']]
// Questions on the room card. Living room and office use the question ids and text of SPEC §6.5 (their
// answers are also saved under answers/{id}); the other types show their §6.4 options as chips.
const Q = (id, key, en, zh, options) => ({ id, key, label: [en, zh], options })
export const ROOM_TYPES = {
  living: {
    label: 'Living room', presetName: 'Family TV room',
    questions: [
      Q('living.seats', 'seats', 'How many people sit here at the same time?', '这里同时坐几个人？', [['4', '4', '4'], ['6-8', '6–8', '6–8'], ['10+', '10+', '10+']]),
      Q('living.tv', 'tv_in', 'TV size?', '电视尺寸？', OPTIONS.tv_in.map((v) => [v, `${v} in`, `${v} 英寸`])),
      Q('living.open', 'open', 'Open to the kitchen and dining room, or a separate room?', '与厨房餐厅开放相连，还是独立房间？', [[false, 'separate', '独立房间'], [true, 'open', '开放相连']]),
    ],
  },
  office: {
    label: 'Office', presetName: 'Home office',
    questions: [
      Q('office.desks', 'desks', 'How many people work here at the same time?', '几个人同时在这里工作？', [[1, '1', '1'], [2, '2', '2']]),
      Q('office.desk_len', 'desk_len', 'Desk length?', '书桌长度？', OPTIONS.desk_len.map((v) => [v, `${v} ft`, `${v} ft`])),
      Q('office.shelf', 'shelf', 'A shelf wall for files and books?', '要一面书架墙吗？', yesNo),
      Q('office.sofa_bed', 'sofa_bed', 'Do guests sometimes sleep here?', '客人有时在这里睡吗？', yesNo),
      Q('office.bedroom_ready', 'bedroom_ready', 'Should this room be able to become a bedroom later?', '以后要能改成卧室吗？', yesNo),
    ],
  },
  dining: {
    label: 'Dining room', presetName: 'Family dining',
    questions: [Q(null, 'seats', 'Seats at the table', '餐桌座位', [['4', '4', '4'], ['6', '6', '6'], ['8', '8', '8']])],
  },
  primary: {
    label: 'Primary bedroom', presetName: 'Primary bedroom',
    questions: [
      Q(null, 'bed', 'Bed size', '床的尺寸', [['twin', 'Twin', 'Twin 单人床'], ['queen', 'Queen', 'Queen 大床'], ['king', 'King', 'King 特大床']]),
      Q(null, 'dresser', 'A dresser', '要斗柜', yesNo),
    ],
  },
  kid: {
    label: 'Kid bedroom', presetName: 'Kid bedroom',
    questions: [
      Q(null, 'bed', 'Bed size', '床的尺寸', [['twin', 'Twin', 'Twin 单人床'], ['queen', 'Queen', 'Queen 大床'], ['king', 'King', 'King 特大床']]),
      Q(null, 'desk', 'A desk (no: a dresser instead)', '要书桌（否：换成斗柜）', yesNo),
    ],
  },
  mudroom: {
    label: 'Mudroom', presetName: 'Family mudroom',
    questions: [
      Q(null, 'people', 'Lockers (one per person)', '储物格（每人一个）', [1, 2, 3, 4, 5, 6].map((v) => [v, String(v), String(v)])),
      Q(null, 'gear', 'Gear per person', '每人装备', [['normal', 'normal (1.5 ft locker)', '一般（1.5 ft 储物格）'], ['heavy', 'heavy sports gear (2 ft locker)', '大件运动装备（2 ft 储物格）']]),
      Q(null, 'bench_opposite', 'A bench opposite the lockers', '储物格对面放长凳', yesNo),
    ],
  },
}

// Plain rooms (chat-D24): a size you type, no questions or furniture yet. Their preset sizes are starting
// values (a guess, not from a source) until their own presets arrive.
const plain = (label, presets) => ({ label, plain: true, questions: [], presets })
ROOM_TYPES.garage = plain('Garage', { 'Double garage': { w: 22, d: 22 }, 'Single garage': { w: 12, d: 22 } })
ROOM_TYPES.kitchen = plain('Kitchen', { Kitchen: { w: 12, d: 14 } })
ROOM_TYPES.backkitchen = plain('Back kitchen', { 'Back kitchen': { w: 8, d: 10 } })

export const TYPE_ORDER = ['living', 'office', 'dining', 'primary', 'kid', 'mudroom', 'garage', 'kitchen', 'backkitchen']
export const LEVELS = ['basement', 'main', 'upper']

// The items a room's options make: one per band part, plus the items that sit in a clearance (desk chairs,
// dining chairs, nightstands, coffee table, boot tray). Each carries `slot` (its band part) or `attach`.
export function itemsFor(type, options, overrides) {
  const R = ruleValues(overrides)
  const arr = arrangement({ type, options }, R)
  const o = arr.options
  const { slots } = placeBands(arr, arr.w)
  const mm = (ft) => Math.round(ftToMm(ft))
  const out = []
  const at = (s, lib, extra) => out.push(makeItem(lib, { slot: `${s.band}/${s.part}/${s.i}`, part: s.part, ...extra }))
  for (const s of slots) {
    if (s.part === 'tv') at(s, byId(`app-tv${o.tv_in}`))
    if (s.part === 'seat_group') at(s, byId(`app-seats-${o.seats}`))
    if (s.part === 'desk') at(s, byId(`app-desk${o.desk_len}`))
    if (s.part === 'sofa_bed') at(s, byId('app-sofabed'), { sofaBed: true })
    if (s.part === 'shelf') at(s, byId('app-shelfwall'), { w: mm(s.w), d: mm(s.d) })
    if (s.part === 'closet') at(s, byId('app-closet'), { w: mm(s.w), d: mm(s.d) })
    if (s.part === 'table') at(s, byId(`app-table-${o.seats}`))
    if (s.part === 'bed') at(s, byId(`app-${o.bed}`))
    if (s.part === 'kid_desk') at(s, byId('app-kiddesk'), { rot: 90 })
    if (s.part === 'dresser') at(s, byId('app-dresser'), type === 'kid' ? { rot: 90, w: mm(5), d: mm(s.w) } : { d: mm(s.d) })
    if (s.part === 'locker') at(s, byId('app-locker'), { w: mm(s.w), d: mm(s.d) })
    if (s.part === 'bench') at(s, byId('app-bench'), { w: mm(s.w), d: mm(s.d) })
  }
  const add = (lib, attach, extra) => out.push(makeItem(lib, { attach, ...extra }))
  if (type === 'living') add(byName('Coffee Table'), 'coffee')
  if (type === 'office') for (let i = 0; i < (Number(o.desks) || 1); i++) add(byName('Office Chair'), `deskchair:${i}`)
  if (type === 'kid' && o.desk) add(byName('Office Chair'), 'deskchair:0')
  if (type === 'dining') { const seats = Number(o.seats) || 6; for (let i = 0; i < seats; i++) add(byName('Dining Chair'), `chair:${i}`, { of: seats }) }
  if (type === 'primary') { add(byName('Nightstand'), 'nightstand:0'); add(byName('Nightstand'), 'nightstand:1') }
  if (type === 'kid') add(byName('Nightstand'), 'nightstand:0')
  if (type === 'mudroom' && o.boot_tray) add(byId('app-boottray'), 'boottray')
  return out
}

// Room sides before rotation: n = back wall of the drawing (the TV wall in a living room), s = front (the
// walkway side), w = left (the side walkway), e = right. Each is a door, an open side or a wall (SPEC §7).
export function defaultPorts(room) {
  const p = { n: 'wall', e: 'wall', s: 'door', w: 'wall' }
  if (room.type === 'living' && room.options?.open) p.s = 'open'
  if (room.type === 'dining') p.n = 'open'
  return p
}
export const portsOf = (room) => room.ports || defaultPorts(room)

// A new room: its preset's defaults, then what the household's answers set (src/rooms/answers.js passes
// them in as `fromAnswers`), level main (R14).
export function newRoom(type, fromAnswers = {}, overrides) {
  const t = ROOM_TYPES[type]
  if (t.plain) {
    const name = Object.keys(t.presets)[0], p = t.presets[name]
    return { id: newId(), type, name: t.label, preset: name, level: 'main', options: {}, items: [], size: { w: p.w * 0.3048, d: p.d * 0.3048 } }
  }
  const options = { ...presetDefaults(type), ...fromAnswers }
  return { id: newId(), type, name: t.label, preset: PRESET_OF[type], level: 'main', options, items: itemsFor(type, options, overrides), size: null }
}

// Changing an option rebuilds the option-made items. Items in the same band part keep their id, place and
// size changes; items the user added by hand stay.
export function applyOptions(room, patch, overrides) {
  if (ROOM_TYPES[room.type].plain) return room
  const options = { ...room.options, ...patch }
  const old = room.items
  const items = itemsFor(room.type, options, overrides).map((it) => {
    const was = old.find((x) => !x.byHand && ((it.slot && x.slot === it.slot && x.libId === it.libId) || (it.attach && x.attach === it.attach)))
    return was ? { ...it, id: was.id, pos: was.pos, ...(was.edited ? { w: was.w, d: was.d, edited: true } : {}) } : it
  })
  return { ...room, options, items: [...items, ...old.filter((i) => i.byHand)] }
}
