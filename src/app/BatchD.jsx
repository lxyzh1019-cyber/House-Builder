// Batch D (SPEC §15) panels. The owner types the content; the app keeps it, adds it up and links it.
import { useState } from 'react'
import * as M from '../plan/more.js'
import * as P from '../plan/plan.js'
import { CODE_ITEMS } from '../plan/alberta.js'
import { t, tx } from '../i18n.js'

const money = (n) => (Number.isFinite(n) ? `${n < 0 ? '−' : ''}C$${Math.round(Math.abs(n)).toLocaleString('en-CA')}` : '–')
const num = (v) => (v === '' || v == null ? null : Number.isFinite(Number(v)) ? Number(v) : null)
const RoomPick = ({ rooms, value, onChange, label }) => (
  <select aria-label={label || t('stg.noRoom')} value={value || ''} onChange={(e) => onChange(e.target.value || null)}><option value="">{t('stg.noRoom')}</option>{rooms.map((r) => <option key={r.id} value={r.id}>{tx(r.name)}</option>)}</select>
)
const listEdit = (list, id, patch) => list.map((x) => (x.id === id ? { ...x, ...patch } : x))

// 15.1 Step owners, shown under each gate.
export function StepOwner({ plan, set, id, household }) {
  const s = plan.steps?.[id] || {}
  const put = (patch) => set({ steps: { ...(plan.steps || {}), [id]: { ...s, ...patch } } })
  return (
    <div className="add-row small step-row" data-testid={`step-${id}`}>
      <input list="hh-people" aria-label={t('so.lead', { id })} placeholder={t('so.lead', { id })} value={s.lead || ''} onChange={(e) => put({ lead: e.target.value })} />
      <datalist id="hh-people">{household.map((p) => <option key={p.id} value={p.label} />)}</datalist>
      <input aria-label={t('so.ai')} placeholder={t('so.ai')} value={s.ai || ''} onChange={(e) => put({ ai: e.target.value })} />
      <input aria-label={t('so.hours')} type="number" step="0.5" min="0" placeholder={t('so.hours')} value={s.hours ?? ''} onChange={(e) => put({ hours: num(e.target.value) })} />
      <input aria-label={t('so.cost')} type="number" step="50" min="0" placeholder={t('so.cost')} value={s.cost ?? ''} onChange={(e) => put({ cost: num(e.target.value) })} />
    </div>
  )
}
export const StageEffort = ({ plan, gates }) => { const e = M.stageEffort(plan.steps, gates); return e.hours || e.cost ? <span className="muted small" data-testid="stage-effort"> · {t('so.sum', { h: e.hours, cost: money(e.cost) })}</span> : null }

