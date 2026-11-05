// Lot board (SPEC §7): drag rooms onto the lot with 2 ft snap, turn them, see overlaps and setback
// crossings in red, set each side to a door, an open side or a wall, and glue the daily core route into
// one cluster. Room outlines are read from the Pascal scene (readLot); a drag shows a preview first.
import { useRef, useState } from 'react'
import { lotFt, lotSideOf, localSideOf, lotState, moveRoom, placeRoom, rotateRoom } from '../lot/lot.js'
import { portsOf, newId } from '../rooms/types.js'
import { ftToM, sizeFt } from '../units.js'

const SIDE_LABEL = { n: 'Street side', s: 'Rear side', w: 'Left side', e: 'Right side' }
const PORTS = [['door', 'Door'], ['open', 'Open'], ['wall', 'Wall']]

export default function LotBoard({ rooms, lot, clusters, rules, st, fps, onRooms, onLot, onClusters, onOpenRoom }) {
  const svgRef = useRef(null)
  const [sel, setSel] = useState(null)
  const [drag, setDrag] = useState(null) // { id, px, py, bx, by, rooms }
  const [glue, setGlue] = useState([])
  const L = lotFt(lot)
  const preview = drag?.rooms ? lotState(drag.rooms, lot, rules) : null
  const view = preview || st
  const fpOf = (id) => (preview ? preview[id]?.fp : fps[id] || st[id]?.fp)
  const placed = rooms.filter((r) => fpOf(r.id))
  const tray = rooms.filter((r) => !r.place)
  const selRoom = rooms.find((r) => r.id === sel)
  const clusterOf = (id) => clusters.find((c) => c.roomIds.includes(id))

  const pt = (e) => { const p = svgRef.current.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svgRef.current.getScreenCTM().inverse()) }
  const down = (e, id) => {
    e.stopPropagation(); setSel(id)
    e.currentTarget.setPointerCapture?.(e.pointerId)
    const p = pt(e), b = st[id].base
    setDrag({ id, px: p.x, py: p.y, bx: b.x, by: b.y, rooms: null })
  }
  const move = (e) => {
    if (!drag) return
    const p = pt(e)
    setDrag({ ...drag, rooms: moveRoom(rooms, clusters, drag.id, drag.bx + p.x - drag.px, drag.by + p.y - drag.py, rules) })
  }
  const up = () => { if (drag?.rooms) onRooms(drag.rooms); setDrag(null) }
  const setLotFt = (k, v) => {
    const n = Number(v)
    if (!(n >= 0)) return
    if (k === 'w' || k === 'd') { if (n > 0) onLot({ ...lot, [k]: ftToM(n) }) }
    else onLot({ ...lot, setbacks: { ...lot.setbacks, [k]: ftToM(n) } })
  }
  const setPort = (lotSide, v) => {
    const r = selRoom, local = localSideOf(lotSide, r.place?.rot || 0)
    onRooms(rooms.map((x) => (x.id === r.id ? { ...x, ports: { ...portsOf(x), [local]: v } } : x)))
  }
  const glueNow = () => {
    if (glue.length < 2) return
    const rest = clusters.map((c) => ({ ...c, roomIds: c.roomIds.filter((id) => !glue.includes(id)) })).filter((c) => c.roomIds.length > 1)
    onClusters([...rest, { id: newId(), name: 'Core route', roomIds: glue }]); setGlue([])
  }

  const pad = 8
  const bx0 = L.left, by0 = L.front, bw = L.w - L.left - L.right, bd = L.d - L.front - L.rear
  return (
    <main className="lot">
      <section className="panel lot-side">
        <h2>Lot board</h2>
        <div className="lot-inputs">
          {[['w', 'Lot width', L.w], ['d', 'Lot depth', L.d], ['front', 'Front setback', L.front], ['rear', 'Rear setback', L.rear], ['left', 'Left setback', L.left], ['right', 'Right setback', L.right]].map(([k, label, v]) => (
            <label key={k}>{label} (ft)<input id={`lot-${k}`} type="number" step="1" min="0" defaultValue={+v.toFixed(2)} onBlur={(e) => setLotFt(k, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setLotFt(k, e.target.value)} /></label>
          ))}
        </div>
        <p className="muted small">Type the setbacks from your zone's rules. Rooms crossing them turn red.</p>

        {tray.length > 0 && <>
          <h3>Not on the lot yet</h3>
          <ul className="tray">{tray.map((r) => <li key={r.id}><span>{r.name} · {sizeFt(st[r.id].size.w, st[r.id].size.d)}</span><button className="btn tiny" onClick={() => { onRooms(placeRoom(rooms, lot, r.id, rules)); setSel(r.id) }}>Place on lot</button></li>)}</ul>
        </>}

        {selRoom && selRoom.place && (
          <div className="item-edit lot-room">
            <div className="q-label">{selRoom.name} · {sizeFt(view[selRoom.id].size.w, view[selRoom.id].size.d)}</div>
            <Status r={selRoom} s={view[selRoom.id]} rooms={rooms} />
            <div className="chips">
              <button className="btn quiet" onClick={() => onRooms(rotateRoom(rooms, selRoom.id, rules))}>Turn 90°</button>
              <button className="btn quiet" onClick={() => { onRooms(rooms.map((x) => (x.id === selRoom.id ? { ...x, place: undefined } : x))); setSel(null) }}>Take off the lot</button>
              <button className="btn quiet" onClick={() => onOpenRoom(selRoom.id)}>Open in Rooms</button>
            </div>
            {['n', 'e', 's', 'w'].map((ls) => {
              const v = portsOf(selRoom)[localSideOf(ls, selRoom.place.rot || 0)]
              return <div key={ls} className="port-row"><span>{SIDE_LABEL[ls]}</span><div className="chips">{PORTS.map(([k, label]) => <button key={k} className={`chip ${v === k ? 'on' : ''}`} onClick={() => setPort(ls, k)}>{label}</button>)}</div></div>
            })}
          </div>
        )}

        <h3>Glued clusters</h3>
        {clusters.length === 0 && <p className="muted small">None yet. Tick rooms below and glue them, for example garage, mudroom, back kitchen, kitchen and dining (the daily core route).</p>}
        <ul className="tray">{clusters.map((c) => <li key={c.id}><span>{c.name}: {c.roomIds.map((id) => rooms.find((r) => r.id === id)?.name).filter(Boolean).join(' → ')}</span><button className="btn tiny" onClick={() => onClusters(clusters.filter((x) => x.id !== c.id))}>Unglue</button></li>)}</ul>
        <div className="glue">
          {placed.map((r) => <label key={r.id} className="check"><input type="checkbox" checked={glue.includes(r.id)} onChange={(e) => setGlue(e.target.checked ? [...glue, r.id] : glue.filter((x) => x !== r.id))} />{r.name}{clusterOf(r.id) ? ' (glued)' : ''}</label>)}
          <button className="btn" disabled={glue.length < 2} onClick={glueNow}>Glue as core route</button>
        </div>
      </section>

      <section className="panel lot-board">
        <svg ref={svgRef} className="lot-svg" viewBox={`${-pad} ${-pad} ${L.w + 2 * pad} ${L.d + 2 * pad}`} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerDown={() => setSel(null)} role="img" aria-label={`Lot ${L.w} by ${L.d} ft`}>
          <defs><pattern id="lotbad" width={1.5} height={1.5} patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="1.5" stroke="var(--warn)" strokeWidth={0.4} /></pattern></defs>
          <rect x={0} y={0} width={L.w} height={L.d} fill="var(--floor)" stroke="var(--muted)" strokeWidth={0.3} />
          {Array.from({ length: Math.floor(L.w / 10) }, (_, i) => <line key={`gx${i}`} x1={(i + 1) * 10} y1={0} x2={(i + 1) * 10} y2={L.d} stroke="var(--line)" strokeWidth={0.1} />)}
          {Array.from({ length: Math.floor(L.d / 10) }, (_, i) => <line key={`gy${i}`} x1={0} y1={(i + 1) * 10} x2={L.w} y2={(i + 1) * 10} stroke="var(--line)" strokeWidth={0.1} />)}
          {bw > 0 && bd > 0 && <rect x={bx0} y={by0} width={bw} height={bd} fill="none" stroke="var(--teal)" strokeWidth={0.25} strokeDasharray="1 0.8" />}
          <text x={L.w / 2} y={-2.5} fontSize={2.4} textAnchor="middle" fill="var(--muted)">Street (front) · {L.w} ft</text>
          <text x={-2.5} y={L.d / 2} fontSize={2.4} textAnchor="middle" fill="var(--muted)" transform={`rotate(-90 -2.5 ${L.d / 2})`}>{L.d} ft</text>
          {placed.map((r) => {
            const f = fpOf(r.id), s = view[r.id]
            const bad = s.overlap?.length || s.outside?.length
            return (
              <g key={r.id} onPointerDown={(e) => down(e, r.id)} style={{ cursor: 'grab', touchAction: 'none' }}>
                <rect x={f.x} y={f.y} width={f.w} height={f.d} fill={bad ? 'url(#lotbad)' : 'var(--item)'} stroke={r.id === sel ? 'var(--accent)' : clusterOf(r.id) ? 'var(--teal)' : 'var(--item-line)'} strokeWidth={r.id === sel ? 0.5 : 0.2} />
                <Ports f={f} ports={portsOf(r)} />
                <text x={f.x + f.w / 2} y={f.y + f.d / 2 - 0.8} fontSize={Math.min(2.2, f.w / 6)} textAnchor="middle" fill="var(--ink)" pointerEvents="none">{r.name}</text>
                <text x={f.x + f.w / 2} y={f.y + f.d / 2 + 1.8} fontSize={Math.min(1.8, f.w / 7)} textAnchor="middle" fill="var(--muted)" pointerEvents="none">{sizeFt(s.size.w, s.size.d)}</text>
              </g>
            )
          })}
        </svg>
        <div className="legend"><span className="sw door" /> door <span className="sw open" /> open side <span className="sw wallk" /> wall <span className="sw bad" /> overlap or over a setback · dashed teal: buildable area · drag rooms (2 ft snap; edges snap to neighbours)</div>
      </section>
    </main>
  )
}

