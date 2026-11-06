// Anonymous sign-in + Firestore (projects/{projectId}). One anonymous account per browser; its id is this
// device's code, which an owner pastes to share a project (SPEC §9, chat-D33).
import { initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, signInAnonymously } from 'firebase/auth'
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore'
import { firebaseConfig } from './firebase-config.js'
import { createProject, deleteProject, listProjects, openProject, saveProject, setMembers } from './projects.js'

export const name = 'Firestore'
export const canShare = true
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
// Test builds only (VITE_EMULATOR=1, never on Pages): talk to the local Firebase emulators.
if (import.meta.env.VITE_EMULATOR === '1') {
  connectAuthEmulator(getAuth(app), 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
}
let uid = null
let projectId = null

async function signIn() {
  if (!uid) uid = (await signInAnonymously(getAuth(app))).user.uid
  return uid
}

export async function init() { await signIn(); return { uid } }
export const deviceCode = () => uid
export const currentId = () => projectId
export async function list() { await signIn(); return listProjects(db, uid) }
export async function open(id) { await signIn(); const p = await openProject(db, id); if (p) projectId = id; return p }
export async function create(data) { await signIn(); projectId = await createProject(db, uid, data); return projectId }
export async function save(data) {
  await signIn()
  if (projectId) await saveProject(db, uid, projectId, data)
  else projectId = await createProject(db, uid, data)
}
export async function remove(id) { await signIn(); await deleteProject(db, id); if (id === projectId) projectId = null }
export async function share(members, memberNames) { await signIn(); await setMembers(db, projectId, members, memberNames) }
