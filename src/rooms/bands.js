// Bands (SPEC v1.3 §6.2, chat-D36): each preset is a fixed stack of bands from the back wall forward.
// Band depth = its deepest part; band width = the sum of its parts' widths. Some presets add a side
// walkway column (full depth). Minimum width = side walkway + the widest band; minimum depth = the sum
// of the band depths. All sizes in ft. Data: src/data/presets.json (SPEC §6.4).
import PRESETS from '../data/presets.json'

export const OPTIONS = PRESETS.options
// App room type -> preset id (SPEC §6.4 names the bedroom types primary_bedroom and kid_bedroom).
export const PRESET_OF = { living: 'living_tv', office: 'office_desk', dining: 'dining_table', primary: 'primary_bed', kid: 'kid_bed_desk', mudroom: 'mudroom_lockers' }
export const presetDefaults = (type) => structuredClone(PRESETS.presets[PRESET_OF[type]]?.defaults || {})

export const tvWidthFt = (diagIn) => (diagIn * 16) / Math.hypot(16, 9) / 12
const inFt = (inch) => inch / 12

// Is the rear walkway shared with an open neighbour (R10)? On the lot board the lot decides (ctx.shared);
// off the lot, the room's own "open" option does.
export const isShared = (room, ctx) => (ctx && typeof ctx.shared === 'boolean' ? ctx.shared : !!room.options?.open)

// One part: { part, w, d, clear? (hatched zone), full? (spans the band width) }.
// One band: { key, d, parts, walk? (a walkway: never offered as a change, stays where the preset put it),
// clear? (a clearance zone), allowed? (items allowed in it), carry? (the item that carries it when moved) }.
export function arrangement(room, R, ctx) {
  const o = { ...presetDefaults(room.type), ...(room.options || {}) }
  const P = (part, w, d, extra) => ({ part, w, d, ...extra })
  let side = 0, bands = []
  if (room.type === 'living') {
    const f = o.tv_factor === 'low' ? R.tv_factor_low : R.tv_factor
    side = R.walkway_side
    bands = [
      { key: 'tv', d: R.tv_band, parts: [P('tv', tvWidthFt(o.tv_in), R.tv_band)] },
      { key: 'viewing_gap', d: (f * o.tv_in) / 12 + R.eye_to_sofa_back - R.seat_depth, parts: [], clear: true, allowed: ['coffee table'] },
      { key: 'seat_group', d: R.seat_depth, parts: [P('seat_group', OPTIONS.seat_group[o.seats], R.seat_depth)] },
      { key: 'rear_walkway', d: isShared(room, ctx) ? R.shared_strip : R.walkway_main, parts: [], walk: true },
    ]
  } else if (room.type === 'office') {
    side = R.walkway_side
    const n = Number(o.desks) || 1
    bands = [
      { key: 'desks', d: R.desk_depth, parts: Array.from({ length: n }, () => P('desk', o.desk_len, R.desk_depth)) },
      { key: 'desk_chair', d: R.desk_chair, parts: [], clear: true, allowed: ['desk chair'], carry: 'desk' },
      { key: 'walkway_main', d: R.walkway_main, parts: [], walk: true },
    ]
    if (o.sofa_bed) bands.push({ key: 'sofa_bed', d: R.sofa_bed_open, parts: [P('sofa_bed', R.sofa_bed_width, R.sofa_bed_open)] })
    if (o.shelf) bands.push({ key: 'shelf', d: R.shelf_depth, parts: [P('shelf', 0, R.shelf_depth, { full: true })] })
    if (o.bedroom_ready) bands.push({ key: 'closet', d: R.closet_depth, parts: [P('closet', 0, R.closet_depth, { full: true })] })
  } else if (room.type === 'dining') {
    const [tw, td] = OPTIONS.dining_table[o.seats]
    const cs = R.dining_chair
    bands = [
      { key: 'chair_space', d: cs, parts: [], clear: true, allowed: ['dining chairs'], carry: 'table' },
      { key: 'table', d: td, parts: [P('chair_zone', cs, td, { clear: true }), P('table', tw, td), P('chair_zone', cs, td, { clear: true })] },
      { key: 'chair_space', d: cs, parts: [], clear: true, allowed: ['dining chairs'], carry: 'table' },
    ]
  } else if (room.type === 'primary') {
    const [bw, bl] = OPTIONS.bed_in[o.bed]
    bands = [
      { key: 'bed_row', d: inFt(bl), parts: [P('side_zone', R.bed_side_zone, inFt(bl), { clear: true }), P('bed', inFt(bw), inFt(bl)), P('side_zone', R.bed_side_zone, inFt(bl), { clear: true })] },
      { key: 'bed_foot_walkway', d: R.bed_foot_walkway, parts: [], clear: true, carry: 'bed' },
    ]
    if (o.dresser) bands.push({ key: 'dresser', d: R.dresser_depth, parts: [P('dresser', 0, R.dresser_depth)] })
  } else if (room.type === 'kid') {
    const [bw, bl] = OPTIONS.bed_in[o.bed]
    const row = [P('bed', inFt(bw), inFt(bl)), P('side_zone', R.bed_side_zone, inFt(bl), { clear: true })]
    if (o.desk) row.push(P('desk_chair', R.desk_chair, OPTIONS.kid_desk[0], { clear: true }), P('kid_desk', OPTIONS.kid_desk[1], OPTIONS.kid_desk[0]))
    else row.push(P('dresser', R.dresser_depth, 5))
    bands = [
      { key: 'closet', d: R.closet_depth, parts: [P('closet', 0, R.closet_depth, { full: true })] },
      { key: 'walkway_main', d: R.walkway_main, parts: [], walk: true },
      { key: 'bed_row', d: inFt(bl), parts: row },
    ]
  } else if (room.type === 'mudroom') {
    const n = Math.max(1, Number(o.people) || 1), lw = OPTIONS.locker_w[o.gear] ?? OPTIONS.locker_w.normal
    bands = [
      { key: 'lockers', d: R.locker_depth, parts: [...Array.from({ length: n }, () => P('locker', lw, R.locker_depth)), P('door_zone', R.door_zone, R.locker_depth, { clear: true })] },
      { key: 'walkway_main', d: R.walkway_main, parts: [], walk: true },
    ]
    if (o.bench_opposite) bands.push({ key: 'bench', d: R.bench_depth, parts: [P('bench', n * lw, R.bench_depth)] })
  }
  for (const b of bands) b.w = b.parts.reduce((s, p) => s + p.w, 0)
  const bw = Math.max(0, ...bands.map((b) => b.w))
  return { side, bands, bandW: bw, w: side + bw, d: bands.reduce((s, b) => s + b.d, 0), options: o }
}

