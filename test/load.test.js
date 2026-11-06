// A saved project opens with its own rooms, whatever else it has or lacks (regression: rooms were replaced
// by the starting rooms when a project had no trace or no budget).
import { describe, expect, it } from 'vitest'
import { startFrom } from '../src/load.js'
import { newRoom } from '../src/rooms/types.js'

describe('opening a project', () => {
  const mine = [newRoom('kid'), newRoom('dining')]
  it.each([
    ['rooms only', { rooms: mine }],
    ['rooms and a trace, no budget', { rooms: mine, trace: { levels: [], checks: [] } }],
    ['rooms and a budget, no trace', { rooms: mine, budget: { goal: 1 } }],
    ['rooms, trace and budget', { rooms: mine, trace: { levels: [], checks: [] }, budget: { goal: 1 } }],
  ])('keeps the saved rooms: %s', (_, data) => {
    const p = startFrom(data)
    expect(p.isNew).toBe(false)
    expect(p.rooms).toBe(mine)
    if (data.trace) expect(p.trace).toBe(data.trace)
    if (data.budget) expect(p.budget).toBe(data.budget)
  })
  it('a new project starts with the living room and the office', () => {
    for (const data of [null, {}, { rooms: [] }, { budget: { goal: 5 } }]) {
      const p = startFrom(data)
      expect(p.isNew).toBe(true)
      expect(p.rooms.map((r) => r.type)).toEqual(['living', 'office'])
    }
  })
})
