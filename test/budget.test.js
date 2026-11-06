// Budget meter (SPEC §8), tests B2–B5 (B3–B5 worked out again for the 9 x 9.5 ft office, chat-D39) (B1 and B6, every line saved and reloaded, in rules.test.js).
// Made-up numbers only: no family budget goes in the repo.
import { describe, expect, it } from 'vitest'
import { budgetState, newBudget } from '../src/budget/budget.js'
import { lotState, newLot } from '../src/lot/lot.js'
import { newRoom } from '../src/rooms/types.js'
import { ftToM } from '../src/units.js'

const at = (r, x, y) => ({ ...r, place: { x: ftToM(x), y: ftToM(y), rot: 0 } })
const living = () => newRoom('living')
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

  it('B3 the T1 living room and the T3 office on the lot = 288 ft², build 50,400 – 79,200', () => {
    const { rooms, st } = setup()
    const s = budgetState({ ...newBudget(), goal: 800000, lotPrice: 200000 }, rooms, st)
    expect(s.area).toBeCloseTo(288, 6)
    expect(s.build.lo).toBeCloseTo(50400, 6); expect(s.build.hi).toBeCloseTo(79200, 6)
    expect(s.counted).toHaveLength(2); expect(s.notCounted).toEqual([rooms[2].id])
    // a changed rate in the Rules table changes the meter
    expect(budgetState({ goal: 1 }, rooms, st, { rateLow: 200 }).build.lo).toBeCloseTo(57600, 6)
  })

  it('B4 10% contingency (on build cost) and 30,000 soft costs: total 285,440 – 317,120, left 514,560 – 482,880', () => {
    const { rooms, st } = setup()
    const b = { ...newBudget(), goal: 800000, lotPrice: 200000, contingencyPct: 10, soft: [{ id: 'a', name: 'Permits', amount: 12000 }, { id: 'b', name: 'Design', amount: 18000 }] }
    const s = budgetState(b, rooms, st)
    expect(s.cont.lo).toBeCloseTo(5040, 6); expect(s.cont.hi).toBeCloseTo(7920, 6)
    expect(s.total.lo).toBeCloseTo(285440, 6); expect(s.total.hi).toBeCloseTo(317120, 6)
    expect(s.left.lo).toBeCloseTo(514560, 6); expect(s.left.hi).toBeCloseTo(482880, 6)
    expect(s.over).toBe(false)
    expect(budgetState({ ...b, goal: 300000 }, rooms, st)).toMatchObject({ over: true, overAtLow: false })
  })

  it('B5 taking the lot out of the goal leaves 714,560 – 682,880', () => {
    const { rooms, st } = setup()
    const b = { ...newBudget(), goal: 800000, lotPrice: 200000, lotInGoal: false, contingencyPct: 10, soft: [{ id: 'a', name: 'Soft', amount: 30000 }] }
    const s = budgetState(b, rooms, st)
    expect(s.lot).toBe(0)
    expect(s.left.lo).toBeCloseTo(714560, 6); expect(s.left.hi).toBeCloseTo(682880, 6)
  })
})
