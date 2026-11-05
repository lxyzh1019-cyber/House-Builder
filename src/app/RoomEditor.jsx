import { useEffect, useState } from 'react'
import { LIBRARY } from '../furniture/library.js'
import { checkSize, minimumSize, roomNotes } from '../rooms/engine.js'
import { ROOM_TYPES, applyAnswers, makeItem, newId } from '../rooms/types.js'
import { ftIn, ftToM, ftToMm, mToFt, mmToFt, sizeFt } from '../units.js'
import Drawing from './Drawing.jsx'

const money = (n) => 'C$' + Math.round(n).toLocaleString('en-CA')
const categories = [...new Set(LIBRARY.map((i) => i.category))]

export default function RoomEditor({ room, rules, geo, ctx, lotNote, onChange, onDelete }) {
  const t = ROOM_TYPES[room.type]
  const min = minimumSize(room, rules, ctx)
  const set = room.size ? { w: mToFt(room.size.w), d: room.size.d && mToFt(room.size.d) } : null
  const [w, setW] = useState(set ? +set.w.toFixed(2) : min.w)
  const [d, setD] = useState(set ? +set.d.toFixed(2) : min.d)
  const [result, setResult] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [addId, setAddId] = useState('')
  const [custom, setCustom] = useState({ name: '', w: '', d: '' })
  const sizeNow = set || { w: min.w, d: min.d }
  // While no size is set, the inputs follow the minimum (R5 default).
  useEffect(() => { if (!room.size) { setW(min.w); setD(min.d) } }, [room.size, min.w, min.d])
  const sel = room.items.find((i) => i.id === selectedId)

  const update = (patch) => onChange({ ...room, ...patch })
  const answer = (qid, v) => { onChange(applyAnswers(room, { ...room.answers, [qid]: v })); setResult(null) }
  const preset = (name) => { onChange({ ...applyAnswers(room, { ...t.presets[name] }), preset: name }); setResult(null) }
  const setItems = (items) => { onChange({ ...room, items }); setResult(null) }
  const editItem = (id, patch) => setItems(room.items.map((i) => (i.id === id ? { ...i, ...patch } : i)))

  // R5: the user's size is saved as set (bigger is always accepted). "Check my size" explains it.
  const check = () => {
    const W = Number(w), D = Number(d)
    if (!(W > 0 && D > 0)) { setResult({ status: 'bad' }); return }
    update({ size: { w: ftToM(W), d: ftToM(D) } })
    setResult(checkSize(room, W, D, rules, ctx))
  }
  const useSize = (W, D) => { setW(W); setD(D); update({ size: { w: ftToM(W), d: ftToM(D) } }); setResult(checkSize(room, W, D, rules, ctx)) }

  const addFromLibrary = () => {
    const lib = LIBRARY.find((i) => i.id === addId)
    if (lib) setItems([...room.items, makeItem(lib, 'extra', { byHand: true })])
  }
  const addCustom = () => {
    const cw = Number(custom.w), cd = Number(custom.d)
    if (!custom.name.trim() || !(cw > 0) || !(cd > 0)) return
    setItems([...room.items, { id: newId(), libId: null, name: custom.name.trim(), type: 'custom', w: Math.round(ftToMm(cw)), d: Math.round(ftToMm(cd)), role: 'extra', byHand: true }])
    setCustom({ name: '', w: '', d: '' })
  }

  return (
    <section className="editor">
      <div className="editor-head">
        <input className="room-name" aria-label="Room name" value={room.name} onChange={(e) => update({ name: e.target.value })} />
        <button className="btn quiet" onClick={onDelete}>Delete room</button>
      </div>

      <div className="cols">
        <div className="col">
          {t.plain ? <p className="muted">A plain room for now: type its size. Its own questions and furniture come in a later piece.</p> : <>
          <h3>Start from</h3>
          <div className="chips">{Object.keys(t.presets).map((p) => <button key={p} className={`chip ${room.preset === p ? 'on' : ''}`} onClick={() => preset(p)}>{p}</button>)}</div>

          <h3>Questions</h3>
          {t.questions.map((q) => (
            <div key={q.id} className="q">
              <div className="q-label">{q.label}{q.section ? <span className="tag">Questionnaire §{q.section}</span> : null}</div>
              <div className="chips">{q.options.map(([v, label]) => <button key={v} className={`chip ${room.answers[q.id] === v ? 'on' : ''}`} onClick={() => answer(q.id, v)}>{label}</button>)}</div>
            </div>
          ))}

          <h3>Furniture in this room</h3>
          <ul className="items">
            {room.items.map((it) => (
              <li key={it.id} className={it.id === selectedId ? 'on' : ''}>
                <button className="item-name" onClick={() => setSelectedId(it.id)}>{it.name}</button>
                <span className="dims">{ftIn(mmToFt(it.w))} x {ftIn(mmToFt(it.d))}</span>
                <button className="btn tiny" aria-label={`Add another ${it.name}`} onClick={() => setItems([...room.items, { ...it, id: newId(), pos: undefined, byHand: true, role: it.role === 'main' ? 'side' : it.role }])}>+1</button>
                <button className="btn tiny" aria-label={`Remove ${it.name}`} onClick={() => setItems(room.items.filter((x) => x.id !== it.id))}>Remove</button>
              </li>
            ))}
          </ul>

          {sel && (
            <div className="item-edit">
              <div className="q-label">Selected: {sel.name}</div>
              <label>Width (ft)<input type="number" step="0.25" min="0.25" value={+mmToFt(sel.w).toFixed(2)} onChange={(e) => e.target.value > 0 && editItem(sel.id, { w: Math.round(ftToMm(Number(e.target.value))) })} /></label>
              <label>Depth (ft)<input type="number" step="0.25" min="0.25" value={+mmToFt(sel.d).toFixed(2)} onChange={(e) => e.target.value > 0 && editItem(sel.id, { d: Math.round(ftToMm(Number(e.target.value))) })} /></label>
              <button className="btn quiet" onClick={() => editItem(sel.id, { pos: { ...(geo?.items[sel.id] ?? { cx: 0, cy: 0 }), rot: (((geo?.items[sel.id]?.rot ?? 0) + 90) % 360) } })}>Rotate 90°</button>
              <button className="btn quiet" onClick={() => editItem(sel.id, { pos: undefined })}>Back to its place</button>
            </div>
          )}

          <div className="add-row">
            <select id="add-item" aria-label="Furniture library" value={addId} onChange={(e) => setAddId(e.target.value)}>
              <option value="">Add from the library…</option>
              {categories.map((c) => <optgroup key={c} label={c}>{LIBRARY.filter((i) => i.category === c).map((i) => <option key={i.id} value={i.id}>{i.name} · {ftIn(mmToFt(i.w))} x {ftIn(mmToFt(i.d))}</option>)}</optgroup>)}
            </select>
            <button className="btn" disabled={!addId} onClick={addFromLibrary}>Add</button>
          </div>
          <div className="add-row">
            <input id="custom-name" placeholder="Custom item name" value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} />
            <input id="custom-w" type="number" placeholder="W ft" step="0.25" value={custom.w} onChange={(e) => setCustom({ ...custom, w: e.target.value })} />
            <input id="custom-d" type="number" placeholder="D ft" step="0.25" value={custom.d} onChange={(e) => setCustom({ ...custom, d: e.target.value })} />
            <button className="btn" onClick={addCustom}>Add custom</button>
          </div>
          </>}
        </div>

        <div className="col">
          {lotNote && <div className="note">{lotNote}</div>}
          {t.plain ? <div className="min-line">No contents to size this room yet: <b data-testid="min-size">{sizeFt(sizeNow.w, sizeNow.d)}</b> is the size you typed.</div> :
          <div className="min-line">Minimum for these contents: <b data-testid="min-size">{sizeFt(min.w, min.d)}</b> <span className="muted">({ftIn(min.w)} x {ftIn(min.d)})</span></div>}
          <div className="size-row">
            <label>Width (ft)<input id="size-w" type="number" step="0.5" min="1" value={w} onChange={(e) => setW(e.target.value)} /></label>
            <label>Depth (ft)<input id="size-d" type="number" step="0.5" min="1" value={d} onChange={(e) => setD(e.target.value)} /></label>
            <button id="check-size" className="btn" onClick={check}>Check my size</button>
          </div>
          <div className="muted small">{room.size ? `Your size: ${sizeFt(sizeNow.w, sizeNow.d)} (saved)` : 'Using the minimum. Type your own size and press Check my size.'}</div>
          <Result r={result} onMake={(W, D) => useSize(W, D)} />
          {roomNotes(room, rules).map((n) => <div key={n} className="note">{n}</div>)}
          <Drawing room={room} geo={geo} sizeFt={sizeNow} rules={rules} ctx={ctx} selectedId={selectedId} onSelect={setSelectedId} onMove={(id, pos) => editItem(id, { pos })} />
          <div className="legend"><span className="sw walk" /> walkway or chair space <span className="sw bad" /> overlapping or outside the room · tap an item to see its clearances, drag to move it</div>
        </div>
      </div>
    </section>
  )
}