// Where each band and part sits in a room of W x D ft: bands from the back wall (y = 0) forward, the side
// walkway along the left wall (x 0..side), parts side by side, centred in the band width beside the side
// walkway. Returns { slots: [{ part, band, i, x, y, w, d, clear }], zones: [{ x, y, w, d, kind, key, allowed }] }.
export function placeBands(arr, W) {
  const slots = [], zones = []
  const x0 = arr.side + Math.max(0, W - arr.side - arr.bandW) / 2
  if (arr.side) zones.push({ x: 0, y: 0, w: arr.side, d: arr.d, kind: 'walk', key: 'side_walkway' })
  let y = 0
  for (const b of arr.bands) {
    if (b.walk || b.clear) zones.push({ x: x0, y, w: arr.bandW, d: b.d, kind: b.walk ? 'walk' : 'clear', key: b.key, allowed: b.allowed, carry: b.carry })
    let x = x0 + (arr.bandW - b.w) / 2
    b.parts.forEach((p, i) => {
      const w = p.full ? arr.bandW : p.w
      const s = { part: p.part, band: b.key, i, x: p.full ? x0 : x, y, w, d: p.d, clear: !!p.clear }
      if (p.clear) zones.push({ x: s.x, y, w, d: p.d, kind: 'clear', key: p.part })
      else slots.push(s)
      if (!p.full) x += p.w
    })
    y += b.d
  }
  return { slots, zones }
}
