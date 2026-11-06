// Batch C (SPEC §14) panels shown inside the Stages tab: the final rules checklist (Stage 3, gate D7), Red Deer
// permits (Stage 4, gates D10–D12), money (Stage 4, gate D19) and warranty walks (Stage 6). Facts checked 2026-11-06.
import * as A from '../plan/alberta.js'
import { t, tx } from '../i18n.js'

const money = (n) => (Number.isFinite(n) ? `${n < 0 ? '−' : ''}C$${Math.round(Math.abs(n)).toLocaleString('en-CA')}` : '–')
const num = (v) => (v === '' || v == null ? null : Number.isFinite(Number(v)) ? Number(v) : null)
const Src = ({ href, k = 'ab.source' }) => <a className="small" href={href} target="_blank" rel="noreferrer">{t(k)}</a>

export function CodeChecklist({ plan, set, rooms }) {
  const sleep = A.egressRooms(rooms)
  return (
    <div className="item-edit block" data-testid="code-checklist">
      <div className="q-label">{t('code.title')} <Src href={A.SRC.code} k="code.link" /></div>
      <ul className="tray">{A.CODE_ITEMS.map((c) => (
        <li key={c.id} data-testid={`code-${c.id}`}><span><b>{c.clause}</b> {t(`code.${c.id}`)}{c.id === 'egress' && sleep.length > 0 && <span className="tag warn"> {t('code.egressRooms', { list: sleep.map((r) => tx(r.name)).join(t('list.sep')) })}</span>}</span>
          <span className="chips">{A.CHECK_STATES.map((s) => <button key={s} className={`chip ${(plan.code?.[c.id] || 'open') === s ? 'on' : ''}`} onClick={() => set({ code: { ...(plan.code || {}), [c.id]: s } })}>{t(`code.st.${s}`)}</button>)}</span>
        </li>))}</ul>
      <p className="muted small">{t('code.note', { date: A.CHECKED })}</p>
    </div>
  )
}

export function Permits({ plan, set }) {
  const st = plan.permits || {}, docs = plan.docs || {}
  const blocked = A.bpBlocked(st)
  return (
    <div className="item-edit block" data-testid="permits">
      <div className="q-label">{t('pm.title')} <Src href={A.SRC.permits} /></div>
      <p className="muted small">{t('pm.help')}</p>
      <ul className="tray">{A.PERMITS.map((k) => (
        <li key={k} data-testid={`permit-${k}`}><span>{t(`pm.${k}`)}{k === 'bp' && blocked && <span className="tag warn" data-testid="bp-blocked"> {t('pm.bpRule')}</span>}</span>
          <span className="chips">{A.PERMIT_STATES.map((s) => <button key={s} className={`chip ${(st[k] || 'todo') === s ? 'on' : ''}`} onClick={() => set({ permits: { ...st, [k]: s } })}>{t(`pm.st.${s}`)}</button>)}</span>
        </li>))}</ul>
      {[['dp', A.DP_DOCS, A.SRC.dpList], ['bp', A.BP_DOCS, A.SRC.bpList]].map(([p, list, href]) => (
        <div key={p}><div className="q-label small">{t(`pm.docs.${p}`)} <Src href={href} k="pm.list" /></div>
          <div className="chips">{list.map((d) => { const id = `${p}.${d}`; return <label key={id} className="check small"><input type="checkbox" checked={!!docs[id]} onChange={(e) => set({ docs: { ...docs, [id]: e.target.checked } })} />{t(`doc.${p}.${d}`)}</label> })}</div>
        </div>))}
      <p className="muted small">{t('pm.timing')} <Src href={A.SRC.fees} k="pm.fees" /></p>
    </div>
  )
}

export function Money({ plan, set, onGoal }) {
  const m = { preapproval: null, loan: null, draws: {}, ...(plan.money || {}) }
  const setM = (patch) => set({ money: { ...m, ...patch } })
  const d = A.drawCheck(m)
  return (
    <div className="item-edit block" data-testid="money">
      <div className="q-label">{t('mn.title')} <Src href={A.SRC.cmhc} k="mn.cmhc" /></div>
      <div className="add-row">
        <label>{t('mn.pre')}<input id="mn-pre" type="number" step="1000" min="0" value={m.preapproval ?? ''} onChange={(e) => setM({ preapproval: num(e.target.value) })} /></label>
        <button className="btn" id="mn-goal" disabled={!Number.isFinite(m.preapproval)} onClick={() => onGoal(m.preapproval)}>{t('mn.useGoal')}</button>
        <label>{t('mn.loan')}<input id="mn-loan" type="number" step="1000" min="0" value={m.loan ?? ''} onChange={(e) => setM({ loan: num(e.target.value) })} /></label>
      </div>
      <div className="add-row small">{[2, 3, 4, 5, 6].map((n) => <label key={n}>{t('mn.draw', { n })}<input type="number" step="1000" min="0" value={m.draws?.[n] ?? ''} onChange={(e) => setM({ draws: { ...m.draws, [n]: num(e.target.value) } })} /></label>)}</div>
      {d.loan != null && <div className={`small ${d.ok ? '' : 'warn'}`} data-testid="draw-check">{d.ok ? t('mn.drawOk', { sum: money(d.sum) }) : t('mn.drawOff', { sum: money(d.sum), loan: money(d.loan), diff: money(d.diff) })}</div>}
      <p className="muted small">{t('mn.notes')}</p>
    </div>
  )
}

export function Warranty({ plan, set }) {
  const walks = A.warrantyWalks(plan.possession)
  return (
    <div className="item-edit block" data-testid="warranty">
      <div className="q-label">{t('wr.title')} <Src href={A.SRC.warranty} /></div>
      <label className="small">{t('wr.possession')}<input id="wr-date" type="date" value={plan.possession || ''} onChange={(e) => set({ possession: e.target.value })} /></label>
      {walks.length > 0 && <ul className="tray" data-testid="warranty-walks">{walks.map((w) => <li key={w.years}><span><b>{w.date}</b> · {t('wr.walk', { n: w.years })} · {t(`wr.${w.key}`)}</span></li>)}</ul>}
      <p className="muted small">{t('wr.help')} <Src href={A.SRC.registry} k="wr.registry" /></p>
    </div>
  )
}

// 14.3 inside the Lot board's site review.
export function FillRL({ lot, onLot }) {
  return (
    <div className="add-row small" data-testid="fill-rl">
      <button className="btn quiet" id="fill-rl" onClick={() => onLot(A.fillFromRL(lot))}>{t('rl.fill')}</button>
      <span className="muted">{t('rl.note')} <Src href={A.SRC.map} k="rl.map" /> · <Src href={A.SRC.bylaw} k="rl.bylaw" /></span>
    </div>
  )
}