function Result({ r, onMake }) {
  if (!r) return null
  if (r.status === 'bad') return <div className="result bad">Type a width and a depth in feet.</div>
  if (r.status === 'fits') return (
    <div className="result ok" data-testid="check-result">
      <div><b>Fits.</b> {sizeFt(r.W, r.D)} holds these contents{r.turned ? ' (turned the other way round)' : ''}.{' '}
      {r.spare > 0.05 ? <>Spare <b>{r.spare.toFixed(1)} ft²</b> over the minimum, about {money(r.costLow)}–{money(r.costHigh)} at the build rate.</> : 'It is the minimum.'}</div>
    </div>
  )
  return (
    <div className="result bad" data-testid="check-result">
      <div><b>Too small.</b> Short by <b>{r.shortW.toFixed(1)} ft</b> in width and <b>{r.shortD.toFixed(1)} ft</b> in depth.</div>
      {r.changes.length > 0 && <>
        <div>Smallest changes that fit:</div>
        <ul>{r.changes.map((c, i) => <li key={i}>{c.changes.join(' + ')}{c.turned ? ' (room turned the other way round)' : ''}</li>)}</ul>
      </>}
      <button className="btn" onClick={() => onMake(r.min.w, r.min.d)}>or make it {sizeFt(r.min.w, r.min.d)}</button>
    </div>
  )
}
