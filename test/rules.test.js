// Runs in the Firestore emulator: npm run test:rules
import { sampleFit } from './helpers/sample-fit.js'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { createProject, findProject, saveProject } from '../src/projects.js'
import { newRoom } from '../src/rooms/types.js'
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
    const living = { ...newRoom('living', 'Family TV room'), place: { x: ftToM(10), y: ftToM(20), rot: 90 }, ports: { n: 'wall', e: 'wall', s: 'open', w: 'door' } }
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
    const room = { ...newRoom('living', 'Family TV room'), size: { w: ftToM(20), d: ftToM(20) } }
    expect(checkSize(room, 20, 20)).toMatchObject({ status: 'fits' })
    const id = await createProject(d, 'erin', { scene: '{}', rooms: [room] })
    // "Reload": a fresh read from Firestore, nothing kept in memory.
    const loaded = (await findProject(db('erin'), 'erin')).rooms[0]
    expect(loaded.id).toBe(room.id)
    expect(sizeFt(mToFt(loaded.size.w), mToFt(loaded.size.d))).toBe('20.0 x 20.0 ft')
    const c = checkSize(loaded, mToFt(loaded.size.w), mToFt(loaded.size.d))
    expect(c.status).toBe('fits')
    expect(c.spare).toBeCloseTo(197.5, 6)
    expect(id).toBeTruthy()
  })
})
