// Plan intake (SPEC §11): put a plan picture under the model and trace it once — walls, doors, windows,
// rooms, levels (P1); check 3 sizes against the drawing (P2); see the trace over the picture (P3); the
// sample plan works before any real plan (P4). What it draws is read back from the Pascal scene
// (readTrace), the same way the Rooms drawing and the Lot board do.
import { useMemo, useRef, useState } from 'react'
import { CHECKS_NEEDED, mPerPx, nearestWall, placeOpening, roomAreaFt2, sizeCheck, snapPoint, tid, wallEnds, wallFt } from '../trace/trace.js'
import { readTrace } from '../scene/sync.js'
import { ftIn, ftToM, mToFt } from '../units.js'
import { t, tm, tn, tx } from '../i18n.js'
import { fitOf, fitRoom, fitVerdict, newFit, rectFt } from '../trace/fit.js'
import { ROOM_TYPES, TYPE_ORDER, applyAnswers } from '../rooms/types.js'

const TOOLS = ['scale', 'wall', 'door', 'window', 'room', 'check', 'erase']
const inside = (p, pts) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j]; if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c } return c }

export default function TraceBoard({ trace, rules, nodes, pictureUrl, pictureNote, onTrace, onSample, onUpload, onCopyRooms }) {
  const svgRef = useRef(null), fileRef = useRef(null)
  const [tool, setTool] = useState(trace.scale ? 'wall' : 'scale')
  const [pts, setPts] = useState([])
  const [lvId, setLvId] = useState(trace.levels[0].id)
  const [undo, setUndo] = useState([])
  const [doorFt, setDoorFt] = useState(3), [winFt, setWinFt] = useState(4)
  const [scaleFt, setScaleFt] = useState(trace.scale?.ft ?? '')
  const [checkWall, setCheckWall] = useState(null), [checkFt, setCheckFt] = useState('')
  const [busy, setBusy] = useState(false)
  const img = trace.image, k = mPerPx(trace)
  const level = trace.levels.find((l) => l.id === lvId) || trace.levels[0]
  const fromScene = useMemo(() => readTrace(nodes), [nodes])
  const shown = fromScene?.[level.id] || level // the scene once the scale is set; before that, the data
  const check = sizeCheck(trace, rules)

  const commit = (next) => { setUndo([...undo.slice(-29), trace]); onTrace(next) }
  const withLevel = (fn) => commit({ ...trace, levels: trace.levels.map((l) => (l.id === level.id ? fn(l) : l)) })
  const pick = (tl) => { setTool(tl); setPts([]); setCheckWall(null) }
  const r = () => 14 * (img ? img.w / (svgRef.current?.clientWidth || img.w) : 1) // 14 screen px, in picture px
  const pt = (e) => { const p = svgRef.current.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svgRef.current.getScreenCTM().inverse()); return { x: q.x, y: q.y } }

  const tap = (e) => {
    if (!img) return
    const raw = pt(e), R = r(), ends = wallEnds(level)
    if (tool === 'scale') {
      const p = snapPoint(raw, pts[0], ends, R)
      setPts(pts.length >= 2 ? [p] : [...pts, p]); return
    }
    if (!k) return
    if (tool === 'wall') {
      const last = pts[pts.length - 1], p = snapPoint(raw, last, [...ends, ...pts], R)
      if (!last) { setPts([p]); return }
      if (Math.hypot(p.x - last.x, p.y - last.y) < 1) { setPts([]); return } // same point twice ends the line
      withLevel((l) => ({ ...l, walls: [...l.walls, { id: tid('w'), a: last, b: p, openings: [] }] }))
      setPts([p]); return
    }
    if (tool === 'door' || tool === 'window') {
      const o = placeOpening(trace, level, raw, tool, ftToM(tool === 'door' ? doorFt : winFt), R * 1.5)
      if (o) withLevel((l) => ({ ...l, walls: l.walls.map((w) => (w.id === o.wallId ? { ...w, openings: [...(w.openings || []), o.opening] } : w)) }))
      return
    }
    if (tool === 'room') {
      const p = snapPoint(raw, pts[pts.length - 1], [...ends, ...pts.slice(0, 1)], R)
      if (pts.length >= 3 && Math.hypot(p.x - pts[0].x, p.y - pts[0].y) < 1) {
        withLevel((l) => ({ ...l, rooms: [...l.rooms, { id: tid('r'), name: `Room ${l.rooms.length + 1}`, pts }] }))
        setPts([]); return
      }
      setPts([...pts, p]); return
    }
    if (tool === 'check') { const h = nearestWall(level, raw); if (h && h.d <= R * 1.5) { setCheckWall(h.wall.id); setCheckFt('') } return }
    if (tool === 'erase') {
      for (const w of level.walls) for (const o of w.openings || []) {
        const c = { x: w.a.x + o.t * (w.b.x - w.a.x), y: w.a.y + o.t * (w.b.y - w.a.y) }
        if (Math.hypot(raw.x - c.x, raw.y - c.y) <= R) { withLevel((l) => ({ ...l, walls: l.walls.map((x) => (x.id === w.id ? { ...x, openings: x.openings.filter((y) => y.id !== o.id) } : x)) })); return }
      }
      const h = nearestWall(level, raw)
      if (h && h.d <= R) {
        commit({ ...trace, checks: trace.checks.filter((c) => c.wallId !== h.wall.id), levels: trace.levels.map((l) => (l.id === level.id ? { ...l, walls: l.walls.filter((w) => w.id !== h.wall.id) } : l)) })
        return
      }
      const room = level.rooms.find((x) => inside(raw, x.pts))
      if (room) withLevel((l) => ({ ...l, rooms: l.rooms.filter((x) => x.id !== room.id) }))
    }
  }
  const setScale = () => {
    const ft = Number(scaleFt)
    if (pts.length !== 2 || !(ft > 0)) return
    commit({ ...trace, scale: { a: pts[0], b: pts[1], ft } }); setPts([]); setTool('wall')
  }
  const addCheck = () => {
    const ft = Number(checkFt)
    if (!checkWall || !(ft > 0)) return
    commit({ ...trace, checks: [...trace.checks.filter((c) => c.wallId !== checkWall), { id: tid('c'), wallId: checkWall, ft }] }); setCheckWall(null)
  }
  const upload = async (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; setBusy(true); try { await onUpload(f) } finally { setBusy(false) } }
  const addLevel = () => { const id = tid('lv'); commit({ ...trace, levels: [...trace.levels, { id, name: `Level ${trace.levels.length}`, walls: [], rooms: [] }] }); setLvId(id) }

  const sw = k ? 0.15 / k : 4 // wall thickness 0.15 m in picture px
  const pad = img ? Math.max(img.w, img.h) * 0.03 : 10
  const fmt = (ft) => (ft == null ? '–' : ftIn(ft))
  return (
    <main className="lot trace">
      <section className="panel lot-side">
        <h2>{t('tr.title')}</h2>
        <p className="muted small">{t('tr.help')}</p>
        <div className="chips">
          <button className={`chip ${img?.kind === 'sample' ? 'on' : ''}`} onClick={onSample}>{t('tr.sample')}</button>
          <button className={`chip ${img?.kind === 'local' ? 'on' : ''}`} disabled={busy} onClick={() => fileRef.current?.click()}>{busy ? t('tr.reading') : t('tr.upload')}</button>
          <input ref={fileRef} type="file" accept="image/*,application/pdf,.pdf" hidden onChange={upload} data-testid="trace-file" />
        </div>
        <p className="muted small">{t('tr.privacy')}</p>
        {pictureNote && <div className="note">{t(pictureNote)}</div>}

        {img && <>
          <h3>{t('tr.scaleH')}</h3>
          {k ? <p className="small" data-testid="trace-scale">{t('tr.scaleSet', { ft: trace.scale.ft, px: Math.round(Math.hypot(trace.scale.b.x - trace.scale.a.x, trace.scale.b.y - trace.scale.a.y)) })}</p> : <p className="small">{t('tr.scaleNone')}</p>}
          {tool === 'scale' && pts.length === 2 && (
            <div className="add-row"><label>{t('tr.realLength')}<input id="scale-ft" type="number" step="0.5" min="0.5" value={scaleFt} onChange={(e) => setScaleFt(e.target.value)} /></label><button className="btn" onClick={setScale}>{t('tr.setScale')}</button></div>
          )}

          <h3>{t('tr.toolsH')}</h3>
          <div className="chips">{TOOLS.map((tl) => <button key={tl} data-testid={`tool-${tl}`} className={`chip ${tool === tl ? 'on' : ''}`} disabled={tl !== 'scale' && !k} onClick={() => pick(tl)}>{t(`tr.tool.${tl}`)}</button>)}</div>
          <p className="muted small">{t(`tr.how.${tool}`)}</p>
          {tool === 'door' && <label className="small">{t('tr.doorW')}<input type="number" step="0.5" min="1" value={doorFt} onChange={(e) => setDoorFt(Number(e.target.value) || 3)} /></label>}
          {tool === 'window' && <label className="small">{t('tr.winW')}<input type="number" step="0.5" min="1" value={winFt} onChange={(e) => setWinFt(Number(e.target.value) || 4)} /></label>}
          <div className="chips">
            {(tool === 'wall' || tool === 'room') && pts.length > 0 && <button className="btn quiet" onClick={() => setPts([])}>{t('tr.endLine')}</button>}
            <button className="btn quiet" disabled={!undo.length} onClick={() => { onTrace(undo[undo.length - 1]); setUndo(undo.slice(0, -1)); setPts([]) }}>{t('tr.undo')}</button>
          </div>

          <h3>{t('tr.levelsH')}</h3>
          <div className="chips">{trace.levels.map((l) => <button key={l.id} className={`chip ${l.id === level.id ? 'on' : ''}`} onClick={() => { setLvId(l.id); setPts([]) }}>{tx(l.name)}</button>)}<button className="chip" onClick={addLevel}>+ {t('tr.addLevel')}</button></div>

          <h3>{t('tr.checkH')}</h3>
          <p className="muted small">{t('tr.checkHelp', { n: CHECKS_NEEDED, tol: ftIn(check.tolFt) })}</p>
          {checkWall && <div className="add-row"><label>{t('tr.drawingSays')}<input id="check-ft" type="number" step="0.25" min="0.25" value={checkFt} onChange={(e) => setCheckFt(e.target.value)} /></label><button className="btn" onClick={addCheck}>{t('tr.addCheck')}</button></div>}
          {check.rows.length > 0 && <ul className="tray">{check.rows.map((c) => <li key={c.id}><span>{t('tr.checkRow', { drawing: fmt(c.ft), traced: fmt(c.traced), diff: c.diff == null ? '–' : `${c.diff >= 0 ? '+' : '−'}${ftIn(Math.abs(c.diff))}` })}</span><span className={`tag ${c.ok ? 'pass' : 'warn'}`}>{c.ok ? t('tr.ok') : t('tr.off')}</span></li>)}</ul>}
          <div className={`result ${check.status === 'match' ? 'ok' : check.status === 'again' ? 'bad' : ''}`} data-testid="trace-check">
            {check.status === 'match' ? t('tr.match', { n: check.rows.length }) : check.status === 'again' ? t('tr.again', { list: check.off.map((o) => fmt(o.ft)).join(t('list.sep')) }) : t('tr.need', { n: check.rows.length, of: CHECKS_NEEDED })}
          </div>

          <h3>{t('tr.overlayH')}</h3>
          <label className="small">{t('tr.opacity', { n: trace.opacity ?? 60 })}<input type="range" min="0" max="100" step="5" value={trace.opacity ?? 60} onChange={(e) => onTrace({ ...trace, opacity: Number(e.target.value) })} /></label>

          {shown.rooms.length > 0 && <>
            <h3>{t('tr.roomsH')}</h3>
            <ul className="tray">{level.rooms.map((rm) => <li key={rm.id}><input aria-label={t('ed.roomName')} value={tx(rm.name)} onChange={(e) => onTrace({ ...trace, levels: trace.levels.map((l) => (l.id === level.id ? { ...l, rooms: l.rooms.map((x) => (x.id === rm.id ? { ...x, name: e.target.value } : x)) } : l)) })} /><span className="muted small">{t('tr.area', { a: (roomAreaFt2(trace, rm) ?? 0).toFixed(0) })}</span></li>)}</ul>
          </>}
          <TestFit trace={trace} rules={rules} onTrace={onTrace} onCopyRooms={onCopyRooms} />
          <button className="btn quiet" onClick={() => { if (confirm(t('tr.startOverAsk'))) { commit({ ...trace, levels: trace.levels.map((l) => ({ ...l, walls: [], rooms: [] })), checks: [] }); setPts([]) } }}>{t('tr.startOver')}</button>
        </>}
      </section>

      <section className="panel lot-board">
        {!img ? <div className="drawing-empty">{t('tr.empty')}</div> : (
          <svg ref={svgRef} className="lot-svg trace-svg" viewBox={`${-pad} ${-pad} ${img.w + 2 * pad} ${img.h + 2 * pad}`} onClick={tap} role="img" aria-label={t('tr.aria', { name: tx(img.name) })} data-testid="trace-svg">
            <rect x={0} y={0} width={img.w} height={img.h} fill="var(--floor)" />
            {pictureUrl && <image href={pictureUrl} x={0} y={0} width={img.w} height={img.h} opacity={(trace.opacity ?? 60) / 100} preserveAspectRatio="none" />}
            {trace.scale && <g pointerEvents="none"><line x1={trace.scale.a.x} y1={trace.scale.a.y} x2={trace.scale.b.x} y2={trace.scale.b.y} stroke="var(--teal)" strokeWidth={sw / 2} strokeDasharray={`${sw} ${sw}`} /></g>}
            {shown.rooms.map((rm) => {
              const cx = rm.pts.reduce((s, p) => s + p.x, 0) / rm.pts.length, cy = rm.pts.reduce((s, p) => s + p.y, 0) / rm.pts.length
              const a = roomAreaFt2(trace, rm)
              const v = trace.fit?.on ? fitVerdict(trace, rm, rules).status : null
              const col = v === 'fits' ? 'var(--ok)' : v === 'too-small' ? 'var(--warn)' : 'var(--accent)'
              return <g key={rm.id} pointerEvents="none" data-verdict={v || undefined}><polygon points={rm.pts.map((p) => `${p.x},${p.y}`).join(' ')} fill={col} fillOpacity={v === 'fits' || v === 'too-small' ? 0.2 : 0.12} stroke={col} strokeWidth={sw / 3} /><text x={cx} y={cy} fontSize={sw * 3} textAnchor="middle" fill="var(--ink)">{tx(rm.name)}</text>{a != null && <text x={cx} y={cy + sw * 3.5} fontSize={sw * 2.4} textAnchor="middle" fill="var(--muted)">{a.toFixed(0)} ft²</text>}</g>
            })}
            {shown.walls.map((w) => {
              const chk = check.rows.find((c) => c.wallId === w.id)
              const L = Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y) || 1, ux = (w.b.x - w.a.x) / L, uy = (w.b.y - w.a.y) / L
              return (
                <g key={w.id} pointerEvents="none">
                  <line x1={w.a.x} y1={w.a.y} x2={w.b.x} y2={w.b.y} stroke={chk && !chk.ok ? 'var(--warn)' : checkWall === w.id ? 'var(--accent)' : 'var(--wall)'} strokeWidth={sw} strokeLinecap="square" opacity={0.85} />
                  {(w.openings || []).map((o) => {
                    const half = k ? o.width / k / 2 : 0, cx = w.a.x + o.t * (w.b.x - w.a.x), cy = w.a.y + o.t * (w.b.y - w.a.y)
                    return <line key={o.id} x1={cx - ux * half} y1={cy - uy * half} x2={cx + ux * half} y2={cy + uy * half} stroke={o.kind === 'door' ? 'var(--accent)' : 'var(--teal)'} strokeWidth={sw * 1.3} />
                  })}
                  {k && <text x={(w.a.x + w.b.x) / 2 - uy * sw * 2.2} y={(w.a.y + w.b.y) / 2 + ux * sw * 2.2} fontSize={sw * 2.2} textAnchor="middle" fill="var(--muted)">{ftIn(wallFt(trace, w))}</text>}
                </g>
              )
            })}
            {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={sw * 0.9} fill="var(--accent)" pointerEvents="none" />)}
            {pts.length > 1 && <polyline points={pts.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="var(--accent)" strokeWidth={sw / 2} pointerEvents="none" />}
          </svg>
        )}
        <div className="legend">{tn('tr.legend', { wall: <span className="sw wallk" />, door: <span className="sw door-c" />, win: <span className="sw win-c" />, room: <span className="sw room-c" /> })}</div>
        {img && k && <p className="muted small">{t('tr.size', { w: ftIn(mToFt(img.w * k)), d: ftIn(mToFt(img.h * k)) })}</p>}
      </section>
    </main>
  )
}

