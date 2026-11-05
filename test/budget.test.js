// Budget meter (SPEC §8), tests B2–B5 (B1 and B6, every line saved and reloaded, in rules.test.js).
// Made-up numbers only: no family budget goes in the repo.
import { describe, expect, it } from 'vitest'
import { budgetState, newBudget } from '../src/budget/budget.js'
import { lotState, newLot } from '../src/lot/lot.js'
import { applyAnswers, newRoom } from '../src/rooms/types.js'
import { ftToM } from '../src/units.js'

const at = (r, x, y) => ({ ...r, place: { x: ftToM(x), y: ftToM(y), rot: 0 } })
const living = () => { const r = newRoom('living', 'Family TV room'); return applyAnswers(r, r.answers) }
const setup = () => {
  const rooms = [at(living(), 10, 20), at(newRoom('office'), 30, 20), newRoom('dining')] // dining not on the lot
  return { rooms, st: lotState(rooms, newLot(), {}) }
}

describe('Budget meter (SPEC §8)', () => {
  it('B2 a goal of 800,000 with a 200,000 lot inside it and no rooms leaves 600,000', () => {
    const s = budgetState({ ...newBudget(), goal: 800000, lotPrice: 200000 }, [], {})
    expect(s.left).toEqual({ lo: 600000, hi: 600000 })
    expect(budgetState(newBudget(), [], {}).left).toBeNull() // no goal typed yet
  })

  it('B3 the T1 living room and an office on the lot = 302.5 ft², build 52,937.50 – 83,187.50', () => {
    const { rooms, st } = setup()
    const s = budgetState({ ...newBudget(), goal: 800000, lotPrice: 200000 }, rooms, st)
    expect(s.area).toBeCloseTo(302.5, 6)
    expect(s.build.lo).toBeCloseTo(52937.5, 6); expect(s.build.hi).toBeCloseTo(83187.5, 6)
    expect(s.counted).toHaveLength(2); expect(s.notCounted).toEqual([rooms[2].id])
    // a changed rate in the Rules table changes the meter
    expect(budgetState({ goal: 1 }, rooms, st, { rateLow: 200 }).build.lo).toBeCloseTo(60500, 6)
  })

  it('B4 10% contingency (on build cost) and 30,000 soft costs: total 288,231.25 – 321,506.25, left 511,768.75 – 478,493.75', () => {
    const { rooms, st } = setup()
    const b = { ...newBudget(), goal: 800000, lotPrice: 200000, contingencyPct: 10, soft: [{ id: 'a', name: 'Permits', amount: 12000 }, { id: 'b', name: 'Design', amount: 18000 }] }
    const s = budgetState(b, rooms, st)
    expect(s.cont.lo).toBeCloseTo(5293.75, 6); expect(s.cont.hi).toBeCloseTo(8318.75, 6)
    expect(s.total.lo).toBeCloseTo(288231.25, 6); expect(s.total.hi).toBeCloseTo(321506.25, 6)
    expect(s.left.lo).toBeCloseTo(511768.75, 6); expect(s.left.hi).toBeCloseTo(478493.75, 6)
    expect(s.over).toBe(false)
    expect(budgetState({ ...b, goal: 300000 }, rooms, st)).toMatchObject({ over: true, overAtLow: false })
  })

  it('B5 taking the lot out of the goal leaves 711,768.75 – 678,493.75', () => {
    const { rooms, st } = setup()
    const b = { ...newBudget(), goal: 800000, lotPrice: 200000, lotInGoal: false, contingencyPct: 10, soft: [{ id: 'a', name: 'Soft', amount: 30000 }] }
    const s = budgetState(b, rooms, st)
    expect(s.lot).toBe(0)
    expect(s.left.lo).toBeCloseTo(711768.75, 6); expect(s.left.hi).toBeCloseTo(678493.75, 6)
  })
})
