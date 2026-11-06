// SPEC §13 batch A, tests K1–K16 (save and reload of every field in test/rules.test.js). Made-up data only.
import { describe, expect, it } from 'vitest'
import * as P from '../src/plan/plan.js'
import { budgetState, newBudget } from '../src/budget/budget.js'
import { lotState, newLot } from '../src/lot/lot.js'
import { newRoom } from '../src/rooms/types.js'
import { ftToM } from '../src/units.js'

const at = (r, x, y) => ({ ...r, place: { x: ftToM(x), y: ftToM(y), rot: 0 } })
const b4 = () => { // the made-up B4 case: T1 living room + T3 office on the lot, goal 800,000, lot 200,000, 10%, soft 30,000
  const rooms = [at(newRoom('living'), 10, 20), at(newRoom('office'), 30, 20)]
  const budget = { ...newBudget(), goal: 800000, lotPrice: 200000, contingencyPct: 10, soft: [{ id: 's', name: 'Soft', amount: 30000 }] }
  return { rooms, budget, st: lotState(rooms, newLot(), {}) }
}

describe('13.1 schedule view', () => {
  it('K1 7 stages with the 19 gates in SPEC §1 order', () => {
    expect(P.STAGES.map((s) => s.n)).toEqual([0, 1, 2, 3, 4, 5, 6])
    const all = P.STAGES.flatMap((s) => s.gates)
    expect(all).toEqual(['D1', 'D4', 'D5', 'D7', 'D8', 'D9', 'D6', 'D18', 'D19', 'D10', 'D11', 'D12', 'D13', 'D14', 'D15', 'D16', 'D17', 'D21', 'D20'])
    expect(all).toHaveLength(19)
  })
  it('K2 passing a gate saves date and who; a stage with every gate passed or not needed is done', () => {
    let s = P.newSchedule()
    s = P.setGate(s, 'D4', 'passed', 'tess')
    expect(s.gates.D4).toMatchObject({ status: 'passed', by: 'tess' })
    expect(s.gates.D4.at).toMatch(/^\d{4}-\d\d-\d\dT/)
    const st2 = P.STAGES[2]
    expect(P.stageDone(s, st2)).toBe(false)
    s = P.setGate(s, 'D5', 'na', 'tess')
    expect(P.stageDone(s, st2)).toBe(true)
    expect(P.stageDone(s, P.STAGES[0])).toBe(false)
  })
  it('K3 D5 shows the budget verdict (B4 numbers: within the goal)', () => {
    const { rooms, budget, st } = b4()
    expect(P.d5Verdict(budgetState(budget, rooms, st))).toBe('ok')
    expect(P.d5Verdict(budgetState({ ...budget, goal: 300000 }, rooms, st))).toBe('lowOnly')
    expect(P.d5Verdict(budgetState({ ...budget, goal: 200000 }, rooms, st))).toBe('over')
    expect(P.d5Verdict(budgetState(newBudget(), rooms, st))).toBe('noGoal')
  })
})

describe('13.2–13.3 liked plans and cheap wins', () => {
  it('K4 a plan with 2 reasons; one sent to the checklist shows open, then met', () => {
    let plan = P.addReason(P.addReason(P.newLikedPlan('Bungalow A'), 'mudroom off the garage'), 'big pantry')
    let { plans, checklist } = P.sendToChecklist([plan], [], plan.id, plan.reasons[0].id)
    expect(checklist).toEqual([expect.objectContaining({ text: 'mudroom off the garage', status: 'open', planName: 'Bungalow A' })])
    expect(plans[0].reasons[0].toChecklist).toBe(true)
    expect(P.sendToChecklist(plans, checklist, plan.id, plan.reasons[0].id).checklist).toHaveLength(1) // not twice
  })
  it('K5 only kept cheap wins show when the budget is over the goal', () => {
    const { rooms, budget, st } = b4()
    const wins = [{ ...P.newWin(), name: 'Paint later', status: 'keep' }, { ...P.newWin(), name: 'Basic taps', status: 'idea' }]
    expect(P.keptWins(wins, budgetState(budget, rooms, st))).toEqual([])
    expect(P.keptWins(wins, budgetState({ ...budget, goal: 300000 }, rooms, st)).map((w) => w.name)).toEqual(['Paint later'])
  })
})

