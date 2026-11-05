// Runs in the Firestore emulator: npm run test:rules
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
  it('owner cannot hand the project to another uid (DN1)', async () => {
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
