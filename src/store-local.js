// Prototype store: browser storage only (no Firebase). Used when built with VITE_STORE=local.
const KEY = 'house-designer:spike:scene'
export const name = 'browser storage'
export async function load() {
  try { return localStorage.getItem(KEY) } catch { return null }
}
export async function save(json) {
  try { localStorage.setItem(KEY, json) } catch (e) { throw new Error('browser storage blocked: ' + e.message) }
}