// 15.2 Pain points and 15.3 pictures we like (Stage 1).
export function Pains({ plan, set, rooms, by }) {
  const pains = plan.pains || []
  return (
    <div className="item-edit block" data-testid="pains">
      <div className="q-label">{t('pp.title')}</div>
      <ul className="tray">{pains.map((p) => (
        <li key={p.id}>
          <RoomPick rooms={rooms} value={p.roomId} onChange={(v) => set({ pains: listEdit(pains, p.id, { roomId: v }) })} />
          <input aria-label={t('pp.text')} placeholder={t('pp.text')} value={p.text} onChange={(e) => set({ pains: listEdit(pains, p.id, { text: e.target.value }) })} />
          <select aria-label={t('pp.often')} value={p.often} onChange={(e) => set({ pains: listEdit(pains, p.id, { often: e.target.value }) })}>{M.HOW_OFTEN.map((o) => <option key={o} value={o}>{t(`pp.${o}`)}</option>)}</select>
          <input aria-label={t('pp.who')} placeholder={t('pp.who')} value={p.who} onChange={(e) => set({ pains: listEdit(pains, p.id, { who: e.target.value }) })} />
          {p.sent ? <span className="tag pass">{t('pp.sent')}</span> : <button className="btn tiny" disabled={!p.text.trim()} onClick={() => set(M.sendPain(pains, plan.ideas || [], p.id, by, tx(rooms.find((r) => r.id === p.roomId)?.name) || ''))}>{t('pp.send')}</button>}
          <button className="btn tiny" onClick={() => set({ pains: pains.filter((x) => x.id !== p.id) })}>{t('ed.remove')}</button>
        </li>))}</ul>
      <button className="btn quiet" id="pp-add" onClick={() => set({ pains: [...pains, M.newPain()] })}>+ {t('pp.add')}</button>
      <p className="muted small">{t('pp.tourLater')}</p>
    </div>
  )
}
export function Pictures({ plan, set, rooms }) {
  const pics = plan.pictures || [], prof = M.styleProfile(pics)
  return (
    <div className="item-edit block" data-testid="pictures">
      <div className="q-label">{t('pic.title')}</div>
      <ul className="tray">{pics.map((p) => (
        <li key={p.id}>
          <input aria-label={t('pic.source')} placeholder={t('pic.source')} value={p.source} onChange={(e) => set({ pictures: listEdit(pics, p.id, { source: e.target.value }) })} />
          <RoomPick rooms={rooms} value={p.roomId} onChange={(v) => set({ pictures: listEdit(pics, p.id, { roomId: v }) })} />
          <input aria-label={t('pic.tags')} placeholder={t('pic.tags')} value={(p.tags || []).join(', ')} onChange={(e) => set({ pictures: listEdit(pics, p.id, { tags: e.target.value.split(',') }) })} />
          <button className="btn tiny" onClick={() => set({ pictures: pics.filter((x) => x.id !== p.id) })}>{t('ed.remove')}</button>
        </li>))}</ul>
      <button className="btn quiet" id="pic-add" onClick={() => set({ pictures: [...pics, M.newPicture()] })}>+ {t('pic.add')}</button>
      {prof.length > 0 && <p className="small" data-testid="style-profile">{t('pic.profile')} {prof.map((x) => `${x.tag} (${x.n})`).join(t('list.sep'))}</p>}
      <p className="muted small">{t('pic.note')}</p>
    </div>
  )
}

// 15.4 Lot checklist (Stage 0).
export function LotChecklist({ plan, set }) {
  const items = plan.lotItems || M.LOT_START.map((k) => ({ ...M.newLotItem(), id: `lot-${k}`, key: k }))
  const [text, setText] = useState('')
  const put = (list) => set({ lotItems: list })
  return (
    <div className="item-edit block" data-testid="lot-checklist">
      <div className="q-label">{t('lc.title')}</div>
      <ul className="tray">{items.map((i) => (
        <li key={i.id}><span>{i.key ? t(`lc.item.${i.key}`) : i.text}</span>
          <span className="chips">{M.ITEM_STATES.map((s) => <button key={s} className={`chip ${i.status === s ? 'on' : ''}`} onClick={() => put(listEdit(items, i.id, { status: s }))}>{t(`code.st.${s === 'done' ? 'met' : s}`)}</button>)}</span>
          <input aria-label={t('gate.notePh')} placeholder={t('gate.notePh')} value={i.note || ''} onChange={(e) => put(listEdit(items, i.id, { note: e.target.value }))} />
        </li>))}</ul>
      <div className="add-row"><input id="lc-text" placeholder={t('lc.ownPh')} value={text} onChange={(e) => setText(e.target.value)} /><button className="btn tiny" disabled={!text.trim()} onClick={() => { put([...items, M.newLotItem(text.trim())]); setText('') }}>+ {t('lc.add')}</button></div>
    </div>
  )
}

