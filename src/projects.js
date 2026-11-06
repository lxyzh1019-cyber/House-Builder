// Firestore access for projects/{projectId} = { owner, members, memberNames, setup, scene: "<Pascal scene
// JSON>", rooms, answers (chat-D40), rules, lot, clusters, trace, budget }. Takes a Firestore instance so the same code runs in
// the app and in the emulator test. The scene stays a JSON string: Firestore cannot store nested arrays.
// Many projects per person (SPEC §12); shared projects by device code (SPEC §9, chat-D33).
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, limit, query, updateDoc, where } from 'firebase/firestore'

const clean = (data) => JSON.parse(JSON.stringify(data)) // drops undefined values Firestore refuses
const FIELDS = ['scene', 'rooms', 'answers', 'rules', 'lot', 'clusters', 'trace', 'budget', 'setup']
const shape = (id, d) => {
  const { scene = null, rooms = [], answers = {}, rules = {}, lot = null, clusters = [], trace = null, budget = null, setup = null, owner, members = [], memberNames = {} } = d
  return { id, scene, rooms, answers, rules, lot, clusters, trace, budget, setup, owner, members, memberNames }
}
const summary = (d, role) => ({ id: d.id, name: d.data().setup?.name || '', owner: d.data().owner, role })

// The owner's first project (kept for the earlier tests and single-project callers).
export async function findProject(db, uid) {
  const snap = await getDocs(query(collection(db, 'projects'), where('owner', '==', uid), limit(1)))
  return snap.empty ? null : shape(snap.docs[0].id, snap.docs[0].data())
}

// My projects and the ones shared with me. Each query matches one read rule (owner, member), so neither is
// refused; the "shared" one is skipped quietly if the published rules are still the owner-only ones.
export async function listProjects(db, uid) {
  const mine = await getDocs(query(collection(db, 'projects'), where('owner', '==', uid)))
  let shared = []
  try {
    shared = (await getDocs(query(collection(db, 'projects'), where('members', 'array-contains', uid)))).docs.map((d) => summary(d, 'member'))
  } catch (e) { if (e?.code !== 'permission-denied') throw e }
  return [...mine.docs.map((d) => summary(d, 'owner')), ...shared]
}

export async function openProject(db, projectId) {
  const d = await getDoc(doc(db, 'projects', projectId))
  return d.exists() ? shape(d.id, d.data()) : null
}

export async function createProject(db, uid, data) {
  const ref = await addDoc(collection(db, 'projects'), clean({ members: [], memberNames: {}, ...data, owner: uid }))
  return ref.id
}

// Saves the design fields only, each one whole; owner and members stay as stored (a member may save too).
export async function saveProject(db, uid, projectId, data) {
  const patch = {}
  for (const k of FIELDS) if (k in data) patch[k] = data[k] ?? null
  await updateDoc(doc(db, 'projects', projectId), clean(patch))
}

// Owner only (rules): who may open and edit the project, by device code, with a label for each.
export async function setMembers(db, projectId, members, memberNames) {
  await updateDoc(doc(db, 'projects', projectId), clean({ members, memberNames }))
}

export async function deleteProject(db, projectId) {
  await deleteDoc(doc(db, 'projects', projectId))
}