// P5 test fit: name each traced room's type and contents; Rooms from contents checks it at its traced size.
function TestFit({ trace, rules, onTrace, onCopyRooms }) {
  const [open, setOpen] = useState(null)
  const [copied, setCopied] = useState(null)
  const fit = trace.fit || newFit()
  const rooms = trace.levels.flatMap((l) => l.rooms.map((r) => ({ ...r, level: l.name })))
  const setFit = (next) => onTrace({ ...trace, fit: next })
  const setRoom = (id, v) => setFit({ ...fit, rooms: { ...fit.rooms, [id]: v } })
  const clearRoom = (id) => { const r = { ...fit.rooms }; delete r[id]; setFit({ ...fit, rooms: r }) }
  return (
    <div className="item-edit testfit">
      <h3>{t('fit.title')}</h3>
      <p className="muted small">{t('fit.help')}</p>
      <label className="check"><input type="checkbox" data-testid="fit-on" checked={!!fit.on} onChange={(e) => setFit({ ...fit, on: e.target.checked })} />{t('fit.mark')}</label>
      {fit.on && rooms.length === 0 && <p className="muted small">{t('fit.noRooms')}</p>}
      {fit.on && rooms.map((rm) => {
        const f = fitOf(trace, rm.id), size = rectFt(trace, rm), v = fitVerdict(trace, rm, rules)
        const ty = f && ROOM_TYPES[f.type]
        return (
          <div key={rm.id} className="fit-room" data-testid={`fit-${rm.id}`}>
            <div className="q-label">{tx(rm.name)} <span className="muted small">· {size ? `${ftIn(size.w)} x ${ftIn(size.d)}` : t('fit.notRectShort')}</span></div>
            <select aria-label={t('fit.type', { name: rm.name })} value={f?.type || ''} onChange={(e) => (e.target.value ? setRoom(rm.id, fitRoom(e.target.value)) : clearRoom(rm.id))}>
              <option value="">{t('fit.pickType')}</option>
              {TYPE_ORDER.map((k) => <option key={k} value={k}>{tx(ROOM_TYPES[k].label)}</option>)}
            </select>
            {ty && !ty.plain && <div className="chips">{Object.keys(ty.presets).map((p) => <button key={p} className={`chip ${f.preset === p ? 'on' : ''}`} onClick={() => setRoom(rm.id, fitRoom(f.type, p))}>{tx(p)}</button>)}<button className="chip" onClick={() => setOpen(open === rm.id ? null : rm.id)}>{t(open === rm.id ? 'fit.hideContents' : 'fit.contents')}</button></div>}
            {ty && !ty.plain && open === rm.id && ty.questions.map((q) => (
              <div key={q.id} className="q"><div className="q-label small">{tx(q.label)}</div><div className="chips">{q.options.map(([val, label]) => <button key={val} className={`chip ${f.answers?.[q.id] === val ? 'on' : ''}`} onClick={() => { const r = applyAnswers({ ...f, items: f.items || [] }, { ...f.answers, [q.id]: val }); setRoom(rm.id, { type: f.type, preset: f.preset, answers: r.answers, items: r.items }) }}>{tx(label)}</button>)}</div></div>
            ))}
            <Verdict v={v} />
          </div>
        )
      })}
      {fit.on && rooms.some((r) => fitOf(trace, r.id) && rectFt(trace, r)) && <>
        <button className="btn" data-testid="fit-copy" onClick={() => { const n = onCopyRooms(); setCopied(n) }}>{t('fit.copy')}</button>
        <p className="muted small">{copied != null ? t('fit.copied', { n: copied }) : t('fit.copyHelp')}</p>
      </>}
    </div>
  )
}

function Verdict({ v }) {
  if (v.status === 'no-type') return null
  if (v.status === 'not-rect') return <div className="result" data-testid="fit-verdict">{t('fit.notRect')}</div>
  if (v.status === 'plain') return <div className="result" data-testid="fit-verdict">{t('fit.plain')}</div>
  if (v.status === 'fits') return <div className="result ok" data-testid="fit-verdict">{tn('fit.fits', { spare: v.spare.toFixed(1) })}</div>
  return (
    <div className="result bad" data-testid="fit-verdict">
      <div>{tn('fit.tooSmall', { w: v.shortW.toFixed(1), d: v.shortD.toFixed(1), min: `${v.min.w.toFixed(1)} x ${v.min.d.toFixed(1)} ft` })}</div>
      {v.changes?.length > 0 && <ul className="small">{v.changes.map((c, i) => <li key={i}>{(c.msgs || c.changes).map(tm).join(' + ')}</li>)}</ul>}
    </div>
  )
}