describe('13.4 plan versions', () => {
  const design = () => ({ rooms: [{ ...newRoom('office'), id: 'off', size: { w: ftToM(9), d: ftToM(9.5) } }], answers: {}, lot: newLot(), clusters: [], budget: newBudget() })
  it('K6 save v1, resize, save v2: compare lists the resized room old -> new', () => {
    const d1 = design()
    let { versions } = P.saveVersion([], d1, 'v1', 'tess')
    const d2 = { ...d1, rooms: [{ ...d1.rooms[0], size: { w: ftToM(10), d: ftToM(12) } }, { ...newRoom('dining'), id: 'din' }] }
    versions = P.saveVersion(versions, d2, 'v2', 'tess').versions
    const c = P.compareVersions(versions[0], versions[1])
    expect(c.resized).toEqual([expect.objectContaining({ id: 'off', from: { w: ftToM(9), d: ftToM(9.5) }, to: { w: ftToM(10), d: ftToM(12) } })])
    expect(c.added.map((r) => r.id)).toEqual(['din'])
    expect(c.removed).toEqual([])
  })
  it('K7 restore v1 brings the old size back and keeps the replaced design as a new version', () => {
    const d1 = design()
    const v = P.saveVersion([], d1, 'v1').versions
    const now = { ...d1, rooms: [{ ...d1.rooms[0], size: { w: ftToM(12), d: ftToM(12) } }] }
    const r = P.restoreVersion(v, now, v[0].id, 'tess')
    expect(r.design.rooms[0].size).toEqual({ w: ftToM(9), d: ftToM(9.5) })
    expect(r.versions).toHaveLength(2)
    expect(r.versions[1].design.rooms[0].size).toEqual({ w: ftToM(12), d: ftToM(12) })
  })
  it('K8 (part) at most 20 versions; a 21st is refused, nothing removed', () => {
    let v = []
    for (let i = 0; i < 20; i++) v = P.saveVersion(v, design(), `v${i}`).versions
    const r = P.saveVersion(v, design(), 'v21')
    expect(r.full).toBe(true); expect(r.versions).toHaveLength(20)
  })
})

describe('13.5–13.6 ideas and decision cards', () => {
  it('K9 an idea moves through the statuses in order; decided needs keep, drop or later; only keep goes on to applied', () => {
    let i = P.newIdea('Window seat in the den', 'tess', 'living')
    for (const s of ['sorted', 'analysed', 'shown']) { i = P.moveIdea(i, 'tess'); expect(i.status).toBe(s) }
    expect(P.moveIdea(i, 'tess').status).toBe('shown') // no decision given: stays
    const dropped = P.moveIdea(i, 'tess', 'drop')
    expect(dropped).toMatchObject({ status: 'decided', decision: 'drop' })
    expect(P.moveIdea(dropped, 'tess').status).toBe('decided')
    i = P.moveIdea(P.moveIdea(i, 'tess', 'keep'), 'tess')
    expect(i.status).toBe('applied')
    expect(i.history.map((h) => h.status)).toEqual(P.IDEA_STEPS)
  })
  it('K10 counts per status', () => {
    const a = P.newIdea('a'), b = P.moveIdea(P.newIdea('b'))
    expect(P.countByStatus([a, b])).toMatchObject({ captured: 1, sorted: 1, analysed: 0 })
  })
  it('K11 a card with 3 options and 3 criteria saves the pick; + New comparison copies the criteria, no options', () => {
    let c = P.newCard('Heat pump or furnace?')
    for (const o of ['Heat pump', 'Furnace', 'Hybrid']) c = P.addOption(c, o)
    c = P.setCell(c, c.options[0].id, c.criteria[0].id, 'higher up front')
    c = P.decideCard(c, c.options[2].id, 'cold snaps', 'tess')
    expect(c).toMatchObject({ status: 'decided', pick: c.options[2].id, why: 'cold snaps' })
    const n = P.copyCriteria(c)
    expect(n.criteria.map((x) => x.key)).toEqual(c.criteria.map((x) => x.key))
    expect(n.options).toEqual([]); expect(n.status).toBe('open')
    expect(P.decideCard(P.addOption(P.newCard('x'), 'only one'), 'nope', '')).toMatchObject({ status: 'open' })
  })
})

describe('13.7–13.8 hidden works and build tracking', () => {
  it('K13 a hidden-works item shows under its decide stage and its build stage', () => {
    const h = { ...P.newHidden(), text: 'Blocking for grab bars', decideStage: 2, buildStage: 5 }
    expect(P.hiddenInStage([h], 2)).toHaveLength(1); expect(P.hiddenInStage([h], 5)).toHaveLength(1); expect(P.hiddenInStage([h], 3)).toHaveLength(0)
  })
  it('K14 the D21 gate lists items not yet photographed', () => {
    const a = { ...P.newHidden(), photographed: true }, b = P.newHidden()
    expect(P.notPhotographed([a, b]).map((x) => x.id)).toEqual([b.id])
  })
  it('K15 an approved +5,000 change order raises the B4 total by 5,000; a not-approved one changes nothing', () => {
    const { rooms, budget, st } = b4()
    const base = budgetState(budget, rooms, st)
    const yes = budgetState(budget, rooms, st, {}, [{ ...P.newChangeOrder(), amount: 5000, approved: true }])
    const no = budgetState(budget, rooms, st, {}, [{ ...P.newChangeOrder(), amount: 5000, approved: false }])
    expect(yes.total.lo - base.total.lo).toBeCloseTo(5000, 6); expect(yes.total.hi - base.total.hi).toBeCloseTo(5000, 6)
    expect(yes.left.hi).toBeCloseTo(482880 - 5000, 6)
    expect(no.total).toEqual(base.total)
  })
  it('K16 stage planned 100,000 and actual 112,000 shows +12,000; photo ticks count', () => {
    const b = { ...P.newBuild(), stageCost: { 5: { planned: 100000, actual: 112000 } }, photos: { r1: { done: true } } }
    expect(P.stageDiff(b, 5)).toEqual({ planned: 100000, actual: 112000, diff: 12000 })
    expect(P.stageDiff(b, 4).diff).toBeNull()
    expect(P.photoCount(b, [{ id: 'r1' }, { id: 'r2' }])).toBe(1)
  })
})
