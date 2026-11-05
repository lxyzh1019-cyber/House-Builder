// 3D view of the Pascal scene (loaded only when opened, so the rooms screens start faster).
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Viewer } from '@pascal-app/viewer'

function AimCamera({ target }) {
  const camera = useThree((s) => s.camera)
  const aimed = useRef('')
  useFrame(() => {
    if (!target) return
    const key = target.join(',')
    if (aimed.current === key) return
    const [cx, cz, span] = target
    const r = span * 1.05 + 2
    camera.position.set(cx + r * 0.62, r * 0.78, cz + r * 0.62)
    camera.lookAt(cx, 0.6, cz)
    camera.updateProjectionMatrix()
    aimed.current = key
  })
  return null
}

function GpuProbe({ onBackend }) {
  const gl = useThree((s) => s.gl)
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    done.current = true
    const b = gl?.backend
    onBackend(b?.isWebGPUBackend ? 'webgpu' : b?.isWebGLBackend ? 'webgl' : 'unknown') // shown through i18n gpu.*
  })
  return null
}

export default function View3D({ target, postFx, onBackend }) {
  return (
    <div className="view3d">
      <Viewer disablePostFx={!postFx}>
        <AimCamera target={target} />
        <GpuProbe onBackend={onBackend} />
      </Viewer>
    </div>
  )
}
