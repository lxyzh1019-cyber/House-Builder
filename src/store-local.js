// Browser-storage store (VITE_STORE=local builds, e.g. a prototype without Firebase). Many projects, kept in
// this browser only; sharing needs the online (Firestore) version.
const KEY = 'house-designer:projects:v2', OLD = 'house-designer:project:v1'
export const name = 'browser storage'
export const canShare = false
let projectId = null

function all() {
  try {
    const s = localStorage.getItem(KEY)
    if (s) return JSON.parse(s)
    const old = localStorage.getItem(OLD) // a project saved before many projects existed
    return old ? { p1: { ...JSON.parse(old), owner: 'local' } } : {}
  } catch { return {} }
}
function put(map) {
  try { localStorage.setItem(KEY, JSON.stringify(map)) } catch (e) { throw new Error('browser storage blocked: ' + e.message) }
}
const newId = () => `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

export async function init() { return { uid: 'local' } }
export const deviceCode = () => null
export const currentId = () => projectId
export async function list() { return Object.entries(all()).map(([id, d]) => ({ id, name: d.setup?.name || '', owner: 'local', role: 'owner' })) }
export async function open(id) { const d = all()[id]; if (!d) return null; projectId = id; return { id, members: [], memberNames: {}, ...d } }
export async function create(data) { const m = all(); projectId = newId(); m[projectId] = { ...data, owner: 'local' }; put(m); return projectId }
export async function save(data) {
  const m = all()
  if (!projectId) projectId = newId()
  m[projectId] = { ...(m[projectId] || {}), ...data, owner: 'local' }
  put(m)
}
export async function remove(id) { const m = all(); delete m[id]; put(m); if (id === projectId) projectId = null }
export async function share() { throw new Error('sharing needs the online version') }
