// Liked floor plans with "why I like it" (SPEC §13.2), shown under Plan intake. A reason can go to the plan
// checklist, whose items are open, met or dropped and can name a room. A picture of a liked plan stays on the
// device that holds it (as chat-D27); here the plan keeps its name, where it came from and the reasons.
import { useState } from 'react'
import * as P from '../plan/plan.js'
import { t, tx } from '../i18n.js'

export default function LikedPlans({ plan, onPlan, rooms }) {
  const set = (patch) => onPlan({ ...plan, ...patch })
  const [name, setName] = useState(''), [reason, setReason] = useState({})
  const setLp = (id, patch) => set({ likedPlans: plan.likedPlans.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
  return (
    <section className="panel liked" data-testid="liked-plans">
      <h2>{t('lp.title')}</h2>
      <p className="muted small">{t('lp.help')}</p>
      <div className="add-row">
        <input id="lp-name" placeholder={t('lp.namePh')} value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn" id="lp-add" disabled={!name.trim()} onClick={() => { set({ likedPlans: [...plan.likedPlans, P.newLikedPlan(name.trim())] }); setName('') }}>{t('lp.add')}</button>
      </div>
      {plan.likedPlans.map((lp) => (
        <div key={lp.id} className="item-edit" data-testid={`lp-${lp.id}`}>
          <div className="add-row"><b>{lp.name}</b>
            <input aria-label={t('lp.source')} placeholder={t('lp.source')} value={lp.source} onChange={(e) => setLp(lp.id, { source: e.target.value })} />
            <button className="btn tiny" onClick={() => set({ likedPlans: plan.likedPlans.filter((x) => x.id !== lp.id) })}>{t('ed.remove')}</button>
          </div>
          <ul className="tray">{lp.reasons.map((r) => (
            <li key={r.id}><span>{r.text}</span>{r.toChecklist ? <span className="tag pass">{t('lp.onList')}</span> : <button className="btn tiny" onClick={() => set(P.sendToChecklist(plan.likedPlans, plan.checklist, lp.id, r.id))}>{t('lp.send')}</button>}</li>
          ))}</ul>
          <div className="add-row">
            <input placeholder={t('lp.reasonPh')} value={reason[lp.id] || ''} onChange={(e) => setReason({ ...reason, [lp.id]: e.target.value })} />
            <button className="btn tiny" disabled={!(reason[lp.id] || '').trim()} onClick={() => { setLp(lp.id, P.addReason(lp, reason[lp.id].trim())); setReason({ ...reason, [lp.id]: '' }) }}>+ {t('lp.reason')}</button>
          </div>
        </div>
      ))}
      <h3>{t('lp.checklistH')}</h3>
      {plan.checklist.length === 0 ? <p className="muted small">{t('lp.checklistNone')}</p> : (
        <ul className="tray" data-testid="plan-checklist">{plan.checklist.map((c) => (
          <li key={c.id}><span>{c.text} <span className="muted small">· {c.planName}</span></span>
            <span className="chips">{P.CHECK_STATUS.map((s) => <button key={s} className={`chip ${c.status === s ? 'on' : ''}`} onClick={() => set({ checklist: plan.checklist.map((x) => (x.id === c.id ? { ...x, status: s } : x)) })}>{t(`ck.${s}`)}</button>)}</span>
            <select aria-label={t('lp.room')} value={c.roomId || ''} onChange={(e) => set({ checklist: plan.checklist.map((x) => (x.id === c.id ? { ...x, roomId: e.target.value || null } : x)) })}><option value="">{t('lp.room')}</option>{rooms.map((r) => <option key={r.id} value={r.id}>{tx(r.name)}</option>)}</select>
          </li>))}</ul>
      )}
    </section>
  )
}
