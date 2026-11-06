import { useEffect, useState } from 'react'
import { LIBRARY } from '../furniture/library.js'
import { checkSize, egressNeeded, minimumSize, roomNotes } from '../rooms/engine.js'
import { LEVELS, ROOM_TYPES, applyOptions, makeItem, newId } from '../rooms/types.js'
import { presetDefaults } from '../rooms/bands.js'
import { mainBedroomWanted, offersSofaBed } from '../rooms/answers.js'
import { ftIn, ftToM, ftToMm, mToFt, mmToFt, sizeDec, sizeFt } from '../units.js'
import Drawing from './Drawing.jsx'
import { t as tr, tm, tn, tx, useLang } from '../i18n.js'

const money = (n) => 'C$' + Math.round(n).toLocaleString('en-CA')
const categories = [...new Set(LIBRARY.map((i) => i.category))]

// Sizes as feet and inches, nearest inch (SPEC §4).
const sizeFtIn = (w, d) => `${ftIn(w)} x ${ftIn(d)}`

export default function RoomEditor({ room, rules, geo, ctx, lotNote, known = [], answers = {}, rooms = [], onAnswer, onChange, onDelete }) {
  const t = ROOM_TYPES[room.type]
  const lang = useLang(), L = (pair) => (Array.isArray(pair) ? pair[lang === 'zh' ? 1 : 0] : tx(pair))
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
  const option = (q, v) => { onChange(applyOptions(room, { [q.key]: v }, rules)); if (q.id) onAnswer?.(q.id, v); setResult(null) }
  const applyPatch = (patch) => { const next = applyOptions(room, patch, rules); onChange(next); const m = minimumSize(next, rules, ctx); setResult(checkSize(next, Number(w), Number(d), rules, ctx)); return m }
  const reset = () => { onChange({ ...applyOptions({ ...room, items: [] }, presetDefaults(room.type), rules) }); setResult(null) }
  const setItems = (items) => { onChange({ ...room, items }); setResult(null) }
  const editItem = (id, patch) => setItems(room.items.map((i) => (i.id === id ? { ...i, ...patch, ...('w' in patch || 'd' in patch ? { edited: true } : {}) } : i)))

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
    if (lib) setItems([...room.items, makeItem(lib, { byHand: true })])
  }
  const addCustom = () => {
    const cw = Number(custom.w), cd = Number(custom.d)
    if (!custom.name.trim() || !(cw > 0) || !(cd > 0)) return
    setItems([...room.items, { id: newId(), libId: null, name: custom.name.trim(), type: 'custom', w: Math.round(ftToMm(cw)), d: Math.round(ftToMm(cd)), byHand: true }])
    setCustom({ name: '', w: '', d: '' })
  }

  return (
    <section className="editor">
      <div className="editor-head">
        <input className="room-name" aria-label={tr('ed.roomName')} value={tx(room.name)} onChange={(e) => update({ name: e.target.value })} />
        <button className="btn quiet" onClick={onDelete}>{tr('ed.delete')}</button>
      </div>
      <div className="q" data-testid="room-level">
        <div className="q-label small">{tr('ed.level')}</div>
        <div className="chips">{LEVELS.map((lv) => <button key={lv} className={`chip ${(room.level || 'main') === lv ? 'on' : ''}`} onClick={() => update({ level: lv })}>{tr(`level.${lv}`)}</button>)}</div>
        {mainBedroomWanted(answers, rooms) && <div className="note small">{tr('ed.mainBedroom')}</div>}
        <div className="q-label small">{tr('ed.phase')}</div>
        <div className="chips" data-testid="room-phase">{['now', 'later'].map((ph) => <button key={ph} className={`chip ${room.phase === ph ? 'on' : ''}`} onClick={() => update({ phase: ph })}>{tr(`ed.phase.${ph}`)}</button>)}</div>
      </div>

      <div className="cols">
        <div className="col">
          {t.plain ? <p className="muted">{tr('ed.plain')}</p> : <>
          <h3>{tr('ed.startFrom')}</h3>
          <div className="chips"><span className="chip on">{tx(t.presetName)}</span><button className="btn tiny" onClick={reset}>{tr('ed.reset')}</button></div>

          <h3>{tr('ed.questions')}</h3>
          {t.questions.map((q) => (
            <div key={q.key} className="q" data-testid={`opt-${q.key}`}>
              <div className="q-label">{L(q.label)}{q.id ? <span className="tag">{q.id}</span> : null}</div>
              <div className="chips">{q.options.map(([v, en, zh]) => <button key={String(v)} className={`chip ${String(room.options?.[q.key]) === String(v) ? 'on' : ''}`} onClick={() => option(q, v)}>{lang === 'zh' ? zh : en}</button>)}</div>
            </div>
          ))}
          {room.type === 'office' && !room.options?.sofa_bed && offersSofaBed(answers) && <div className="note">{tr('ed.offerSofaBed')} <button className="btn tiny" onClick={() => option(t.questions.find((q) => q.key === 'sofa_bed'), true)}>{tr('ed.addSofaBed')}</button></div>}

          <h3>{tr('ed.furniture')}</h3>
          <ul className="items">
            {room.items.map((it) => (
              <li key={it.id} className={it.id === selectedId ? 'on' : ''}>
                <button className="item-name" onClick={() => setSelectedId(it.id)}>{tx(it.name)}</button>
                <span className="dims">{ftIn(mmToFt(it.w))} x {ftIn(mmToFt(it.d))}</span>
                <button className="btn tiny" aria-label={tr('ed.addAnother', { name: it.name })} onClick={() => setItems([...room.items, { ...it, id: newId(), pos: undefined, byHand: true, slot: undefined, attach: undefined }])}>+1</button>
                <button className="btn tiny" aria-label={tr('ed.removeItem', { name: it.name })} onClick={() => setItems(room.items.filter((x) => x.id !== it.id))}>{tr('ed.remove')}</button>
              </li>
            ))}
          </ul>

          {sel && (
            <div className="item-edit">
              <div className="q-label">{tr('ed.selected', { name: sel.name })}</div>
              <label>{tr('ed.widthFt')}<input type="number" step="0.25" min="0.25" value={+mmToFt(sel.w).toFixed(2)} onChange={(e) => e.target.value > 0 && editItem(sel.id, { w: Math.round(ftToMm(Number(e.target.value))) })} /></label>
              <label>{tr('ed.depthFt')}<input type="number" step="0.25" min="0.25" value={+mmToFt(sel.d).toFixed(2)} onChange={(e) => e.target.value > 0 && editItem(sel.id, { d: Math.round(ftToMm(Number(e.target.value))) })} /></label>
              <button className="btn quiet" onClick={() => editItem(sel.id, { pos: { ...(geo?.items[sel.id] ?? { cx: 0, cy: 0 }), rot: (((geo?.items[sel.id]?.rot ?? 0) + 90) % 360) } })}>{tr('ed.rotate')}</button>
              <button className="btn quiet" onClick={() => editItem(sel.id, { pos: undefined })}>{tr('ed.backToPlace')}</button>
            </div>
          )}

          <div className="add-row">
            <select id="add-item" aria-label={tr('ed.library')} value={addId} onChange={(e) => setAddId(e.target.value)}>
              <option value="">{tr('ed.addFromLib')}</option>
              {categories.map((c) => <optgroup key={c} label={tx(c)}>{LIBRARY.filter((i) => i.category === c).map((i) => <option key={i.id} value={i.id}>{tx(i.name)} · {ftIn(mmToFt(i.w))} x {ftIn(mmToFt(i.d))}</option>)}</optgroup>)}
            </select>
            <button className="btn" disabled={!addId} onClick={addFromLibrary}>{tr('ed.add')}</button>
          </div>
          <div className="add-row">
            <input id="custom-name" placeholder={tr('ed.customName')} value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} />
            <input id="custom-w" type="number" placeholder={tr('ed.wFt')} step="0.25" value={custom.w} onChange={(e) => setCustom({ ...custom, w: e.target.value })} />
            <input id="custom-d" type="number" placeholder={tr('ed.dFt')} step="0.25" value={custom.d} onChange={(e) => setCustom({ ...custom, d: e.target.value })} />
            <button className="btn" onClick={addCustom}>{tr('ed.addCustom')}</button>
          </div>
          </>}
        </div>

        <div className="col">
          {lotNote && <div className="note">{lotNote}</div>}
          {t.plain ? <div className="min-line">{tn('ed.plainMin', { size: <b data-testid="min-size">{sizeFt(sizeNow.w, sizeNow.d)}</b> })}</div> :
          <div className="min-line">{tn(min.placed ? 'ed.minPlaced' : 'ed.min', { size: <b data-testid="min-size">{sizeFtIn(min.w, min.d)}</b>, ftin: <span className="muted">({sizeDec(min.w, min.d)})</span> })}</div>}
          {!t.plain && egressNeeded(room) && <div className="tag warn" data-testid="egress-flag">{tr('ed.egress')}</div>}
          {known.length > 0 && <div className="known" data-testid="known-sizes">{tr('ed.known', { list: known.map((k) => tr('ed.knownOne', { name: k.name, w: ftIn(k.w), d: ftIn(k.d) })).join(tr('list.sep')) })}</div>}
          <div className="size-row">
            <label>{tr('ed.widthFt')}<input id="size-w" type="number" step="0.5" min="1" value={w} onChange={(e) => setW(e.target.value)} /></label>
            <label>{tr('ed.depthFt')}<input id="size-d" type="number" step="0.5" min="1" value={d} onChange={(e) => setD(e.target.value)} /></label>
            <button id="check-size" className="btn" onClick={check}>{tr('ed.check')}</button>
          </div>
          <div className="muted small">{room.size ? tr('ed.yourSize', { size: sizeFt(sizeNow.w, sizeNow.d) }) : tr('ed.usingMin')}</div>
          <Result r={result} onMake={(W, D) => useSize(W, D)} onApply={applyPatch} />
          {roomNotes(room, rules).map((n) => <div key={n[0]} className="note">{tm(n)}</div>)}
          <Drawing room={room} geo={geo} sizeFt={sizeNow} rules={rules} ctx={ctx} selectedId={selectedId} onSelect={setSelectedId} onMove={(id, pos) => editItem(id, { pos })} />
          <div className="legend">{tn('ed.legend', { walk: <span className="sw walk" />, bad: <span className="sw bad" /> })}</div>
        </div>
      </div>
    </section>
  )
}

