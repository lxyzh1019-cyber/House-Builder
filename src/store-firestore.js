// Spike store: anonymous sign-in + Firestore.
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

export async function load() {
  await signIn()
  const p = await findProject(db, uid)
  if (!p) return null
  projectId = p.id
  return p.scene
}

export async function save(json) {
  await signIn()
  if (projectId) await saveProject(db, uid, projectId, json)
  else projectId = await createProject(db, uid, json)
}
