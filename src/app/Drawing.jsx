// R8: to-scale drawing. Items, walkways (hatched), clearance labels for the selected item,
// overlaps and items outside the room in red. Items drag inside the room with wall snap.
// The room outline and item positions are read from the Pascal scene (readRoom).
import { useMemo, useRef, useState } from 'react'
import { aabb, clearances, isOutside, overlaps, snapMove } from '../furniture/geometry.js'
import { layoutRoom } from '../rooms/engine.js'
import { ftIn, mmToFt } from '../units.js'

export default function Drawing({ room, geo, sizeFt, rules, selectedId, onSelect, onMove }) {
  const svgRef = useRef(null)
  const [drag, setDrag] = useState(null) // { id, ox, oy, cx, cy }
  const W = geo?.W ?? 0, D = geo?.D ?? 0
  const { walkways } = useMemo(() => layoutRoom(room, sizeFt.w, sizeFt.d, rules), [room, sizeFt.w, sizeFt.d, rules])
  const items = room.items.map((it) => {
    const p = drag?.id === it.id ? { cx: drag.cx, cy: drag.cy, rot: geo.items[it.id]?.rot ?? 0 } : geo?.items[it.id] ?? { cx: W / 2, cy: D / 2, rot: 0 }
    return { ...it, ...p }
  })
  const clash = new Set(overlaps(items).flat())
  const outside = new Set(items.filter((f) => isOutside(f, W, D)).map((f) => f.id))
  const sel = items.find((i) => i.id === selectedId)
  const pad = Math.max(W, D) * 0.08 + 300
  const k = Math.max(W, D) / 600 // label scale: about 1 px of a 600 px drawing

  const toSvg = (e) => {
    const pt = svgRef.current.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY
    return pt.matrixTransform(svgRef.current.getScreenCTM().inverse())
  }
  const down = (e, f) => {
    e.stopPropagation(); onSelect(f.id)
    const p = toSvg(e)
    e.currentTarget.setPointerCapture?.(e.pointerId)
    setDrag({ id: f.id, ox: p.x - f.cx, oy: p.y - f.cy, cx: f.cx, cy: f.cy })
  }
  const move = (e) => {
    if (!drag) return
    const p = toSvg(e), f = items.find((i) => i.id === drag.id)
    const [cx, cy] = snapMove(f, p.x - drag.ox, p.y - drag.oy, W, D)
    setDrag({ ...drag, cx, cy })
  }
  const up = () => {
    if (!drag) return
    const f = items.find((i) => i.id === drag.id)
    onMove(drag.id, { cx: drag.cx, cy: drag.cy, rot: f.rot })
    setDrag(null)
  }

  if (!geo) return <div className="drawing-empty">Drawing loads with the 3D scene…</div>
  const fs = 13 * k
  return (
    <svg ref={svgRef} className="drawing" viewBox={`${-pad} ${-pad} ${W + 2 * pad} ${D + 2 * pad}`} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerDown={() => onSelect(null)} role="img" aria-label={`Drawing of ${room.name}, ${ftIn(mmToFt(W))} by ${ftIn(mmToFt(D))}`}>
      <defs>
        <pattern id="hatch" width={150} height={150} patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="150" stroke="var(--walk)" strokeWidth={30} /></pattern>
        <pattern id="redhatch" width={120} height={120} patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="120" stroke="var(--warn)" strokeWidth={30} /></pattern>
      </defs>
      <rect x={0} y={0} width={W} height={D} fill="var(--floor)" />
      {walkways.map((w, i) => w.ring
        ? <path key={i} fillRule="evenodd" fill="url(#hatch)" d={`M${w.x} ${w.y}h${w.w}v${w.d}h${-w.w}z M${w.ring.x} ${w.ring.y}h${w.ring.w}v${w.ring.d}h${-w.ring.w}z`}><title>{w.label}</title></path>
        : <rect key={i} x={w.x} y={w.y} width={Math.max(0, Math.min(w.w, W - w.x))} height={Math.max(0, Math.min(w.d, D - w.y))} fill="url(#hatch)"><title>{w.label}</title></rect>)}
      <rect x={-75} y={-75} width={W + 150} height={D + 150} fill="none" stroke="var(--wall)" strokeWidth={150} />
      {[...items].sort((a, b) => (a.type === 'tv') - (b.type === 'tv')).map((f) => {
        const bad = clash.has(f.id) || outside.has(f.id)
        return (
          <g key={f.id} transform={`translate(${f.cx} ${f.cy}) rotate(${f.rot})`} onPointerDown={(e) => down(e, f)} style={{ cursor: 'grab', touchAction: 'none' }}>
            <rect x={-f.w / 2} y={-f.d / 2} width={f.w} height={f.d} rx={40} fill={bad ? 'url(#redhatch)' : 'var(--item)'} stroke={bad ? 'var(--warn)' : f.id === selectedId ? 'var(--accent)' : 'var(--item-line)'} strokeWidth={f.id === selectedId ? 40 : 20} />
            {Math.min(f.w, f.d) > 300 && <text x={0} y={0} fontSize={Math.min(fs, f.d * 0.4)} textAnchor="middle" dominantBaseline="central" fill="var(--ink)" transform={Math.abs(f.rot % 180) === 90 ? 'rotate(-90)' : undefined} pointerEvents="none">{f.name}</text>}
          </g>
        )
      })}
      {sel && <Clearance f={sel} W={W} D={D} fs={fs} />}
      <text x={W / 2} y={-pad / 2} fontSize={fs * 1.1} textAnchor="middle" fill="var(--muted)">{ftIn(mmToFt(W))}</text>
      <text x={-pad / 2} y={D / 2} fontSize={fs * 1.1} textAnchor="middle" fill="var(--muted)" transform={`rotate(-90 ${-pad / 2} ${D / 2})`}>{ftIn(mmToFt(D))}</text>
    </svg>
  )
}

// Furnish2-style clearance labels: clear distance from the selected item to each wall.
function Clearance({ f, W, D, fs }) {
  const { hw, hh } = aabb(f), c = clearances(f, W, D)
  const L = f.cx - hw, R = f.cx + hw, T = f.cy - hh, B = f.cy + hh
  const seg = (x1, y1, x2, y2, v, tx, ty) => v > 20 && (
    <g key={`${x1}-${y1}-${x2}-${y2}`} pointerEvents="none">
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--teal)" strokeWidth={15} />
      <text x={tx} y={ty} fontSize={fs} textAnchor="middle" dominantBaseline="central" fill="var(--teal)" stroke="var(--floor)" strokeWidth={fs / 4} paintOrder="stroke" fontWeight="600">{ftIn(mmToFt(v))}</text>
    </g>
  )
  return <>{[
    seg(0, f.cy, L, f.cy, c.l, L / 2, f.cy - fs),
    seg(R, f.cy, W, f.cy, c.r, (R + W) / 2, f.cy - fs),
    seg(f.cx, 0, f.cx, T, c.t, f.cx + fs * 2.2, T / 2),
    seg(f.cx, B, f.cx, D, c.b, f.cx + fs * 2.2, (B + D) / 2),
  ]}</>
}
