// Stages (SPEC §13.1, §13.7, §13.8): the 7 stages and 19 gates of SPEC §1, hidden works under the stages they
// are decided and built in, and build tracking (change orders, stage cost, photo record before drywall).
import { useState } from 'react'
import * as P from '../plan/plan.js'
import { budgetState } from '../budget/budget.js'
import { t, tx } from '../i18n.js'
import { CodeChecklist, Money, Permits, Warranty } from './AlbertaPanels.jsx'
import { BuilderPrice, LotChecklist, Packages, Pains, Pictures, Sprints, StageEffort, StepOwner, Systems, Walk } from './BatchD.jsx'

const money = (n) => (Number.isFinite(n) ? `${n < 0 ? '−' : ''}C$${Math.round(Math.abs(n)).toLocaleString('en-CA')}` : '–')
const num = (v) => (v === '' || v == null ? null : Number.isFinite(Number(v)) ? Number(v) : null)

export default function StagesTab({ plan, onPlan, rooms, budget, st, rules, by, onGoal, household = [], versions = [], onVersions, design }) {
  const set = (patch) => onPlan({ ...plan, ...patch })
  const build = { ...P.newBuild(), ...(plan.build || {}) }
  const setBuild = (patch) => set({ build: { ...build, ...patch } })
  const bs = budgetState(budget, rooms, st, rules, build.changeOrders)
  const [hw, setHw] = useState(P.newHidden())
  const roomName = (id) => tx(rooms.find((r) => r.id === id)?.name) || t('stg.noRoom')
  const setHidden = (id, patch) => set({ hiddenWorks: plan.hiddenWorks.map((h) => (h.id === id ? { ...h, ...patch } : h)) })
  const setCO = (id, patch) => setBuild({ changeOrders: build.changeOrders.map((c) => (c.id === id ? { ...c, ...patch } : c)) })

  return (
    <main className="panel stages" data-testid="stages-tab">
      <h2>{t('stg.title')}</h2>
      <p className="muted small">{t('stg.help')}</p>

      <section>
        <h3>{t('hw.addH')}</h3>
        <div className="add-row">
          <select aria-label={t('hw.kind')} value={hw.kind} onChange={(e) => setHw({ ...hw, kind: e.target.value })}>{P.HIDDEN_KINDS.map((k) => <option key={k} value={k}>{t(`hw.kind.${k}`)}</option>)}</select>
          <input id="hw-text" placeholder={t('hw.textPh')} value={hw.text} onChange={(e) => setHw({ ...hw, text: e.target.value })} />
          <select aria-label={t('hw.room')} value={hw.roomId || ''} onChange={(e) => setHw({ ...hw, roomId: e.target.value || null })}><option value="">{t('stg.noRoom')}</option>{rooms.map((r) => <option key={r.id} value={r.id}>{tx(r.name)}</option>)}</select>
          <label className="small">{t('hw.decide')}<select value={hw.decideStage} onChange={(e) => setHw({ ...hw, decideStage: Number(e.target.value) })}>{P.STAGES.map((s) => <option key={s.n} value={s.n}>{s.n}</option>)}</select></label>
          <label className="small">{t('hw.build')}<select value={hw.buildStage} onChange={(e) => setHw({ ...hw, buildStage: Number(e.target.value) })}>{P.STAGES.map((s) => <option key={s.n} value={s.n}>{s.n}</option>)}</select></label>
          <button className="btn" id="hw-add" disabled={!hw.text.trim()} onClick={() => { set({ hiddenWorks: [...plan.hiddenWorks, { ...hw, text: hw.text.trim() }] }); setHw(P.newHidden()) }}>{t('hw.add')}</button>
        </div>
      </section>

      {P.STAGES.map((stage) => {
        const done = P.stageDone(plan.schedule, stage)
        const hidden = P.hiddenInStage(plan.hiddenWorks, stage.n)
        const cost = P.stageDiff(build, stage.n)
        return (
          <section key={stage.n} className={`stage ${done ? 'done' : ''}`} data-testid={`stage-${stage.n}`}>
            <h3>{t('stg.stage', { n: stage.n })} · {t(`stage.${stage.n}`)} {done && <span className="tag pass">{t('stg.done')}</span>}<StageEffort plan={plan} gates={stage.gates} /></h3>
            {stage.gates.length === 0 && <p className="muted small">{t('stg.noGates')}</p>}
            <ul className="tray">
              {stage.gates.map((id) => {
                const g = P.gateOf(plan.schedule, id)
                return (
                  <li key={id} data-testid={`gate-${id}`}>
                    <span><b>{id}</b> {t(`gate.${id}`)}{g.at ? <span className="muted small"> · {g.at.slice(0, 10)} · {g.by}</span> : null}</span>
                    <span className="chips">{P.GATE_STATUS.map((s) => <button key={s} className={`chip ${g.status === s ? 'on' : ''}`} onClick={() => set({ schedule: P.setGate(plan.schedule, id, s, by) })}>{t(`gate.st.${s}`)}</button>)}</span>
                    {id === 'D5' && <div className="small" data-testid="d5-verdict">{t(`d5.${P.d5Verdict(bs)}`)}</div>}
                    {id === 'D21' && <div className="small" data-testid="d21-info">{t('d21.photos', { n: P.photoCount(build, rooms), of: rooms.length })}{P.notPhotographed(plan.hiddenWorks).length > 0 && <> · {t('d21.hidden', { list: P.notPhotographed(plan.hiddenWorks).map((h) => h.text).join(t('list.sep')) })}</>}</div>}
                    <input className="small" aria-label={t('gate.note', { id })} placeholder={t('gate.notePh')} value={g.note || ''} onChange={(e) => set({ schedule: { ...plan.schedule, gates: { ...plan.schedule.gates, [id]: { ...g, note: e.target.value } } } })} />
                    <StepOwner plan={plan} set={set} id={id} household={household} />
                  </li>
                )
              })}
            </ul>
            {stage.n === 0 && <LotChecklist plan={plan} set={set} />}
            {stage.n === 1 && <><Pains plan={plan} set={set} rooms={rooms} by={by} /><Pictures plan={plan} set={set} rooms={rooms} /></>}
            {stage.n === 2 && <><Sprints plan={plan} set={set} rooms={rooms} st={st} versions={versions} onVersions={onVersions} design={design} by={by} /><Systems plan={plan} set={set} /></>}
            {stage.n === 3 && <CodeChecklist plan={plan} set={set} rooms={rooms} />}
            {stage.n === 4 && <><Permits plan={plan} set={set} /><Money plan={plan} set={set} onGoal={onGoal} /><Packages plan={plan} set={set} /><BuilderPrice plan={plan} set={set} bs={bs} /></>}
            {stage.n === 6 && <><Walk plan={plan} set={set} rooms={rooms} /><Warranty plan={plan} set={set} /></>}
            {stage.n === 2 && plan.checklist.length > 0 && <p className="small">{t('stg.checklist', { met: plan.checklist.filter((c) => c.status === 'met').length, n: plan.checklist.length })}</p>}
            {hidden.length > 0 && <>
              <div className="q-label small">{t('hw.inStage')}</div>
              <ul className="tray">{hidden.map((h) => (
                <li key={h.id} data-testid={`hw-${h.id}`}><span>{t(`hw.kind.${h.kind}`)}: {h.text} · {roomName(h.roomId)} · {Number(h.decideStage) === stage.n ? t('hw.decidedHere') : t('hw.builtHere')}</span>
                  <label className="check small"><input type="checkbox" checked={!!h.photographed} onChange={(e) => setHidden(h.id, { photographed: e.target.checked })} />{t('hw.photographed')}</label>
                  <button className="btn tiny" onClick={() => set({ hiddenWorks: plan.hiddenWorks.filter((x) => x.id !== h.id) })}>{t('ed.remove')}</button>
                </li>))}</ul>
            </>}
            <div className="add-row small">
              <label>{t('cost.planned')}<input type="number" step="1000" value={cost.planned ?? ''} onChange={(e) => setBuild({ stageCost: { ...build.stageCost, [stage.n]: { ...(build.stageCost[stage.n] || {}), planned: num(e.target.value) } } })} /></label>
              <label>{t('cost.actual')}<input type="number" step="1000" value={cost.actual ?? ''} onChange={(e) => setBuild({ stageCost: { ...build.stageCost, [stage.n]: { ...(build.stageCost[stage.n] || {}), actual: num(e.target.value) } } })} /></label>
              {cost.diff != null && <span data-testid={`cost-diff-${stage.n}`} className={cost.diff > 0 ? 'warn' : ''}>{t('cost.diff', { d: `${cost.diff > 0 ? '+' : ''}${money(cost.diff)}` })}</span>}
            </div>
            {stage.n === 5 && <>
              <h3>{t('co.h')}</h3>
              <p className="muted small">{t('co.help', { total: money(bs.co) })}</p>
              <ul className="tray">{build.changeOrders.map((c) => (
                <li key={c.id}>
                  <input aria-label={t('co.text')} placeholder={t('co.text')} value={c.text} onChange={(e) => setCO(c.id, { text: e.target.value })} />
                  <input aria-label={t('co.amount')} type="number" step="500" value={c.amount ?? ''} onChange={(e) => setCO(c.id, { amount: num(e.target.value) })} />
                  <label className="check small"><input type="checkbox" checked={!!c.approved} onChange={(e) => setCO(c.id, { approved: e.target.checked })} />{t('co.approved')}</label>
                  <button className="btn tiny" onClick={() => setBuild({ changeOrders: build.changeOrders.filter((x) => x.id !== c.id) })}>{t('ed.remove')}</button>
                </li>))}</ul>
              <button className="btn quiet" id="co-add" onClick={() => setBuild({ changeOrders: [...build.changeOrders, P.newChangeOrder()] })}>+ {t('co.add')}</button>
              <div className="small" data-testid="co-verdict">{t(`d5.${P.d5Verdict(bs)}`)}</div>
              <h3>{t('photo.h')}</h3>
              <ul className="tray">{rooms.map((r) => { const ph = build.photos[r.id] || {}; return (
                <li key={r.id}><span>{tx(r.name)}</span>
                  <label className="check small"><input type="checkbox" checked={!!ph.done} onChange={(e) => setBuild({ photos: { ...build.photos, [r.id]: { ...ph, done: e.target.checked, date: e.target.checked ? new Date().toISOString().slice(0, 10) : null } } })} />{t('photo.done')}{ph.date ? ` · ${ph.date}` : ''}</label>
                  <input aria-label={t('photo.where')} placeholder={t('photo.where')} value={ph.where || ''} onChange={(e) => setBuild({ photos: { ...build.photos, [r.id]: { ...ph, where: e.target.value } } })} />
                </li>) })}</ul>
            </>}
          </section>
        )
      })}
    </main>
  )
}
