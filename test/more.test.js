// SPEC §15 batch D, tests W1–W14 (made-up data). Save and reload of the plan fields: test/rules.test.js.
import { describe, expect, it } from 'vitest'
import * as M from '../src/plan/more.js'
import * as P from '../src/plan/plan.js'
import { CODE_ITEMS } from '../src/plan/alberta.js'
import { budgetState, newBudget } from '../src/budget/budget.js'
import { lotState, newLot } from '../src/lot/lot.js'
import { newRoom } from '../src/rooms/types.js'
import { ftToM } from '../src/units.js'

const at = (r, x, y) => ({ ...r, place: { x: ftToM(x), y: ftToM(y), rot: 0 } })

describe('SPEC §15 batch D', () => {
  it('W1 a gate\'s time and cost add up in its stage', () => {
    const steps = { D4: { lead: 'Parent A', ai: 'Claude', hours: 3, cost: 0 }, D5: { hours: 1.5, cost: 250 } }
    expect(M.stageEffort(steps, ['D4', 'D5'])).toEqual({ hours: 4.5, cost: 250 })
  })
  it('W2 a pain point goes to the idea inbox once, as captured', () => {
    const pp = { ...M.newPain(), text: 'Boots pile up at the door' }
    const r = M.sendPain([pp], [], pp.id, 'kim', 'Mudroom')
    expect(r.ideas).toEqual([expect.objectContaining({ text: 'Boots pile up at the door', status: 'captured', tag: 'Mudroom' })])
    expect(r.pains[0].sent).toBe(true)
    expect(M.sendPain(r.pains, r.ideas, pp.id, 'kim').ideas).toHaveLength(1)
  })
  it('W3 three tagged pictures give the style profile in count order', () => {
    const pics = [{ tags: ['Warm wood', 'open'] }, { tags: ['warm wood', 'white'] }, { tags: ['Warm Wood ', 'open'] }]
    expect(M.styleProfile(pics)).toEqual([{ tag: 'warm wood', n: 3 }, { tag: 'open', n: 2 }, { tag: 'white', n: 1 }])
  })
  it('W4 the lot checklist starts with the 5 checked Red Deer items', () => {
    expect(M.LOT_START).toEqual(['zone', 'title', 'soils', 'setbacks', 'grade'])
  })
  it('W5 the 7 sprints in order; a sprint shows its rooms\' fit and the open code items', () => {
    expect(M.SPRINTS.map((s) => s.id)).toEqual(['D4a', 'D4b', 'D4c', 'D4d', 'D4e', 'D4f', 'D4g'])
    const off = { ...newRoom('office'), size: { w: ftToM(8), d: ftToM(8) } }
    const st = lotState([at(off, 10, 10)], newLot(), {})
    const c = M.sprintChecks({ roomIds: [off.id] }, [off], st, { egress: 'met', smoke: 'na' }, CODE_ITEMS)
    expect(c.fit).toEqual([{ id: off.id, name: 'Office', status: 'too-small' }])
    expect(c.openCode).toEqual(['co', 'vent', 'stairs', 'radon'])
  })
  it('W6 a design item card lists the rooms in its impact chain', () => {
    const card = { ...M.newItemCard(), item: 'Move the stair', impactRoomIds: ['a', 'b'], keep: true }
    expect(card.impactRoomIds).toHaveLength(2); expect(M.VERDICTS).toContain(card.verdict)
  })
  it('W7 weights 2 and 1 with scores 8 and 5 give 7.0; a failed gate shows instead of a total', () => {
    const sheet = { ...M.newSheet(), criteria: [{ id: 'c1', weight: 2 }, { id: 'c2', weight: 1, gate: true }], options: [{ id: 'o1' }], scores: { 'o1|c1': 8, 'o1|c2': 5 } }
    expect(M.sheetTotal(sheet, 'o1')).toEqual({ failsGate: false, total: 7 })
    expect(M.sheetTotal({ ...sheet, gateFail: { 'o1|c2': true } }, 'o1')).toEqual({ failsGate: true, total: null })
  })
  it('W8 the systems checklist has the 9 lines', () => {
    expect(M.SYSTEMS).toEqual(['smart', 'hvac', 'radon', 'filters', 'humidity', 'efficiency', 'ev', 'solar', 'sound'])
  })
  it('W9 three work packages total their allowances', () => {
    expect(M.allowanceTotal([{ allowance: 12000 }, { allowance: 8500 }, { allowance: null }])).toBe(20500)
  })
  it('W10 a builder price above the high build total is flagged', () => {
    const rooms = [at(newRoom('living'), 10, 20), at(newRoom('office'), 30, 20)]
    const bs = budgetState({ ...newBudget(), goal: 800000 }, rooms, lotState(rooms, newLot(), {}))
    expect(M.priceCheck(90000, bs)).toMatchObject({ aboveHigh: true }) // high build total is 79,200 (288 ft² × 275)
    expect(M.priceCheck(60000, bs)).toMatchObject({ aboveHigh: false, belowLow: false })
    expect(M.priceCheck(null, bs)).toBeNull()
  })
  it('W11 possession walk items count open per room', () => {
    const items = [M.newWalkItem('r1', 'scratch'), { ...M.newWalkItem('r1', 'door sticks'), fixed: true }, M.newWalkItem('r2', 'paint')]
    expect(M.openWalkItems(items, 'r1')).toBe(1); expect(M.openWalkItems(items)).toBe(2)
  })
  it('W12 a kitchen alone warns; touching a back kitchen clears it', () => {
    const k = at(newRoom('kitchen'), 10, 10), alone = lotState([k], newLot(), {})
    expect(M.lonelyWetRooms([k], alone)).toEqual([k.id])
    const bk = at(newRoom('backkitchen'), 22, 10) // the kitchen is 12 ft wide: touches at x = 22
    const both = lotState([k, bk], newLot(), {})
    expect(M.lonelyWetRooms([k, bk], both)).toEqual([])
  })
  it('W13 fill and hallway share for 2 made-up rooms', () => {
    const a = at({ ...newRoom('garage'), size: { w: ftToM(10), d: ftToM(10) } }, 0, 0)
    const b = at({ ...newRoom('garage'), size: { w: ftToM(10), d: ftToM(10) } }, 10, 10)
    const s = M.shapeStats([a, b], lotState([a, b], newLot(), {}))
    expect(s.box).toBeCloseTo(400, 6); expect(s.filled).toBeCloseTo(200, 6)
    expect(s.fillPct).toBeCloseTo(50, 6); expect(s.hallPct).toBeCloseTo(50, 6); expect(s.target).toBe(12)
  })
  it('W14 an unmarked room is listed; marking it now clears it', () => {
    const r = newRoom('office')
    expect(M.unmarkedRooms([r])).toEqual([r.id]); expect(M.unmarkedRooms([{ ...r, phase: 'now' }])).toEqual([])
  })
})