function Ports({ f, ports }) {
  const rot = f.rot || 0
  const seg = (ls) => {
    const side = lotSideOf(ls, rot), v = ports[ls]
    const [x1, y1, x2, y2] = side === 'n' ? [f.x, f.y, f.x + f.w, f.y] : side === 's' ? [f.x, f.y + f.d, f.x + f.w, f.y + f.d] : side === 'w' ? [f.x, f.y, f.x, f.y + f.d] : [f.x + f.w, f.y, f.x + f.w, f.y + f.d]
    if (v === 'open') return <line key={ls} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--accent)" strokeWidth={0.35} strokeDasharray="0.8 0.6" />
    if (v === 'door') {
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, len = Math.hypot(x2 - x1, y2 - y1), g = Math.min(1.5, len / 4)
      const ux = (x2 - x1) / len, uy = (y2 - y1) / len
      return <g key={ls}><line x1={x1} y1={y1} x2={mx - ux * g} y2={my - uy * g} stroke="var(--wall)" strokeWidth={0.45} /><line x1={mx + ux * g} y1={my + uy * g} x2={x2} y2={y2} stroke="var(--wall)" strokeWidth={0.45} /></g>
    }
    return <line key={ls} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--wall)" strokeWidth={0.45} />
  }
  return <g pointerEvents="none">{['n', 'e', 's', 'w'].map(seg)}</g>
}

function Status({ r, s, rooms }) {
  const name = (id) => rooms.find((x) => x.id === id)?.name
  const lines = []
  if (s.shared) lines.push(<span key="sh" className="tag pass">Walkway shared with {s.sharedWith.map((w) => name(w.id)).join(', ')}</span>)
  for (const id of s.overlap || []) lines.push(<span key={`o${id}`} className="tag warn">Overlaps {name(id)}</span>)
  for (const o of s.outside || []) lines.push(<span key={o} className="tag warn">Crosses the {o}</span>)
  if (s.check) lines.push(<span key="c" className={`tag ${s.check.status === 'fits' ? 'pass' : 'warn'}`}>{s.check.status === 'fits' ? 'Fits its contents' : 'Too small for its contents'}</span>)
  lines.push(<span key="m" className="tag">min {sizeFt(s.min.w, s.min.d)}</span>)
  return <div className="chips">{lines}</div>
}
