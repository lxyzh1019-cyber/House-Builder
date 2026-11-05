// Room types (SPEC R1), their plain questions (R3) and presets (R2).
// Answering the questions creates real furniture items from the library; the user can then add,
// remove, move, rotate and resize items. Questionnaire sections 3 (cooking), 4 (storage), 5 (work)
// and 6 (guests) appear here as room questions (R11), tagged by `section`.
import { byId, byName } from '../furniture/library.js'

let n = 0
export const newId = () => `i${Date.now().toString(36)}${(n++).toString(36)}`

// One item instance: sizes in mm (the furniture library's unit), `role` tells the size engine what it is.
export function makeItem(lib, role, extra = {}) {
  if (!lib) throw new Error('Unknown library item')
  return { id: newId(), libId: lib.id, name: lib.name, type: lib.type, w: lib.w, d: lib.d, role, ...extra }
}
const item = (name, role, extra) => makeItem(byName(name), role, extra)

export const ROOM_TYPES = {
  living: {
    label: 'Living room',
    full: true,
    questions: [
      { id: 'seats', label: 'How many seats?', options: [['2-3', '2–3'], ['4-5', '4–5'], ['6-8', '6–8']] },
      { id: 'tv', label: 'TV size?', options: [['none', 'No TV'], ['55', '55 in'], ['65', '65 in'], ['75', '75 in'], ['85', '85 in']] },
      { id: 'open', label: 'Open to the next room (dining or kitchen)?', options: [['no', 'No, a separate room'], ['yes', 'Yes, open']] },
      { id: 'storage', section: 4, label: 'Storage in this room?', options: [['none', 'None'], ['shelf', 'A shelf wall']] },
      { id: 'sofaBed', section: 6, label: 'Will a guest sleep on the sofa?', options: [['no', 'No'], ['yes', 'Yes, a sofa bed']] },
    ],
    presets: {
      'Family TV room': { seats: '6-8', tv: '75', open: 'no', storage: 'none', sofaBed: 'no' },
      'Small den': { seats: '2-3', tv: '55', open: 'no', storage: 'none', sofaBed: 'no' },
      'Conversation room': { seats: '4-5', tv: 'none', open: 'no', storage: 'none', sofaBed: 'no' },
    },
    items(a) {
      const list = [item('3-Seat Sofa', 'main', a.sofaBed === 'yes' ? { name: '3-Seat Sofa Bed', sofaBed: true } : {})]
      const sides = a.seats === '6-8' ? 2 : a.seats === '4-5' ? 1 : 0
      for (let i = 0; i < sides; i++) list.push(item('Loveseat', 'side'))
      if (a.tv && a.tv !== 'none') {
        list.push(makeItem(byId(`app-tv${a.tv}`), 'tv'))
        list.push(item('TV Stand', 'tvstand'))
      }
      list.push(item('Coffee Table', 'free'))
      if (a.storage === 'shelf') list.push(makeItem(byId('app-shelfwall'), 'extra'))
      return list
    },
  },
  office: {
    label: 'Office',
    full: true,
    questions: [
      { id: 'people', section: 5, label: 'How many people work here?', options: [['1', '1'], ['2', '2']] },
      { id: 'desk', section: 5, label: 'Desk length?', options: [['4', '4 ft'], ['5', '5 ft'], ['6', '6 ft']] },
      { id: 'storage', section: 4, label: 'Storage?', options: [['shelf', 'A shelf wall'], ['none', 'None']] },
      { id: 'guest', section: 6, label: 'Will a guest sleep here?', options: [['no', 'No'], ['yes', 'Yes, a sofa bed']] },
    ],
    presets: {
      'Home office': { people: '1', desk: '6', storage: 'shelf', guest: 'no' },
      'Shared office': { people: '2', desk: '5', storage: 'shelf', guest: 'no' },
    },
    items(a) {
      const list = []
      for (let i = 0; i < Number(a.people || 1); i++) {
        list.push(makeItem(byId(`app-desk${a.desk || 6}`), 'desk'))
        list.push(item('Office Chair', 'free'))
      }
      if (a.storage === 'shelf') list.push(makeItem(byId('app-shelfwall'), 'shelf'))
      if (a.guest === 'yes') list.push(item('Loveseat', 'extra', { name: 'Sofa Bed (2-seat)', sofaBed: true }))
      return list
    },
  },
  dining: {
    label: 'Dining room',
    questions: [
      { id: 'seats', section: 3, label: 'How many people eat together?', options: [['4', '4'], ['6', '6'], ['8', '8']] },
      { id: 'storage', section: 4, label: 'A sideboard?', options: [['no', 'No'], ['yes', 'Yes']] },
    ],
    presets: { 'Family dining': { seats: '6', storage: 'no' } },
    items(a) {
      const seats = Number(a.seats || 6)
      const table = seats === 4 ? item('Dining Table', 'table') : seats === 6 ? item('6-Seat Dining Table', 'table') : makeItem(byId('app-table8'), 'table')
      const list = [table]
      for (let i = 0; i < seats; i++) list.push(item('Dining Chair', 'free'))
      if (a.storage === 'yes') list.push(item('Sideboard', 'extra'))
      return list
    },
  },
  primary: {
    label: 'Primary bedroom',
    questions: [
      { id: 'bed', label: 'Bed size?', options: [['queen', 'Queen'], ['king', 'King']] },
      { id: 'storage', section: 4, label: 'A dresser?', options: [['yes', 'Yes'], ['no', 'No']] },
    ],
    presets: { 'Primary bedroom': { bed: 'king', storage: 'yes' } },
    items(a) {
      const list = [makeItem(byId(a.bed === 'queen' ? 'app-queen' : 'app-king'), 'bed'), item('Nightstand', 'free'), item('Nightstand', 'free')]
      if (a.storage !== 'no') list.push(item('Dresser', 'extra'))
      return list
    },
  },
  kid: {
    label: 'Kid bedroom',
    questions: [
      { id: 'bed', label: 'Bed size?', options: [['twin', 'Twin'], ['full', 'Full']] },
      { id: 'desk', section: 5, label: 'A desk for homework?', options: [['yes', 'Yes'], ['no', 'No']] },
    ],
    presets: { 'Kid bedroom': { bed: 'twin', desk: 'yes' } },
    items(a) {
      const list = [makeItem(byId(a.bed === 'full' ? 'app-full' : 'app-twin'), 'kidbed'), item('Nightstand', 'free')]
      if (a.desk !== 'no') list.push(item('Desk', 'deskside'))
      return list
    },
  },
  mudroom: {
    label: 'Mudroom',
    questions: [
      { id: 'people', section: 4, label: 'How many people come in this way?', options: [['2', '2'], ['4', '4'], ['6', '6']] },
      { id: 'bench', label: 'A bench to sit on?', options: [['yes', 'Yes'], ['no', 'No']] },
    ],
    presets: { 'Family mudroom': { people: '4', bench: 'yes' } },
    items(a) {
      const list = []
      for (let i = 0; i < Number(a.people || 4); i++) list.push(makeItem(byId('app-locker'), 'wall'))
      if (a.bench !== 'no') list.push(item('Bench', 'wall'))
      list.push(item('Shoe Cabinet', 'wall'))
      return list
    },
  },
}

