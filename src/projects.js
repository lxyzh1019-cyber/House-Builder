// Firestore access for projects/{projectId} = { owner: uid, scene: "<json>" }.
// Takes a Firestore instance so the same code runs in the app and in the emulator test.
import { addDoc, collection, doc, getDocs, limit, query, setDoc, where } from 'firebase/firestore'

// Owner-only read rule: query by owner (a get on a missing doc would be denied).
export async function findProject(db, uid) {
  const snap = await getDocs(query(collection(db, 'projects'), where('owner', '==', uid), limit(1)))
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, scene: d.data().scene }
}

export async function createProject(db, uid, sceneJson) {
  const ref = await addDoc(collection(db, 'projects'), { owner: uid, scene: sceneJson })
  return ref.id
}

export async function saveProject(db, uid, projectId, sceneJson) {
  await setDoc(doc(db, 'projects', projectId), { owner: uid, scene: sceneJson })
}
