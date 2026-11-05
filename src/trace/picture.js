// The uploaded plan picture (DN6 A, owner 2026-11-05): kept only in this browser (IndexedDB), never sent
// to Firestore or the repo. A PDF is turned into a picture of its first page here, in the browser.
const DB = 'house-designer', STORE = 'files', KEY = 'plan-picture'

function open() {
  return new Promise((res, rej) => {
    const r = indexedDB.open(DB, 1)
    r.onupgradeneeded = () => r.result.createObjectStore(STORE)
    r.onsuccess = () => res(r.result)
    r.onerror = () => rej(r.error)
  })
}
async function run(mode, fn) {
  const db = await open()
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, mode), req = fn(tx.objectStore(STORE))
    tx.oncomplete = () => res(req?.result)
    tx.onerror = () => rej(tx.error)
  })
}
// Each returns quietly when storage is blocked (private window, cleared site data).
export async function savePicture(blob) { try { await run('readwrite', (s) => s.put(blob, KEY)); return true } catch { return false } }
export async function loadPicture() { try { return (await run('readonly', (s) => s.get(KEY))) || null } catch { return null } }
export async function clearPicture() { try { await run('readwrite', (s) => s.delete(KEY)) } catch { /* nothing kept */ } }

// Picture size in pixels.
export function pictureSize(url) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res({ w: i.naturalWidth, h: i.naturalHeight }); i.onerror = () => rej(new Error('picture')); i.src = url })
}

// A file the user picked → a PNG/JPEG blob. PDFs: first page drawn about 2000 px wide (pdf.js, Apache-2.0,
// loaded only when a PDF is opened).
export async function fileToPicture(file) {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) {
    const pdfjs = await import('pdfjs-dist')
    pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).href
    const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise
    const page = await doc.getPage(1)
    const base = page.getViewport({ scale: 1 })
    const vp = page.getViewport({ scale: Math.min(4, 2000 / base.width) })
    const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height)
    const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height)
    await page.render({ canvasContext: g, canvas: c, viewport: vp }).promise
    return new Promise((res) => c.toBlob((b) => res(b), 'image/png'))
  }
  if (/^image\//.test(file.type)) return file
  throw new Error('not a picture or PDF')
}
