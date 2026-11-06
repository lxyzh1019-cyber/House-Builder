// Runs in the Firestore emulator: npm run test:rules
import { sampleFit } from './helpers/sample-fit.js'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { createProject, deleteProject, findProject, listProjects, openProject, saveProject, setMembers } from '../src/projects.js'
import { newRoom } from '../src/rooms/types.js'
import { answer } from '../src/rooms/answers.js'
import { toSaved } from '../src/rooms/migrate.js'
import { startFrom } from '../src/load.js'
import * as PL from '../src/plan/plan.js'
import { checkSize } from '../src/rooms/engine.js'
import { ftToM, mToFt, sizeFt } from '../src/units.js'

let env
const SCENE = JSON.stringify({ v: 1, nodes: {}, rootNodeIds: [] })

beforeAll(async () => {
  const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080').split(':')
  env = await initializeTestEnvironment({
    projectId: 'demo-house-designer',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host, port: Number(port) },
  })
})
afterAll(async () => { await env?.cleanup() })
beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'projects/p1'), { owner: 'alice', scene: SCENE }))
})

const db = (uid) => (uid ? env.authenticatedContext(uid) : env.unauthenticatedContext()).firestore()

describe('projects rules', () => {
  it('owner can read, update and create', async () => {
    await assertSucceeds(getDoc(doc(db('alice'), 'projects/p1')))
    await assertSucceeds(updateDoc(doc(db('alice'), 'projects/p1'), { scene: '{"v":1}' }))
    await assertSucceeds(setDoc(doc(db('alice'), 'projects/p2'), { owner: 'alice', scene: SCENE }))
  })
  it('another user is denied read, update and create-as-someone-else', async () => {
    await assertFails(getDoc(doc(db('bob'), 'projects/p1')))
    await assertFails(updateDoc(doc(db('bob'), 'projects/p1'), { scene: '{}' }))
    await assertFails(setDoc(doc(db('bob'), 'projects/p3'), { owner: 'alice', scene: SCENE }))
  })
  it('signed-out user is denied', async () => {
    await assertFails(getDoc(doc(db(null), 'projects/p1')))
    await assertFails(setDoc(doc(db(null), 'projects/p4'), { owner: 'x', scene: SCENE }))
  })
  it('owner cannot hand the project to another uid (chat-D19)', async () => {
    await assertFails(updateDoc(doc(db('alice'), 'projects/p1'), { owner: 'bob' }))
  })
})

