// Browser-storage store (VITE_STORE=local builds, e.g. a prototype without Firebase).
const KEY = 'house-designer:project:v1'
export const name = 'browser storage'
export async function load() {
  try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null } catch { return null }
}
export async function save(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)) } catch (e) { throw new Error('browser storage blocked: ' + e.message) }
}