// 15.5 Design sprints D4a–D4g (Stage 2).
export function Sprints({ plan, set, rooms, st, versions, onVersions, design, by }) {
  const [open, setOpen] = useState(null)
  return (
    <div className="item-edit block" data-testid="sprints">
      <div className="q-label">{t('sp.title')}</div>
      <ul className="tray">{M.SPRINTS.map((sp) => {
        const s = plan.sprints?.[sp.id] || { roomIds: [], notes: '' }
        const put = (patch) => set({ sprints: { ...(plan.sprints || {}), [sp.id]: { ...s, ...patch } } })
        const c = M.sprintChecks(s, rooms, st, plan.code, CODE_ITEMS)
        return (
          <li key={sp.id} data-testid={`sprint-${sp.id}`} style={{ display: 'block' }}>
            <div className="add-row"><b>{sp.id}</b> {t(`sp.${sp.key}`)} <button className="btn tiny" onClick={() => setOpen(open === sp.id ? null : sp.id)}>{t(open === sp.id ? 'card2.close' : 'card2.open')}</button></div>
            {open === sp.id && <>
              <div className="chips">{rooms.map((r) => <label key={r.id} className="check small"><input type="checkbox" checked={s.roomIds.includes(r.id)} onChange={(e) => put({ roomIds: e.target.checked ? [...s.roomIds, r.id] : s.roomIds.filter((x) => x !== r.id) })} />{tx(r.name)}</label>)}</div>
              <textarea aria-label={t('sp.notes')} placeholder={t('sp.notes')} value={s.notes} onChange={(e) => put({ notes: e.target.value })} rows={2} style={{ width: '100%' }} />
              <div className="small" data-testid="sprint-fit">{t('sp.fit')} {c.fit.length ? c.fit.map((f) => `${tx(f.name)}: ${t(f.status === 'too-small' ? 'card.tooSmall' : f.status === 'fits' ? 'card.fits' : 'card.min')}`).join(t('list.sep')) : t('sp.noRooms')}</div>
              <div className="small" data-testid="sprint-code">{t('sp.code')} {c.openCode.length ? c.openCode.join(', ') : t('sp.codeDone')}</div>
              <button className="btn tiny" onClick={() => { const r = P.saveVersion(versions, design, `${sp.id} ${t(`sp.${sp.key}`)}`, by); if (!r.full) onVersions(r.versions) }}>{t('sp.save')}</button>
            </>}
          </li>
        )
      })}</ul>
    </div>
  )
}

// 15.8 Systems fine-tune checklist (Stage 2).
export function Systems({ plan, set }) {
  const s = plan.systems || {}
  return (
    <div className="item-edit block" data-testid="systems">
      <div className="q-label">{t('sy.title')}</div>
      <ul className="tray">{M.SYSTEMS.map((k) => <li key={k}><span>{t(`sy.${k}`)}</span><input aria-label={t(`sy.${k}`)} placeholder={t('sy.decision')} value={s[k] || ''} onChange={(e) => set({ systems: { ...s, [k]: e.target.value } })} /></li>)}</ul>
    </div>
  )
}

// 15.9 Work packages and 15.10 builder price (Stage 4).
export function Packages({ plan, set }) {
  const pk = plan.packages || []
  return (
    <div className="item-edit block" data-testid="packages">
      <div className="q-label">{t('wp.title')} <span className="muted small" data-testid="wp-total">· {t('wp.total', { total: money(M.allowanceTotal(pk)) })}</span></div>
      <ul className="tray">{pk.map((p) => (
        <li key={p.id}>
          <input aria-label={t('wp.trade')} placeholder={t('wp.trade')} value={p.trade} onChange={(e) => set({ packages: listEdit(pk, p.id, { trade: e.target.value }) })} />
          <input aria-label={t('wp.scope')} placeholder={t('wp.scope')} value={p.scope} onChange={(e) => set({ packages: listEdit(pk, p.id, { scope: e.target.value }) })} />
          <input aria-label={t('wp.allowance')} type="number" step="500" min="0" placeholder={t('wp.allowance')} value={p.allowance ?? ''} onChange={(e) => set({ packages: listEdit(pk, p.id, { allowance: num(e.target.value) }) })} />
          <select aria-label={t('wp.supplier')} value={p.supplier} onChange={(e) => set({ packages: listEdit(pk, p.id, { supplier: e.target.value }) })}>{M.SUPPLIERS.map((k) => <option key={k} value={k}>{t(`wp.${k}`)}</option>)}</select>
          <label className="check small"><input type="checkbox" checked={!!p.diy} onChange={(e) => set({ packages: listEdit(pk, p.id, { diy: e.target.checked }) })} />{t('wp.diy')}</label>
          <button className="btn tiny" onClick={() => set({ packages: pk.filter((x) => x.id !== p.id) })}>{t('ed.remove')}</button>
        </li>))}</ul>
      <button className="btn quiet" id="wp-add" onClick={() => set({ packages: [...pk, M.newPackage()] })}>+ {t('wp.add')}</button>
    </div>
  )
}
export function BuilderPrice({ plan, set, bs }) {
  const b = plan.builderPrice || { price: null, date: '' }, c = M.priceCheck(b.price, bs)
  return (
    <div className="item-edit block" data-testid="builder-price">
      <div className="q-label">{t('bp2.title')}</div>
      <div className="add-row">
        <label>{t('bp2.price')}<input id="bp2-price" type="number" step="1000" min="0" value={b.price ?? ''} onChange={(e) => set({ builderPrice: { ...b, price: num(e.target.value) } })} /></label>
        <label>{t('bp2.date')}<input type="date" value={b.date || ''} onChange={(e) => set({ builderPrice: { ...b, date: e.target.value } })} /></label>
      </div>
      {c && <p className={`small ${c.aboveHigh || c.overGoal ? 'warn' : ''}`} data-testid="bp2-check">{t(c.aboveHigh ? 'bp2.above' : c.belowLow ? 'bp2.below' : 'bp2.within', { lo: money(bs.build.lo), hi: money(bs.build.hi) })}{c.overGoal ? ` ${t('bp2.overGoal')}` : ''}</p>}
    </div>
  )
}