function Result({ r, onMake, onApply }) {
  if (!r) return null
  if (r.status === 'bad') return <div className="result bad">{tr('res.bad')}</div>
  if (r.status === 'fits') return (
    <div className="result ok" data-testid="check-result">
      <div>{tn('res.fits', { size: sizeFtIn(r.W, r.D), turned: r.turned ? tr('res.turned') : '' })}{' '}
      {r.spare > 0.05 ? tn('res.spare', { area: <b>{r.spare.toFixed(1)} ft²</b>, low: money(r.costLow), high: money(r.costHigh) }) : tr('res.isMin')}</div>
    </div>
  )
  const by = (side) => r.changes.filter((c) => c.side === side)
  return (
    <div className="result bad" data-testid="check-result">
      <div>{tn('res.tooSmall', { w: <b>{r.shortW.toFixed(1)} ft</b>, d: <b>{r.shortD.toFixed(1)} ft</b> })}</div>
      {r.changes.length > 0 && <>
        <div>{tr('res.changes')}</div>
        <ul data-testid="changes">{['w', 'd'].filter((s) => by(s).length).map((s) => (
          <li key={s}>{tr(`res.side.${s}`)}: {by(s).map((c, i) => <span key={i}>{i > 0 ? tr('res.or') : ''}{tm(c.msg)} ({tr(`res.sideNew.${s}`, { ft: c.ft.toFixed(2) })}) <button className="btn tiny" onClick={() => onApply(c.patch)}>{tr('res.apply')}</button></span>)}</li>
        ))}</ul>
      </>}
      <button className="btn" onClick={() => onMake(r.min.w, r.min.d)}>{tr('res.makeIt', { size: sizeFtIn(r.min.w, r.min.d) })}</button>
    </div>
  )
}
