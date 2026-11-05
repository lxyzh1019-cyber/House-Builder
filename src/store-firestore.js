// Anonymous sign-in + Firestore (projects/{projectId}).
import { initializeApp } from 'firebase/app'
import { getAuth, signInAnonymously } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { firebaseConfig } from './firebase-config.js'
import { createProject, findProject, saveProject } from './projects.js'

export const name = 'Firestore'
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
let uid = null
let projectId = null

async function signIn() {
  if (!uid) uid = (await signInAnonymously(getAuth(app))).user.uid
  return uid
}

// Returns { scene, rooms, rules } or null when this user has no project yet.
export async function load() {
  await signIn()
  const p = await findProject(db, uid)
  if (!p) return null
  projectId = p.id
  return p
}

export async function save(data) {
  await signIn()
  if (projectId) await saveProject(db, uid, projectId, data)
  else projectId = await createProject(db, uid, data)
}