// 15.11 Possession walk (Stage 6).
export function Walk({ plan, set, rooms }) {
  const items = plan.walk || []
  const [text, setText] = useState({})
  return (
    <div className="item-edit block" data-testid="walk">
      <div className="q-label">{t('pw.title')} <span className="muted small" data-testid="walk-open">· {t('pw.open', { n: M.openWalkItems(items) })}</span></div>
      {rooms.map((r) => (
        <div key={r.id}><div className="small"><b>{tx(r.name)}</b> · {t('pw.open', { n: M.openWalkItems(items, r.id) })}</div>
          <ul className="tray">{items.filter((i) => i.roomId === r.id).map((i) => (
            <li key={i.id}><span>{i.text}</span><label className="check small"><input type="checkbox" checked={i.fixed} onChange={(e) => set({ walk: listEdit(items, i.id, { fixed: e.target.checked, date: e.target.checked ? new Date().toISOString().slice(0, 10) : null }) })} />{t('pw.fixed')}{i.date ? ` · ${i.date}` : ''}</label></li>))}</ul>
          <div className="add-row"><input aria-label={t('pw.itemPh')} placeholder={t('pw.itemPh')} value={text[r.id] || ''} onChange={(e) => setText({ ...text, [r.id]: e.target.value })} /><button className="btn tiny" disabled={!(text[r.id] || '').trim()} onClick={() => { set({ walk: [...items, M.newWalkItem(r.id, text[r.id].trim())] }); setText({ ...text, [r.id]: '' }) }}>+ {t('pw.add')}</button></div>
        </div>))}
    </div>
  )
}