// Plain rooms (owner's answer 2026-11-05): a size you type, no questions or furniture yet. Their preset
// sizes are starting values (a guess, not from a source) until their own question sets arrive.
const plain = (label, presets) => ({ label, plain: true, questions: [], presets, items: () => [] })
ROOM_TYPES.garage = plain('Garage', { 'Double garage': { w: 22, d: 22 }, 'Single garage': { w: 12, d: 22 } })
ROOM_TYPES.kitchen = plain('Kitchen', { Kitchen: { w: 12, d: 14 } })
ROOM_TYPES.backkitchen = plain('Back kitchen', { 'Back kitchen': { w: 8, d: 10 } })

export const TYPE_ORDER = ['living', 'office', 'dining', 'primary', 'kid', 'mudroom', 'garage', 'kitchen', 'backkitchen']

// Room sides before rotation: n = top of the room drawing (the TV wall in a living room), s = bottom
// (behind the walkway), w = left, e = right. Each is a door, an open side or a wall (SPEC §7 ports).
export function defaultPorts(room) {
  const p = { n: 'wall', e: 'wall', s: 'door', w: 'wall' }
  if (room.type === 'living' && room.answers?.open === 'yes') p.s = 'open'
  if (room.type === 'dining') p.n = 'open'
  return p
}
export const portsOf = (room) => room.ports || defaultPorts(room)

export function newRoom(type, presetName) {
  const t = ROOM_TYPES[type]
  const name = presetName || Object.keys(t.presets)[0]
  if (t.plain) {
    const p = t.presets[name]
    return { id: newId(), type, name: t.label, preset: name, answers: {}, items: [], size: { w: p.w * 0.3048, d: p.d * 0.3048 } }
  }
  const answers = { ...t.presets[name] }
  return { id: newId(), type, name: t.label, preset: name, answers, items: t.items(answers), size: null }
}

// Re-answering a question rebuilds the question-made items but keeps items the user added by hand.
export function applyAnswers(room, answers) {
  if (ROOM_TYPES[room.type].plain) return room
  const kept = room.items.filter((i) => i.byHand)
  return { ...room, answers, items: [...ROOM_TYPES[room.type].items(answers), ...kept] }
}
