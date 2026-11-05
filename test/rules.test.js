// Runs in the Firestore emulator: npm run test:rules
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { createProject, findProject, saveProject } from '../src/projects.js'

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
  it('create -> save -> find returns the saved scene', async () => {
    await env.clearFirestore()
    const d = db('carol')
    expect(await findProject(d, 'carol')).toBeNull()
    const id = await createProject(d, 'carol', '{"v":1,"size":"15x12.3"}')
    await saveProject(d, 'carol', id, '{"v":1,"size":"20x20"}')
    const p = await findProject(d, 'carol')
    expect(p).toEqual({ id, scene: '{"v":1,"size":"20x20"}' })
    expect(await findProject(db('dave'), 'dave')).toBeNull()
  })
})
