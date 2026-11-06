// SPEC §14 batch C (Red Deer), tests M1–M8. Facts checked on the official pages 2026-11-06.
import { describe, expect, it } from 'vitest'
import * as A from '../src/plan/alberta.js'
import { newLot, lotFt } from '../src/lot/lot.js'
import { applyOptions, newRoom } from '../src/rooms/types.js'
import { RULES } from '../src/rules.js'

describe('SPEC §14 batch C', () => {
  it('M1 the final rules checklist has the 6 code items with their NBC(AE) 2023 clauses', () => {
    expect(A.CODE_ITEMS.map((c) => `${c.id} ${c.clause}`)).toEqual(['egress 9.9.10.1', 'smoke 9.10.19', 'co 9.32.3.9', 'vent 9.32.3', 'stairs 9.8.4', 'radon 9.13.4'])
  })
  it('M2 a bedroom-ready office (and bedrooms) need the egress window; a plain office does not', () => {
    const office = newRoom('office'), ready = applyOptions(newRoom('office'), { bedroom_ready: true }), kid = newRoom('kid')
    expect(A.egressRooms([office]).length).toBe(0)
    expect(A.egressRooms([office, ready, kid]).map((r) => r.id)).toEqual([ready.id, kid.id])
  })
  it('M3 the building permit waits for the development permit and the 4 subtrade applications', () => {
    expect(A.bpBlocked({})).toBe(true)
    expect(A.bpBlocked({ dp: 'issued', electrical: 'applied', gas: 'applied', heating: 'applied' })).toBe(true)
    expect(A.bpBlocked({ dp: 'applied', electrical: 'applied', gas: 'applied', heating: 'applied', plumbing: 'applied' })).toBe(true)
    expect(A.bpBlocked({ dp: 'issued', electrical: 'applied', gas: 'issued', heating: 'applied', plumbing: 'applied' })).toBe(false)
  })
  it('M4 Fill from R-L sets setbacks 3.0 / 7.5 / 1.5 / 1.5 m, height 15 m (49.2 ft) and coverage 45%', () => {
    const lot = A.fillFromRL(newLot())
    const L = lotFt(lot)
    expect(L.front).toBeCloseTo(3 / 0.3048, 6); expect(L.rear).toBeCloseTo(7.5 / 0.3048, 6)
    expect(L.left).toBeCloseTo(1.5 / 0.3048, 6); expect(L.right).toBeCloseTo(1.5 / 0.3048, 6)
    expect(lot.site).toMatchObject({ zone: 'R-L', maxHeightFt: 49.2, maxCoveragePct: 45 })
    expect(L.w).toBe(60) // the lot size is unchanged
  })
  it('M5 the rate rows show their source and date', () => {
    const rows = RULES.filter((r) => r.id === 'elecRate' || r.id === 'elecDaily')
    expect(rows.map((r) => [r.value, r.unit, r.date])).toEqual([[12.06, '¢/kWh', '2026-11-06'], [0.2498, '$/day', '2026-11-06']])
    rows.forEach((r) => expect(r.source).toMatch(/Red Deer/))
  })
  // M6 (the pre-approval sets the budget goal) is a screen check: the headless run presses the button and reads the Budget tab.
  it('M7 draw advances that do not add up to the loan are flagged', () => {
    expect(A.drawCheck({ loan: 500000, draws: { 2: 100000, 3: 150000, 4: 150000, 5: 100000 } })).toMatchObject({ sum: 500000, ok: true })
    expect(A.drawCheck({ loan: 500000, draws: { 2: 100000, 3: 150000 } })).toMatchObject({ sum: 250000, diff: -250000, ok: false })
    expect(A.drawCheck({ draws: { 2: 1 } }).ok).toBe(false)
  })
  it('M8 possession 2028-06-01 gives warranty walks in 2029, 2030, 2033 and 2038', () => {
    expect(A.warrantyWalks('2028-06-01').map((w) => [w.date, w.key])).toEqual([['2029-06-01', 'labour'], ['2030-06-01', 'systems'], ['2033-06-01', 'envelope'], ['2038-06-01', 'structure']])
    expect(A.warrantyWalks('')).toEqual([])
  })
})
