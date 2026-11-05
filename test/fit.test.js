// Test fit (SPEC §11 P5) and sizes you know (§6 R13): tests F1–F5 (F6, save and reload, in rules.test.js).
import { describe, expect, it } from 'vitest'
import { copyToRooms, fitRoom, fitVerdict, knownSizes, rectFt } from '../src/trace/fit.js'
import { sampleFit } from './helpers/sample-fit.js'
import { mToFt } from '../src/units.js'

const room = (t, id) => t.levels[0].rooms.find((r) => r.id === id)

describe('Test fit (SPEC §11 P5, R13)', () => {
  it('F1 the sample Living room (20 x 18) as a Family TV room fits, spare 157.5 ft²', () => {
    const t = sampleFit()
    expect(rectFt(t, room(t, 'liv'))).toEqual({ w: expect.closeTo(20, 6), d: expect.closeTo(18, 6) })
    const v = fitVerdict(t, room(t, 'liv'))
    expect(v.status).toBe('fits')
    expect(v.spare).toBeCloseTo(157.5, 6)
  })

  it('F2 the sample Bath (6 x 12) as a home office is too small: width short 4.0 ft, depth 0, with a way out', () => {
    const t = sampleFit()
    const v = fitVerdict(t, room(t, 'bath'))
    expect(v.status).toBe('too-small')
    expect(v.shortW).toBeCloseTo(4, 6); expect(v.shortD).toBeCloseTo(0, 6)
    expect(v.min).toMatchObject({ w: 10, d: 10 })
  })

  it('F3 a traced room that is not a rectangle says the check needs a rectangle', () => {
    const t = sampleFit()
    t.levels[0].rooms.push({ id: 'ell', name: 'L room', pts: [{ x: 60, y: 80 }, { x: 460, y: 80 }, { x: 460, y: 260 }, { x: 260, y: 260 }, { x: 260, y: 440 }, { x: 60, y: 440 }] })
    t.fit.rooms.ell = fitRoom('living')
    expect(rectFt(t, room(t, 'ell'))).toBeNull()
    expect(fitVerdict(t, room(t, 'ell')).status).toBe('not-rect')
    expect(fitVerdict(t, room(t, 'bed1')).status).toBe('no-type')
  })

  it("F4 R13: a living room shows the traced living room's 20 x 18 as a size you know", () => {
    const t = sampleFit()
    const k = knownSizes(t, 'living')
    expect(k).toHaveLength(1)
    expect(k[0]).toMatchObject({ name: 'Living' })
    expect(k[0].w).toBeCloseTo(20, 6); expect(k[0].d).toBeCloseTo(18, 6)
    expect(knownSizes(t, 'kid')).toEqual([])
    expect(knownSizes({ ...t, fit: { ...t.fit, on: false } }, 'living')).toEqual([])
  })

  it('F5 "Copy into Rooms" adds rooms at their traced sizes and leaves the traced plan unchanged', () => {
    const t = sampleFit(), before = structuredClone(t)
    const rooms = copyToRooms(t)
    expect(rooms.map((r) => [r.type, r.name])).toEqual([['living', 'Living'], ['office', 'Bath']])
    expect(mToFt(rooms[0].size.w)).toBeCloseTo(20, 6); expect(mToFt(rooms[0].size.d)).toBeCloseTo(18, 6)
    expect(rooms[0].source).toEqual({ traceRoomId: 'liv' })
    expect(rooms[0].items.length).toBe(t.fit.rooms.liv.items.length)
    expect(rooms[0].items.every((i) => !t.fit.rooms.liv.items.some((j) => j.id === i.id))).toBe(true)
    expect(t).toEqual(before)
  })
})