// 15.6 Design item cards and 15.7 review criteria sheets (Decide tab).
export function ItemCards({ plan, set, rooms }) {
  const cards = plan.itemCards || []
  const put = (id, patch) => set({ itemCards: listEdit(cards, id, patch) })
  return (
    <section className="panel" data-testid="item-cards">
      <h2>{t('ic.title')}</h2>
      <p className="muted small">{t('ic.help')}</p>
      {cards.map((c) => (
        <div key={c.id} className="item-edit block" data-testid={`ic-${c.id}`}>
          <input aria-label={t('ic.item')} placeholder={t('ic.item')} value={c.item} onChange={(e) => put(c.id, { item: e.target.value })} />
          <div className="add-row">
            <input aria-label={t('ic.rules')} placeholder={t('ic.rules')} value={c.rulesLimit} onChange={(e) => put(c.id, { rulesLimit: e.target.value })} />
            <select aria-label={t('ic.code')} value={c.codeId || ''} onChange={(e) => put(c.id, { codeId: e.target.value || null })}><option value="">{t('ic.code')}</option>{CODE_ITEMS.map((x) => <option key={x.id} value={x.id}>{x.clause} {t(`code.${x.id}`).slice(0, 40)}…</option>)}</select>
            <input aria-label={t('ic.physical')} placeholder={t('ic.physical')} value={c.physicalLimit} onChange={(e) => put(c.id, { physicalLimit: e.target.value })} />
          </div>
          <div className="chips">{M.VERDICTS.map((v) => <button key={v} className={`chip ${c.verdict === v ? 'on' : ''}`} onClick={() => put(c.id, { verdict: v })}>{t(`ic.v.${v}`)}</button>)}</div>
          <div className="q-label small">{t('ic.impact')}</div>
          <div className="chips">{rooms.map((r) => <label key={r.id} className="check small"><input type="checkbox" checked={c.impactRoomIds.includes(r.id)} onChange={(e) => put(c.id, { impactRoomIds: e.target.checked ? [...c.impactRoomIds, r.id] : c.impactRoomIds.filter((x) => x !== r.id) })} />{tx(r.name)}</label>)}</div>
          <textarea aria-label={t('ic.proposals')} placeholder={t('ic.proposals')} rows={2} style={{ width: '100%' }} value={(c.proposals || []).join('\n')} onChange={(e) => put(c.id, { proposals: e.target.value.split('\n') })} />
          <div className="chips">
            <button className={`chip ${c.keep === true ? 'on' : ''}`} onClick={() => put(c.id, { keep: true })}>{t('ic.keep')}</button>
            <button className={`chip ${c.keep === false ? 'on' : ''}`} onClick={() => put(c.id, { keep: false })}>{t('ic.delete')}</button>
            <button className="btn tiny" onClick={() => set({ itemCards: cards.filter((x) => x.id !== c.id) })}>{t('ed.remove')}</button>
          </div>
        </div>))}
      <button className="btn" id="ic-add" onClick={() => set({ itemCards: [...cards, M.newItemCard()] })}>+ {t('ic.add')}</button>
    </section>
  )
}
export function Sheets({ plan, set }) {
  const sheets = plan.sheets || []
  const put = (id, patch) => set({ sheets: listEdit(sheets, id, patch) })
  const [crit, setCrit] = useState({}), [opt, setOpt] = useState({})
  return (
    <section className="panel" data-testid="sheets">
      <h2>{t('rs.title')}</h2>
      <p className="muted small">{t('rs.help')}</p>
      {sheets.map((s) => (
        <div key={s.id} className="item-edit block" data-testid={`rs-${s.id}`}>
          <input aria-label={t('rs.context')} placeholder={t('rs.context')} value={s.context} onChange={(e) => put(s.id, { context: e.target.value })} />
          <div className="table-wrap"><table className="rules">
            <thead><tr><th>{t('card2.criterion')}</th><th>{t('rs.weight')}</th><th>{t('rs.gate')}</th>{s.options.map((o) => <th key={o.id}>{o.name}</th>)}</tr></thead>
            <tbody>{s.criteria.map((c) => (
              <tr key={c.id}><td>{c.name}</td>
                <td><input aria-label={t('rs.weight')} type="number" step="1" min="0" value={c.weight ?? ''} onChange={(e) => put(s.id, { criteria: listEdit(s.criteria, c.id, { weight: num(e.target.value) }) })} /></td>
                <td><input type="checkbox" aria-label={t('rs.gate')} checked={!!c.gate} onChange={(e) => put(s.id, { criteria: listEdit(s.criteria, c.id, { gate: e.target.checked }) })} /></td>
                {s.options.map((o) => <td key={o.id}><input aria-label={`${o.name} · ${c.name}`} type="number" step="1" min="0" max="10" value={s.scores[`${o.id}|${c.id}`] ?? ''} onChange={(e) => put(s.id, { scores: { ...s.scores, [`${o.id}|${c.id}`]: num(e.target.value) } })} />{c.gate && <label className="check small"><input type="checkbox" checked={!!s.gateFail[`${o.id}|${c.id}`]} onChange={(e) => put(s.id, { gateFail: { ...s.gateFail, [`${o.id}|${c.id}`]: e.target.checked } })} />{t('rs.fails')}</label>}</td>)}
              </tr>))}
              <tr className="sum"><td><b>{t('rs.total')}</b></td><td /><td />{s.options.map((o) => { const r = M.sheetTotal(s, o.id); return <td key={o.id} data-testid={`rs-total-${o.id}`}><b>{r.failsGate ? t('rs.failsGate') : r.total == null ? '–' : r.total.toFixed(1)}</b></td> })}</tr>
            </tbody>
          </table></div>
          <div className="add-row">
            <input placeholder={t('rs.critPh')} value={crit[s.id] || ''} onChange={(e) => setCrit({ ...crit, [s.id]: e.target.value })} />
            <button className="btn tiny" disabled={!(crit[s.id] || '').trim()} onClick={() => { put(s.id, { criteria: [...s.criteria, { id: P.pid('c'), name: crit[s.id].trim(), weight: 1, gate: false }] }); setCrit({ ...crit, [s.id]: '' }) }}>+ {t('card2.criterionAdd')}</button>
            <input placeholder={t('card2.optionPh')} value={opt[s.id] || ''} onChange={(e) => setOpt({ ...opt, [s.id]: e.target.value })} />
            <button className="btn tiny" disabled={!(opt[s.id] || '').trim()} onClick={() => { put(s.id, { options: [...s.options, { id: P.pid('o'), name: opt[s.id].trim() }] }); setOpt({ ...opt, [s.id]: '' }) }}>+ {t('card2.option')}</button>
          </div>
          <div className="add-row">
            <input aria-label={t('rs.conditions')} placeholder={t('rs.conditions')} value={s.conditions} onChange={(e) => put(s.id, { conditions: e.target.value })} />
            <label className="small">{t('rs.cost')}<input type="number" step="1" min="0" max="10" value={s.costScore ?? ''} onChange={(e) => put(s.id, { costScore: num(e.target.value) })} /></label>
            <button className="btn tiny" onClick={() => set({ sheets: sheets.filter((x) => x.id !== s.id) })}>{t('ed.remove')}</button>
          </div>
        </div>))}
      <button className="btn" id="rs-add" onClick={() => set({ sheets: [...sheets, M.newSheet()] })}>+ {t('rs.add')}</button>
    </section>
  )
}

