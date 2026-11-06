// Lot board (SPEC §7): drag rooms onto the lot with 2 ft snap, turn them, see overlaps and setback
// crossings in red, set each side to a door, an open side or a wall, and glue the daily core route into
// one cluster. Room outlines are read from the Pascal scene (readLot); a drag shows a preview first.
import { useRef, useState } from 'react'
import { LEVELS } from '../rooms/types.js'
import { coverage, lotFt, lotSideOf, localSideOf, lotState, moveRoom, newSite, placeRoom, rotateRoom } from '../lot/lot.js'
import { portsOf, newId } from '../rooms/types.js'
import { ftToM, sizeFt } from '../units.js'
import { t, tlist, tn, tx } from '../i18n.js'

const PORTS = ['door', 'open', 'wall']

export default function LotBoard({ rooms, lot, clusters, rules, st, fps, onRooms, onLot, onClusters, onOpenRoom }) {
  const svgRef = useRef(null)
  const [sel, setSel] = useState(null)
  const [drag, setDrag] = useState(null) // { id, px, py, bx, by, rooms }
  const [glue, setGlue] = useState([])
  // One level at a time (SPEC §7, chat-D38); the lot outline and setbacks show on every level.
  const [level, setLevel] = useState('main')
  const onLevel = (r) => (r.level || 'main') === level
  const L = lotFt(lot)
  const preview = drag?.rooms ? lotState(drag.rooms, lot, rules) : null
  const view = preview || st
  const fpOf = (id) => (preview ? preview[id]?.fp : fps[id] || st[id]?.fp)
  const placed = rooms.filter((r) => fpOf(r.id) && onLevel(r))
  const tray = rooms.filter((r) => !r.place && onLevel(r))
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
        <h2>{t('lot.title')}</h2>
        <div className="chips" data-testid="lot-level" role="group" aria-label={t('ed.level')}>{LEVELS.map((lv) => <button key={lv} className={`chip ${level === lv ? 'on' : ''}`} aria-pressed={level === lv} onClick={() => { setLevel(lv); setSel(null) }}>{t(`level.${lv}`)} ({rooms.filter((r) => (r.level || 'main') === lv).length})</button>)}</div>
        <div className="lot-inputs">
          {[['w', L.w], ['d', L.d], ['front', L.front], ['rear', L.rear], ['left', L.left], ['right', L.right]].map(([k, v]) => (
            <label key={k}>{t(`lot.${k}`)}<input id={`lot-${k}`} type="number" step="1" min="0" defaultValue={+v.toFixed(2)} onBlur={(e) => setLotFt(k, e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setLotFt(k, e.target.value)} /></label>
          ))}
        </div>
        <p className="muted small">{t('lot.setbackHelp')}</p>
        <Site lot={lot} st={st} onLot={onLot} />

        {tray.length > 0 && <>
          <h3>{t('lot.tray')}</h3>
          <ul className="tray">{tray.map((r) => <li key={r.id}><span>{tx(r.name)} · {sizeFt(st[r.id].size.w, st[r.id].size.d)}</span><button className="btn tiny" onClick={() => { onRooms(placeRoom(rooms, lot, r.id, rules)); setSel(r.id) }}>{t('lot.place')}</button></li>)}</ul>
        </>}

        {selRoom && selRoom.place && (
          <div className="item-edit lot-room">
            <div className="q-label">{tx(selRoom.name)} · {sizeFt(view[selRoom.id].size.w, view[selRoom.id].size.d)}</div>
            <Status r={selRoom} s={view[selRoom.id]} rooms={rooms} />
            <div className="chips">
              <button className="btn quiet" onClick={() => onRooms(rotateRoom(rooms, selRoom.id, rules))}>{t('lot.turn')}</button>
              <button className="btn quiet" onClick={() => { onRooms(rooms.map((x) => (x.id === selRoom.id ? { ...x, place: undefined } : x))); setSel(null) }}>{t('lot.takeOff')}</button>
              <button className="btn quiet" onClick={() => onOpenRoom(selRoom.id)}>{t('lot.openRoom')}</button>
            </div>
            {['n', 'e', 's', 'w'].map((ls) => {
              const v = portsOf(selRoom)[localSideOf(ls, selRoom.place.rot || 0)]
              return <div key={ls} className="port-row"><span>{t(`lot.side.${ls}`)}</span><div className="chips">{PORTS.map((k) => <button key={k} className={`chip ${v === k ? 'on' : ''}`} onClick={() => setPort(ls, k)}>{t(`port.${k}`)}</button>)}</div></div>
            })}
          </div>
        )}

        <h3>{t('lot.clusters')}</h3>
        {clusters.length === 0 && <p className="muted small">{t('lot.noClusters')}</p>}
        <ul className="tray">{clusters.map((c) => <li key={c.id}><span>{tx(c.name)}: {c.roomIds.map((id) => rooms.find((r) => r.id === id)?.name).filter(Boolean).map(tx).join(' → ')}</span><button className="btn tiny" onClick={() => onClusters(clusters.filter((x) => x.id !== c.id))}>{t('lot.unglue')}</button></li>)}</ul>
        <div className="glue">
          {placed.map((r) => <label key={r.id} className="check"><input type="checkbox" checked={glue.includes(r.id)} onChange={(e) => setGlue(e.target.checked ? [...glue, r.id] : glue.filter((x) => x !== r.id))} />{tx(r.name)}{clusterOf(r.id) ? t('lot.glued') : ''}</label>)}
          <button className="btn" disabled={glue.length < 2} onClick={glueNow}>{t('lot.glue')}</button>
        </div>
      </section>

      <section className="panel lot-board">
        <svg ref={svgRef} className="lot-svg" viewBox={`${-pad} ${-pad} ${L.w + 2 * pad} ${L.d + 2 * pad}`} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerDown={() => setSel(null)} role="img" aria-label={t('lot.aria', { w: L.w, d: L.d })}>
          <defs><pattern id="lotbad" width={1.5} height={1.5} patternUnits="userSpaceOnUse" patternTransform="rotate(-45)"><line x1="0" y1="0" x2="0" y2="1.5" stroke="var(--warn)" strokeWidth={0.4} /></pattern></defs>
          <rect x={0} y={0} width={L.w} height={L.d} fill="var(--floor)" stroke="var(--muted)" strokeWidth={0.3} />
          {Array.from({ length: Math.floor(L.w / 10) }, (_, i) => <line key={`gx${i}`} x1={(i + 1) * 10} y1={0} x2={(i + 1) * 10} y2={L.d} stroke="var(--line)" strokeWidth={0.1} />)}
          {Array.from({ length: Math.floor(L.d / 10) }, (_, i) => <line key={`gy${i}`} x1={0} y1={(i + 1) * 10} x2={L.w} y2={(i + 1) * 10} stroke="var(--line)" strokeWidth={0.1} />)}
          {bw > 0 && bd > 0 && <rect x={bx0} y={by0} width={bw} height={bd} fill="none" stroke="var(--teal)" strokeWidth={0.25} strokeDasharray="1 0.8" />}
          <text x={L.w / 2} y={-2.5} fontSize={2.4} textAnchor="middle" fill="var(--muted)">{t('lot.street', { w: L.w })}</text>
          <text x={-2.5} y={L.d / 2} fontSize={2.4} textAnchor="middle" fill="var(--muted)" transform={`rotate(-90 -2.5 ${L.d / 2})`}>{L.d} ft</text>
          {placed.map((r) => {
            const f = fpOf(r.id), s = view[r.id]
            const bad = s.overlap?.length || s.outside?.length
            return (
              <g key={r.id} onPointerDown={(e) => down(e, r.id)} style={{ cursor: 'grab', touchAction: 'none' }}>
                <rect x={f.x} y={f.y} width={f.w} height={f.d} fill={bad ? 'url(#lotbad)' : 'var(--item)'} stroke={r.id === sel ? 'var(--accent)' : clusterOf(r.id) ? 'var(--teal)' : 'var(--item-line)'} strokeWidth={r.id === sel ? 0.5 : 0.2} />
                <Ports f={f} ports={portsOf(r)} />
                <text x={f.x + f.w / 2} y={f.y + f.d / 2 - 0.8} fontSize={Math.min(2.2, f.w / 6)} textAnchor="middle" fill="var(--ink)" pointerEvents="none">{tx(r.name)}</text>
                <text x={f.x + f.w / 2} y={f.y + f.d / 2 + 1.8} fontSize={Math.min(1.8, f.w / 7)} textAnchor="middle" fill="var(--muted)" pointerEvents="none">{sizeFt(s.size.w, s.size.d)}</text>
              </g>
            )
          })}
        </svg>
        <div className="legend">{tn('lot.legend', { door: <span className="sw door" />, open: <span className="sw open" />, wall: <span className="sw wallk" />, bad: <span className="sw bad" /> })}</div>
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
  if (s.shared) lines.push(<span key="sh" className="tag pass">{t('lot.shared', { names: tlist(s.sharedWith.map((w) => name(w.id))) })}</span>)
  for (const id of s.overlap || []) lines.push(<span key={`o${id}`} className="tag warn">{t('lot.overlaps', { name: name(id) })}</span>)
  for (const o of s.outside || []) lines.push(<span key={o} className="tag warn">{t('lot.crosses', { what: o })}</span>)
  if (s.check) lines.push(<span key="c" className={`tag ${s.check.status === 'fits' ? 'pass' : 'warn'}`}>{s.check.status === 'fits' ? t('lot.fitsContents') : t('lot.tooSmallContents')}</span>)
  lines.push(<span key="m" className="tag">{t('card.minSize', { size: sizeFt(s.min.w, s.min.d) })}</span>)
  return <div className="chips">{lines}</div>
}

// P6 site review: the zone's limits, typed from the land title or the City zoning map.
function Site({ lot, st, onLot }) {
  const site = { ...newSite(), ...(lot.site || {}) }
  const c = coverage(lot, st)
  const set = (k, v) => onLot({ ...lot, site: { ...site, [k]: k === 'zone' ? v : v === '' ? null : Number(v) } })
  return (
    <div className="item-edit site">
      <div className="q-label">{t('site.title')}</div>
      <p className="muted small">{t('site.help')}</p>
      <div className="lot-inputs">
        <label>{t('site.zone')}<input id="site-zone" type="text" defaultValue={site.zone} onBlur={(e) => set('zone', e.target.value.trim())} /></label>
        <label>{t('site.height')}<input id="site-height" type="number" step="0.5" min="0" defaultValue={site.maxHeightFt ?? ''} onBlur={(e) => set('maxHeightFt', e.target.value)} /></label>
        <label>{t('site.coverage')}<input id="site-coverage" type="number" step="1" min="0" max="100" defaultValue={site.maxCoveragePct ?? ''} onBlur={(e) => set('maxCoveragePct', e.target.value)} onKeyDown={(e) => e.key === 'Enter' && set('maxCoveragePct', e.target.value)} /></label>
      </div>
      <div className={`tag ${c.over ? 'warn' : Number.isFinite(site.maxCoveragePct) ? 'pass' : ''}`} data-testid="site-coverage">
        {t(c.over ? 'site.over' : 'site.used', { pct: c.pct.toFixed(1), area: Math.round(c.area).toLocaleString('en-CA'), lot: Math.round(c.lotArea).toLocaleString('en-CA'), max: site.maxCoveragePct ?? '–' })}
      </div>
      {Number.isFinite(site.maxHeightFt) && <p className="muted small">{t('site.heightNote', { ft: site.maxHeightFt })}</p>}
    </div>
  )
}
