// SPEC v1 §6 tests T1–T6 (T7 is the owner's phone test).
import { describe, expect, it } from 'vitest'
import { newRoom, applyAnswers } from '../src/rooms/types.js'
import { checkSize, minimumSize } from '../src/rooms/engine.js'

const living = (answers = {}) => { const r = newRoom('living', 'Family TV room'); return applyAnswers(r, { ...r.answers, ...answers }) }
const office = () => newRoom('office', 'Home office')

describe('SPEC §6 tests', () => {
  it('T1 living room, 6–8 seats, 75-in TV, separate room: minimum 15 x 13.5 ft', () => {
    const r = living({ seats: '6-8', tv: '75', open: 'no' })
    expect(minimumSize(r)).toMatchObject({ w: 15, d: 13.5 })
  })
  it('T2 same room, open to dining: 15 x 11 ft', () => {
    expect(minimumSize(living({ open: 'yes' }))).toMatchObject({ w: 15, d: 11 })
  })
  it('T3 office, 1 person, 6 ft desk, shelf wall: 10 x 10 ft', () => {
    const r = office()
    expect(r.answers).toMatchObject({ people: '1', desk: '6', storage: 'shelf' })
    expect(minimumSize(r)).toMatchObject({ w: 10, d: 10 })
  })
  it('T4 T1 room set to 20 x 20 ft: accepted, spare 197.5 ft² (save and reload: test/rules.test.js)', () => {
    const c = checkSize(living(), 20, 20)
    expect(c.status).toBe('fits')
    expect(c.spare).toBeCloseTo(197.5, 6)
    expect(c.costLow).toBeCloseTo(197.5 * 175, 6)
    expect(c.costHigh).toBeCloseTo(197.5 * 275, 6)
  })
  it('T5 T1 room set to 14 x 13 ft: too small, width short 1.0, depth short 0.5, smallest changes listed', () => {
    const c = checkSize(living(), 14, 13)
    expect(c.status).toBe('too-small')
    expect(c.shortW).toBeCloseTo(1.0, 6)
    expect(c.shortD).toBeCloseTo(0.5, 6)
    expect(c.changes.length).toBeGreaterThan(0)
    for (const ch of c.changes) expect(ch.changes.length).toBeLessThanOrEqual(2)
    expect(c.min).toMatchObject({ w: 15, d: 13.5 })
  })
  it('T6 round trip: each minimum passes its own check; 0.5 ft smaller fails', () => {
    const rooms = [living(), living({ open: 'yes' }), office(), ...['dining', 'primary', 'kid', 'mudroom'].map((t) => newRoom(t))]
    for (const r of rooms) {
      const m = minimumSize(r)
      expect(checkSize(r, m.w, m.d).status, r.type).toBe('fits')
      expect(checkSize(r, m.w - 0.5, m.d).status, r.type).toBe('too-small')
      expect(checkSize(r, m.w, m.d - 0.5).status, r.type).toBe('too-small')
    }
  })
})
