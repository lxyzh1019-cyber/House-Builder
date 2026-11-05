// Pascal's scene store batches redraws with requestAnimationFrame (a browser timer).
// Node has none, so give the tests a plain timer stand-in.
if (typeof globalThis.requestAnimationFrame !== 'function') {
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0)
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id)
}
