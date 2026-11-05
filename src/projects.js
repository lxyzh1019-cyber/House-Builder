// Firestore access for projects/{projectId} = { owner: uid, scene: "<Pascal scene JSON>", rooms: [...], rules: {...} }.
// Takes a Firestore instance so the same code runs in the app and in the emulator test.
// The scene stays a JSON string: Firestore cannot store nested arrays (room outlines are [x, z] pairs).
import { addDoc, collection, doc, getDocs, limit, query, setDoc, where } from 'firebase/firestore'

const clean = (data) => JSON.parse(JSON.stringify(data)) // drops undefined values Firestore refuses

// Owner-only read rule: query by owner (a get on a missing doc would be denied).
export async function findProject(db, uid) {
  const snap = await getDocs(query(collection(db, 'projects'), where('owner', '==', uid), limit(1)))
  if (snap.empty) return null
  const d = snap.docs[0]
  const { scene = null, rooms = [], rules = {}, lot = null, clusters = [], trace = null } = d.data()
  return { id: d.id, scene, rooms, rules, lot, clusters, trace }
}

export async function createProject(db, uid, data) {
  const ref = await addDoc(collection(db, 'projects'), clean({ ...data, owner: uid }))
  return ref.id
}

export async function saveProject(db, uid, projectId, data) {
  await setDoc(doc(db, 'projects', projectId), clean({ ...data, owner: uid }))
}