// 15.12 Lego soft checks (Lot board): warnings only, each can be turned off.
export function LegoChecks({ plan, set, rooms, st, level }) {
  const off = plan.lego?.off || {}
  const toggle = (k) => set({ lego: { ...(plan.lego || {}), off: { ...off, [k]: !off[k] } } })
  const lonely = M.lonelyWetRooms(rooms, st), shape = M.shapeStats(rooms, st, level), unmarked = M.unmarkedRooms(rooms)
  const name = (id) => tx(rooms.find((r) => r.id === id)?.name)
  const Row = ({ k, children }) => (
    <li data-testid={`lego-${k}`}><label className="check small"><input type="checkbox" checked={!off[k]} onChange={() => toggle(k)} />{t(`lego.${k}`)}</label>{!off[k] && <span className="small">{children}</span>}</li>
  )
  return (
    <div className="item-edit block" data-testid="lego">
      <div className="q-label">{t('lego.title')}</div>
      <ul className="tray">
        <Row k="wet">{lonely.length ? <span className="warn">{t('lego.wetAlone', { list: lonely.map(name).join(t('list.sep')) })}</span> : t('lego.ok')}</Row>
        <Row k="hall">{shape ? t('lego.hallPct', { pct: shape.hallPct.toFixed(1), target: shape.target }) : t('lego.none')}</Row>
        <Row k="shape">{shape ? t('lego.fillPct', { pct: shape.fillPct.toFixed(1) }) : t('lego.none')}</Row>
        <Row k="phase">{unmarked.length ? <span className="warn">{t('lego.unmarked', { list: unmarked.map(name).join(t('list.sep')) })}</span> : t('lego.ok')}</Row>
      </ul>
      <p className="muted small">{t('lego.note')}</p>
    </div>
  )
}
