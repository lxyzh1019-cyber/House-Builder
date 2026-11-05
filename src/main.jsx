import { StrictMode, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { useFrame, useThree } from '@react-three/fiber'
import * as P from '@pascal-app/core'
import { builtinPlugin } from '@pascal-app/nodes'
import { Viewer } from '@pascal-app/viewer'
import { buildRoom, ftToM, resizeRoom, roomSizeFt, sizeLabel, wallLengthsFt } from './room.js'
import { jsonToScene, sceneToJson } from './scene-io.js'

// Prototype build (VITE_STORE=local) saves in browser storage; the spike build saves in Firestore.
const storePromise =
  import.meta.env.VITE_STORE === 'local' ? import('./store-local.js') : import('./store-firestore.js')

// ?fx=0 (or #fx0, which also works inside a claude.ai Artifact) turns off Pascal's post-effects (lighter on weak GPUs and in headless tests).
const postFx = new URLSearchParams(location.search).get('fx') !== '0' && location.hash !== '#fx0'

const pluginReady = P.loadPlugin(builtinPlugin) // once, before the Viewer mounts

// Shared status for the corner readout.
const status = { backend: '…', firstFrameMs: null, store: '…', save: '…' }
const listeners = new Set()
const setStatus = (patch) => { Object.assign(status, patch); listeners.forEach((l) => l()) }
window.__spike = status // for headless checks

// Points the camera at the room centre from a corner, high enough to see all 4 walls.
function AimCamera({ size }) {
  const camera = useThree((s) => s.camera)
  const aimed = useRef('')
  const key = size ? `${size.w}x${size.d}` : ''
  useFrame(() => {
    if (!size || aimed.current === key) return
    const w = ftToM(size.w), d = ftToM(size.d)
    const r = Math.hypot(w, d) * 1.05 + 2
    camera.position.set(r * 0.62, r * 0.78, r * 0.62)
    camera.lookAt(0, 0.6, 0)
    camera.updateProjectionMatrix()
    aimed.current = key
  })
  return null
}

// Reads which GPU path drew the scene and when the first frame happened.
function RenderProbe() {
  const gl = useThree((s) => s.gl)
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    done.current = true
    const b = gl?.backend
    const backend = b?.isWebGPUBackend ? 'WebGPU' : b?.isWebGLBackend ? 'WebGL (fallback)' : gl?.isWebGLRenderer ? 'WebGL' : 'unknown'
    setStatus({ backend, firstFrameMs: Math.round(performance.now() - (window.__t0 ?? 0)) })
  })
  return null
}

function useStatus() {
  const [, force] = useState(0)
  useEffect(() => { const l = () => force((n) => n + 1); listeners.add(l); return () => listeners.delete(l) }, [])
  return status
}

function App() {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(null)
  // DN3: the label reads the room live from the scene, so it follows every change Pascal applies.
  const nodes = P.useScene((s) => s.nodes)
  const size = useMemo(() => roomSizeFt(nodes), [nodes])
  const walls = useMemo(() => wallLengthsFt(nodes), [nodes])
  const st = useStatus()
  const storeRef = useRef(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        await pluginReady
        const store = await storePromise
        storeRef.current = store
        setStatus({ store: store.name })
        const saved = await store.load()
        if (saved) { jsonToScene(saved); setStatus({ save: 'loaded' }) }
        else { buildRoom(); await store.save(sceneToJson()); setStatus({ save: 'new room saved' }) }
        if (alive) setReady(true)
      } catch (e) {
        console.error(e)
        if (alive) setError(String(e?.message || e))
        setStatus({ save: 'error' })
      }
    })()
    return () => { alive = false }
  }, [])

  async function saveNow() {
    setStatus({ save: 'saving…' })
    await storeRef.current.save(sceneToJson())
    setStatus({ save: 'saved' })
  }

  // DN3: any error in the resize or the save shows in the card instead of failing silently.
  async function run(change) {
    setError(null)
    try { change(); await saveNow() }
    catch (e) { console.error(e); setError(String(e?.message || e)); setStatus({ save: 'error' }) }
  }

  const makeTwenty = () => run(() => resizeRoom(20, 20))
  const reset = () => run(() => { P.useScene.getState().setScene({}, []); buildRoom() })

  return (
    <>
      <div style={{ position: 'absolute', inset: 0 }}>
        {ready && (
          <Viewer disablePostFx={!postFx}>
            <AimCamera size={size} />
            <RenderProbe />
          </Viewer>
        )}
      </div>
      <div className="card">
        <div className="eyebrow">Living room</div>
        <div className="size" data-testid="size-label">{sizeLabel(size)}</div>
        <div className="facts">Walls 8 ft 10 in high · 3-seat sofa 7.5 x 3 ft</div>
        <div className="row">
          <button id="make-20" className="btn" disabled={!ready} onClick={makeTwenty}>Make it 20 x 20 ft</button>
          <button id="reset" className="btn quiet" disabled={!ready} onClick={reset}>Reset to 15 x 12.3</button>
        </div>
        {error && <div className="error">Could not save or load: {error}</div>}
      </div>
      <div className="readout" data-testid="readout">
        GPU: {st.backend} · first frame: {st.firstFrameMs == null ? '…' : `${st.firstFrameMs} ms`} · save: {st.store} ({st.save}) · walls {walls.length ? walls.map((w) => w.toFixed(1)).join(' / ') + ' ft' : '…'}{postFx ? '' : ' · fx off'}
      </div>
    </>
  )
}

createRoot(document.getElementById('root')).render(<StrictMode><App /></StrictMode>)
