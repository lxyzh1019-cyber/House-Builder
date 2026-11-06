// SPEC v1.3 §6.6: T1–T3, T8–T12 and T15 read src/data/presets.json and are checked by the band rules
// (§6.2); T4–T6 and T12/T15's egress flag; R4 after moves (chat-D42). T4's save and reload, T13 and T14 run
// in the emulator (test/rules.test.js).
import { describe, expect, it } from 'vitest'
import PRESETS from '../src/data/presets.json'
import { applyOptions, newRoom } from '../src/rooms/types.js'
import { checkSize, egressNeeded, minimumSize } from '../src/rooms/engine.js'
import { PRESET_OF } from '../src/rooms/bands.js'
import { ftToMm } from '../src/units.js'

const TYPE_OF = Object.fromEntries(Object.entries(PRESET_OF).map(([t, p]) => [p, t]))
const roomFor = (preset, opts) => applyOptions(newRoom(TYPE_OF[preset]), opts)
const living = (o = {}) => roomFor('living_tv', { seats: '6-8', tv_in: 75, open: false, ...o })
const near = (a, b) => Math.abs(a - b) < 0.01

describe('Rooms from contents, SPEC v1.3 §6.6', () => {
  for (const tc of PRESETS.tests) {
    it(`${tc.id} ${tc.preset} ${JSON.stringify(tc.opts)} → ${tc.min.join(' x ')} ft`, () => {
      const m = minimumSize(roomFor(tc.preset, tc.opts))
      expect(near(m.w, tc.min[0]) && near(m.d, tc.min[1]), `${m.w} x ${m.d}`).toBe(true)
    })
  }

  it('T4 20 x 20 ft is accepted with 197.5 ft² spare', () => {
    const c = checkSize(living(), 20, 20)
    expect(c.status).toBe('fits')
    expect(c.spare).toBeCloseTo(197.5, 6)
  })

  it('T5 14 x 13 ft: too small by 1.0 and 0.5 ft, with the smallest changes per side', () => {
    const c = checkSize(living(), 14, 13)
    expect(c.status).toBe('too-small')
    expect(c.shortW).toBeCloseTo(1, 6); expect(c.shortD).toBeCloseTo(0.5, 6)
    const list = c.changes.map((x) => `${x.side} ${x.msg[0]} ${x.ft.toFixed(2)}`)
    expect(list).toEqual(['w chg.seats 13.50', 'd chg.tv 12.33', 'd chg.tvLow 12.25'])
    expect([c.min.w, c.min.d]).toEqual([15, 13.5]) // "or make it 15 x 13.5"
  })

  it('T6 every preset minimum passes its own check; 0.5 ft smaller in either side fails', () => {
    for (const tc of PRESETS.tests) {
      const r = roomFor(tc.preset, tc.opts), m = minimumSize(r)
      expect(checkSize(r, m.w, m.d).status, tc.id).toBe('fits')
      expect(checkSize(r, m.w - 0.5, m.d).status, tc.id).toBe('too-small')
      expect(checkSize(r, m.w, m.d - 0.5).status, tc.id).toBe('too-small')
    }
  })

  it('T12 and T15 turn the egress window flag on; T3 has it off', () => {
    expect(egressNeeded(roomFor('office_desk', { bedroom_ready: true }))).toBe(true)
    expect(egressNeeded(roomFor('office_desk', { sofa_bed: true }))).toBe(true)
    expect(egressNeeded(roomFor('office_desk', {}))).toBe(false)
  })

  it('R4 / chat-D42: a desk moved 2 ft forward carries its chair space; the minimum grows 2 ft in depth', () => {
    const r = roomFor('office_desk', {})
    const desk = r.items.find((i) => i.part === 'desk')
    // T3 layout at 9 x 9.5: desk centre at x = 3 + 3 = 6 ft, y = 1.25 ft. Moved to y = 3.25 ft.
    const moved = { ...r, items: r.items.map((i) => (i.id === desk.id ? { ...i, pos: { cx: ftToMm(6), cy: ftToMm(3.25), rot: 0 } } : i)) }
    const m = minimumSize(moved)
    expect(m.w).toBeCloseTo(9, 2)
    expect(m.d).toBeCloseTo(9.5 + 0, 2) // desk front 4.5 + chair 3 = 7.5 < walkway band end 8.5 + shelf 1: still 9.5
    const far = { ...r, items: r.items.map((i) => (i.id === desk.id ? { ...i, pos: { cx: ftToMm(6), cy: ftToMm(7.25), rot: 0 } } : i)) }
    expect(minimumSize(far).d).toBeCloseTo(7.25 + 1.25 + 3, 2) // desk front 8.5 + chair space 3 = 11.5
  })
})