// SPEC §9 family sharing, tests S1–S4 (chat-D33): members by device code (their anonymous account id).
describe('family sharing rules (SPEC §9)', () => {
  const shared = async () => env.withSecurityRulesDisabled((ctx) => setDoc(doc(ctx.firestore(), 'projects/s1'), { owner: 'alice', members: ['phone', 'bob'], memberNames: { phone: 'My phone', bob: 'Bob' }, scene: SCENE, rooms: [] }))
  it('S1 a member reads and writes the project, and finds it in "shared with me"', async () => {
    await shared()
    await assertSucceeds(getDoc(doc(db('bob'), 'projects/s1')))
    await assertSucceeds(updateDoc(doc(db('bob'), 'projects/s1'), { rooms: [{ id: 'r1', type: 'office' }] }))
    const list = await assertSucceeds(listProjects(db('bob'), 'bob'))
    expect(list.map((p) => [p.id, p.role])).toEqual([['s1', 'member']])
  })
  it('S2 a non-member is denied, and finds nothing', async () => {
    await shared()
    await assertFails(getDoc(doc(db('carl'), 'projects/s1')))
    await assertFails(updateDoc(doc(db('carl'), 'projects/s1'), { rooms: [] }))
    expect(await listProjects(db('carl'), 'carl')).toEqual([])
  })
  it('S3 a member cannot add or remove members, rename them, change the owner or delete', async () => {
    await shared()
    await assertFails(updateDoc(doc(db('bob'), 'projects/s1'), { members: ['phone', 'bob', 'carl'] }))
    await assertFails(updateDoc(doc(db('bob'), 'projects/s1'), { members: ['bob'] }))
    await assertFails(updateDoc(doc(db('bob'), 'projects/s1'), { memberNames: { phone: 'x', bob: 'Bob' } }))
    await assertFails(updateDoc(doc(db('bob'), 'projects/s1'), { owner: 'bob' }))
    await assertFails(deleteDoc(doc(db('bob'), 'projects/s1')))
  })
  it('S4 the owner adds and removes members and is the only one who deletes', async () => {
    await shared()
    await assertSucceeds(setMembers(db('alice'), 's1', ['phone', 'bob', 'carl'], { phone: 'My phone', bob: 'Bob', carl: 'Carl' }))
    await assertSucceeds(getDoc(doc(db('carl'), 'projects/s1')))
    await assertSucceeds(setMembers(db('alice'), 's1', ['phone'], { phone: 'My phone' }))
    await assertFails(getDoc(doc(db('bob'), 'projects/s1')))
    await assertSucceeds(deleteProject(db('alice'), 's1'))
  })
  it('S5 two projects per owner: the list has both, and saving one leaves the other as it was', async () => {
    await env.clearFirestore()
    const a = await createProject(db('dana'), 'dana', { setup: { name: 'Lake house' }, rooms: [{ id: 'x' }] })
    const b = await createProject(db('dana'), 'dana', { setup: { name: 'Town house' }, rooms: [{ id: 'y' }] })
    await saveProject(db('dana'), 'dana', b, { rooms: [{ id: 'y2' }] })
    const list = await listProjects(db('dana'), 'dana')
    expect(list.map((p) => p.name).sort()).toEqual(['Lake house', 'Town house'])
    expect((await openProject(db('dana'), a)).rooms).toEqual([{ id: 'x' }])
    expect((await openProject(db('dana'), b)).rooms).toEqual([{ id: 'y2' }])
  })
  it('S6 project setup (name, new or renovation, city, household) survives a reload', async () => {
    await env.clearFirestore()
    const setup = { name: 'Test house', type: 'renovation', city: 'Test City', household: [{ id: 'h1', label: 'Adult 1', group: 'adult' }, { id: 'h2', label: 'Child 1', group: 'child' }] }
    const id = await createProject(db('emma'), 'emma', { setup, rooms: [] })
    expect((await openProject(db('emma'), id)).setup).toEqual(setup)
  })
  it('with the old owner-only rules still published, the app still lists and opens its own projects', async () => {
    const [host, port] = (process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080').split(':')
    const old = await initializeTestEnvironment({ projectId: 'demo-old-rules', firestore: { rules: readFileSync('test/helpers/owner-only.rules', 'utf8'), host, port: Number(port) } })
    try {
      const d = old.authenticatedContext('fay').firestore()
      const id = await createProject(d, 'fay', { setup: { name: 'Mine' }, rooms: [{ id: 'z' }] })
      const list = await listProjects(d, 'fay')
      expect(list.map((p) => [p.id, p.role])).toEqual([[id, 'owner']])
      await saveProject(d, 'fay', id, { rooms: [{ id: 'z2' }] })
      expect((await openProject(d, id)).rooms).toEqual([{ id: 'z2' }])
    } finally { await old.cleanup() }
  })

  it("a member's save keeps the owner and the members list", async () => {
    await shared()
    await saveProject(db('bob'), 'bob', 's1', { rooms: [{ id: 'r9' }], scene: SCENE })
    const p = await openProject(db('alice'), 's1')
    expect(p).toMatchObject({ owner: 'alice', members: ['phone', 'bob'], rooms: [{ id: 'r9' }] })
  })
})

describe('project save and load round trip (emulator)', () => {
  it('create -> save -> find returns the saved scene and rooms', async () => {
    await env.clearFirestore()
    const d = db('carol')
    expect(await findProject(d, 'carol')).toBeNull()
    const id = await createProject(d, 'carol', { scene: '{"v":1}', rooms: [] })
    await saveProject(d, 'carol', id, { scene: '{"v":2}', rooms: [{ id: 'r1', type: 'office' }] })
    const p = await findProject(d, 'carol')
    expect(p).toMatchObject({ id, scene: '{"v":2}', rooms: [{ id: 'r1', type: 'office' }] })
    expect(await findProject(db('dave'), 'dave')).toBeNull()
  })

  it('L7: the lot layout (lot, places, sides, clusters) is saved and survives a reload', async () => {
    await env.clearFirestore()
    const d = db('fred')
    const living = { ...newRoom('living'), place: { x: ftToM(10), y: ftToM(20), rot: 90 }, ports: { n: 'wall', e: 'wall', s: 'open', w: 'door' } }
    const dining = { ...newRoom('dining'), place: { x: ftToM(10), y: ftToM(33.5), rot: 0 } }
    const lot = { w: ftToM(60), d: ftToM(100), setbacks: { front: ftToM(20), rear: ftToM(25), left: ftToM(4), right: ftToM(4) } }
    const clusters = [{ id: 'c1', name: 'Core route', roomIds: [living.id, dining.id] }]
    await createProject(d, 'fred', { scene: '{}', rooms: [living, dining], lot, clusters })
    const p = await findProject(db('fred'), 'fred')
    expect(p.lot).toEqual(lot)
    expect(p.clusters).toEqual(clusters)
    expect(p.rooms[0].place).toEqual(living.place)
    expect(p.rooms[0].ports).toEqual(living.ports)
    expect(p.rooms[1].place).toEqual(dining.place)
  })

  it('I6: a traced plan (scale, levels, walls, doors, windows, rooms, size checks) and the site limits survive a reload', async () => {
    await env.clearFirestore()
    const d = db('gina')
    const trace = {
      image: { kind: 'local', name: 'plan.png', w: 920, h: 740 },
      scale: { a: { x: 60, y: 40 }, b: { x: 860, y: 40 }, ft: 40 },
      levels: [
        { id: 'lv0', name: 'Level 0', walls: [{ id: 'w0', a: { x: 60, y: 80 }, b: { x: 860, y: 80 }, openings: [{ id: 'o1', kind: 'door', t: 0.175, width: 0.9144 }, { id: 'o2', kind: 'window', t: 0.6, width: 1.2192 }] }],
          rooms: [{ id: 'r1', name: 'Living', pts: [{ x: 60, y: 80 }, { x: 460, y: 80 }, { x: 460, y: 440 }, { x: 60, y: 440 }] }] },
        { id: 'lv1', name: 'Level 1', walls: [], rooms: [] },
      ],
      checks: [{ id: 'c1', wallId: 'w0', ft: 40 }],
      opacity: 45,
    }
    const lot = { w: ftToM(60), d: ftToM(100), setbacks: { front: 0, rear: 0, left: 0, right: 0 }, site: { zone: 'RS', maxHeightFt: 30, maxCoveragePct: 40 } }
    await createProject(d, 'gina', { scene: '{}', rooms: [], lot, trace })
    const p = await findProject(db('gina'), 'gina')
    expect(p.trace).toEqual(trace)
    expect(p.lot.site).toEqual(lot.site)
  })

  it('F6: test-fit choices (room types, presets, contents) survive a reload', async () => {
    await env.clearFirestore()
    const d = db('hana')
    const trace = sampleFit()
    await createProject(d, 'hana', { scene: '{}', rooms: [], trace })
    const p = await findProject(db('hana'), 'hana')
    expect(p.trace.fit).toEqual(trace.fit)
    expect(p.trace.fit.rooms.liv.items.length).toBeGreaterThan(0)
  })

  it('B1 + B6: every budget line (goal, lot, lot in goal, soft costs, contingency, both rates) is saved and survives a reload', async () => {
    await env.clearFirestore()
    const d = db('ivan')
    const budget = { goal: 800000, lotPrice: 200000, lotInGoal: false, contingencyPct: 10, soft: [{ id: 's1', name: 'Permits', amount: 12000 }, { id: 's2', name: 'Design', amount: 18000 }] }
    const rules = { rateLow: 180, rateHigh: 290 }
    await createProject(d, 'ivan', { scene: '{}', rooms: [], rules, budget })
    const p = await findProject(db('ivan'), 'ivan')
    expect(p.budget).toEqual(budget)
    expect(p.rules).toEqual(rules)
  })

  it('T4: the T1 living room set to 20 x 20 ft is saved and still 20 x 20 after a reload', async () => {
    await env.clearFirestore()
    const d = db('erin')
    const room = { ...newRoom('living'), size: { w: ftToM(20), d: ftToM(20) } }
    expect(checkSize(room, 20, 20)).toMatchObject({ status: 'fits' })
    const id = await createProject(d, 'erin', { scene: '{}', rooms: [room] })
    // "Reload": a fresh read from Firestore, nothing kept in memory.
    const loaded = (await findProject(db('erin'), 'erin')).rooms[0]
    expect(loaded.id).toBe(room.id)
    expect(sizeFt(mToFt(loaded.size.w), mToFt(loaded.size.d))).toBe('20′ 0″ x 20′ 0″')
    const c = checkSize(loaded, mToFt(loaded.size.w), mToFt(loaded.size.d))
    expect(c.status).toBe('fits')
    expect(c.spare).toBeCloseTo(197.5, 6)
    expect(id).toBeTruthy()
  })

  it('T13: a room set to level basement still shows basement after a reload', async () => {
    await env.clearFirestore()
    const room = { ...newRoom('office'), level: 'basement' }
    await createProject(db('bea'), 'bea', { scene: '{}', rooms: [toSaved(room, {})] })
    const p = startFrom(await findProject(db('bea'), 'bea')) // "reload": a fresh read, as the app opens a project
    expect(p.rooms[0].level).toBe('basement')
    expect(p.rooms[0].options).toEqual(room.options)
  })

  it('T14: q4.1 for a 4-person household sets the mudroom to 4 lockers, saves answers/q4.1, and reads the same after a reload', async () => {
    await env.clearFirestore()
    const household = ['a', 'b', 'c', 'd'].map((id) => ({ id, label: '', group: 'adult' }))
    const mud = { ...newRoom('mudroom'), options: { ...newRoom('mudroom').options, people: 2 } }
    const out = answer({}, [mud], 'q4.1', 'normal', { by: 'tess', household })
    expect(out.rooms[0].options.people).toBe(4)
    expect(out.rooms[0].items.filter((i) => i.part === 'locker')).toHaveLength(4)
    await createProject(db('tess'), 'tess', { scene: '{}', rooms: out.rooms.map((r) => toSaved(r, {})), answers: out.answers, setup: { household } })
    const p = startFrom(await findProject(db('tess'), 'tess'))
    expect(p.answers['q4.1']).toMatchObject({ value: 'normal', answeredBy: 'tess' })
    expect(p.rooms[0].options.people).toBe(4)
    expect(p.rooms[0].items.filter((i) => i.part === 'locker')).toHaveLength(4)
  })

  it('K2 K4 K5 K8 K10 K12 K16: the plan and versions fields are saved and read back after a reload', async () => {
    await env.clearFirestore()
    let plan = PL.newPlan()
    plan.schedule = PL.setGate(plan.schedule, 'D1', 'passed', 'kim')
    const lp = PL.addReason(PL.newLikedPlan('Bungalow A'), 'mudroom off the garage')
    plan = { ...plan, ...PL.sendToChecklist([lp], [], lp.id, lp.reasons[0].id) }
    plan.checklist[0].status = 'met'
    plan.cheapWins = [{ ...PL.newWin(), name: 'Paint later', status: 'keep' }]
    plan.ideas = [PL.moveIdea(PL.newIdea('Window seat', 'kim'), 'kim')]
    plan.decisions = [PL.decideCard(PL.addOption(PL.addOption(PL.newCard('Heat pump?'), 'Yes'), 'No'), null, '')]
    plan.build = { ...PL.newBuild(), stageCost: { 5: { planned: 100000, actual: 112000 } }, photos: { r1: { done: true, date: '2026-11-06', where: 'phone album' } } }
    const versions = PL.saveVersion([], { rooms: [newRoom('office')], answers: {}, lot: null, clusters: [], budget: null }, 'v1', 'kim').versions
    await createProject(db('kim'), 'kim', { scene: '{}', rooms: [], plan, versions })
    const p = startFrom(await findProject(db('kim'), 'kim'))
    expect(p.plan.schedule.gates.D1).toMatchObject({ status: 'passed', by: 'kim' })
    expect(p.plan.checklist[0]).toMatchObject({ text: 'mudroom off the garage', status: 'met' })
    expect(p.plan.cheapWins[0]).toMatchObject({ name: 'Paint later', status: 'keep' })
    expect(p.plan.ideas[0].history.map((h) => h.status)).toEqual(['captured', 'sorted'])
    expect(p.plan.decisions[0].options.map((o) => o.name)).toEqual(['Yes', 'No'])
    expect(PL.stageDiff(p.plan.build, 5).diff).toBe(12000)
    expect(p.plan.build.photos.r1).toMatchObject({ done: true, where: 'phone album' })
    expect(p.versions).toHaveLength(1); expect(p.versions[0].design.rooms[0].type).toBe('office')
  })

  it('W1–W14 fields: steps, pains, pictures, lot items, sprints, cards, sheets, systems, packages, price, walk, Lego switches and room phase survive a reload', async () => {
    await env.clearFirestore()
    const plan = { ...PL.newPlan(), steps: { D4: { lead: 'A', ai: 'Claude', hours: 2, cost: 100 } }, pains: [{ id: 'p1', text: 'boots', often: 'daily', sent: true }],
      pictures: [{ id: 'x', source: 'on this device', tags: ['warm wood'] }], lotItems: [{ id: 'lot-zone', key: 'zone', status: 'done', note: '' }],
      sprints: { D4a: { roomIds: ['r1'], notes: 'paths' } }, itemCards: [{ id: 'ic', item: 'stair', verdict: 'fits', impactRoomIds: ['r1'], proposals: ['move it'], keep: true }],
      sheets: [{ id: 's', criteria: [{ id: 'c', name: 'cost', weight: 2 }], options: [{ id: 'o', name: 'A' }], scores: { 'o|c': 8 }, gateFail: {} }],
      systems: { hvac: 'HRV' }, packages: [{ id: 'w', trade: 'paint', allowance: 5000, supplier: 'owner', diy: true }], builderPrice: { price: 450000, date: '2027-03-01' },
      walk: [{ id: 'k', roomId: 'r1', text: 'scratch', fixed: false }], lego: { off: { hall: true } }, energy: { targetTier: 3, path: 'performance', size: 'over300' }, life: { kWh: 9000, escalationPct: 2, gasRow: 'gasApex', items: [{ id: 'f', name: 'furnace', cost: 8000, life: 20 }] } }
    const room = { ...newRoom('office'), id: 'r1', phase: 'later' }
    await createProject(db('lee'), 'lee', { scene: '{}', rooms: [toSaved(room, {})], plan })
    const p = startFrom(await findProject(db('lee'), 'lee'))
    expect(p.plan.steps.D4).toMatchObject({ lead: 'A', hours: 2 })
    expect(p.plan.sheets[0].scores['o|c']).toBe(8)
    expect(p.plan.lego.off.hall).toBe(true)
    expect(p.plan.walk[0].text).toBe('scratch')
    expect(p.plan.builderPrice.price).toBe(450000)
    expect(p.rooms[0].phase).toBe('later')
    expect(p.plan.energy.targetTier).toBe(3) // Y2
    expect(p.plan.life).toMatchObject({ kWh: 9000, escalationPct: 2, gasRow: 'gasApex' })
  })
})
