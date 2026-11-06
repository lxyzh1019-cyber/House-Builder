// SPEC v1 §7 lot board tests L1–L6 (L7, save and reload, is in test/rules.test.js).
import { describe, expect, it } from 'vitest'
import { applyOptions, newRoom } from '../src/rooms/types.js'
import { lotFt, lotState, moveRoom, newLot, rotateRoom } from '../src/lot/lot.js'
import { ftToM, mToFt } from '../src/units.js'

const at = (room, x, y, rot = 0) => ({ ...room, place: { x: ftToM(x), y: ftToM(y), rot } })
const fx = (r) => Math.round(mToFt(r.place.x) * 1000) / 1000
const fy = (r) => Math.round(mToFt(r.place.y) * 1000) / 1000
const openLiving = () => applyOptions(newRoom('living'), { open: true })

describe('SPEC §7 lot board', () => {
  it('L1 a new lot is 60 x 100 ft and rooms drag on it with 2 ft snap', () => {
    const lot = newLot()
    expect(lotFt(lot)).toMatchObject({ w: 60, d: 100 })
    const rooms = [at(newRoom('office'), 10, 10)]
    const moved = moveRoom(rooms, [], rooms[0].id, 13.3, 24.9, {})
    expect([fx(moved[0]), fy(moved[0])]).toEqual([14, 24])
  })
  it('L2 a room rotates 90°', () => {
    const r = at(newRoom('living'), 10, 10)
    const [t] = rotateRoom([r], r.id, {})
    expect(t.place.rot).toBe(90)
    const st = lotState([t], newLot(), {})[t.id]
    expect([st.fp.w, st.fp.d]).toEqual([13.5, 15]) // 15 x 13.5 turned
  })
  it('L3 two overlapping rooms are flagged', () => {
    const a = at(newRoom('office'), 10, 10), b = at(newRoom('dining'), 15, 15)
    const st = lotState([a, b], newLot(), {})
    expect(st[a.id].overlap).toContain(b.id)
    expect(st[b.id].overlap).toContain(a.id)
    const c = at(newRoom('dining'), 30, 30)
    expect(lotState([a, c], newLot(), {})[a.id].overlap).toEqual([])
  })
  it('L4 a room crossing a setback line is flagged', () => {
    const lot = { ...newLot(), setbacks: { front: ftToM(20), rear: ftToM(25), left: ftToM(4), right: ftToM(4) } }
    const inside = at(newRoom('office'), 10, 24), cross = at(newRoom('office'), 10, 15)
    const st = lotState([inside, cross], lot, {})
    expect(st[inside.id].outside).toEqual([])
    expect(st[cross.id].outside).toContain('front setback')
  })
  it('L5 T1 living room (open) against an open dining room needs 15 x 11; moved away it needs 15 x 13.5', () => {
    const living = at(openLiving(), 10, 20)          // base 15 x 13.5: its open (s) side at y = 33.5
    const dining = at(newRoom('dining'), 10, 33.5)   // dining's open (n) side at y = 33.5
    let st = lotState([living, dining], newLot(), {})
    expect(st[living.id].shared).toBe(true)
    expect(st[living.id].min).toMatchObject({ w: 15, d: 11 })
    expect(st[living.id].fp.y + st[living.id].fp.d).toBeCloseTo(33.5, 6) // still touching after it shrinks
    const away = at(living, 10, 2)
    st = lotState([away, dining], newLot(), {})
    expect(st[living.id].shared).toBe(false)
    expect(st[living.id].min).toMatchObject({ w: 15, d: 13.5 })
  })
  it('L6 a glued core route moves as one', () => {
    const mud = at(newRoom('mudroom'), 10, 40), din = at(newRoom('dining'), 22, 40), off = at(newRoom('office'), 40, 70)
    const clusters = [{ id: 'c1', name: 'Core route', roomIds: [mud.id, din.id] }]
    const moved = moveRoom([mud, din, off], clusters, mud.id, 14, 46, {})
    expect([fx(moved[0]), fy(moved[0])]).toEqual([14, 46])
    expect([fx(moved[1]), fy(moved[1])]).toEqual([26, 46])
    expect([fx(moved[2]), fy(moved[2])]).toEqual([40, 70])
  })
})
