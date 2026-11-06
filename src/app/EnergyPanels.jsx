// SPEC §16 (reduced batch E): the 9.36 energy tier reference with a target-tier pick (Stage 2), and the 30-year
// cost calculator (Decide tab). No built-in life spans or price rise: the owner types them.
import * as E from '../plan/energy.js'
import { pid } from '../plan/plan.js'
import { ruleValues } from '../rules.js'
import { t } from '../i18n.js'

const money = (n) => (Number.isFinite(n) ? `C$${Math.round(n).toLocaleString('en-CA')}` : '–')
const num = (v) => (v === '' || v == null ? null : Number.isFinite(Number(v)) ? Number(v) : null)
const pct = (v) => (v == null ? '–' : `${v}%`)

export function EnergyTier({ plan, set }) {
  const en = { targetTier: null, path: 'performance', size: 'over300', ...(plan.energy || {}) }
  const put = (patch) => set({ energy: { ...en, ...patch } })
  return (
    <div className="item-edit block" data-testid="energy-tier">
      <div className="q-label">{t('en.title')} <a className="small" href={E.TIER_SOURCE} target="_blank" rel="noreferrer">{t('code.link')}</a></div>
      <div className="chips">{['performance', 'prescriptive'].map((k) => <button key={k} className={`chip ${en.path === k ? 'on' : ''}`} onClick={() => put({ path: k })}>{t(`en.path.${k}`)}</button>)}
        {en.path === 'performance' && ['over300', 'upTo300'].map((k) => <button key={k} className={`chip ${en.size === k ? 'on' : ''}`} onClick={() => put({ size: k })}>{t(`en.size.${k}`)}</button>)}</div>
      <div className="table-wrap"><table className="rules">
        <thead><tr><th>{t('en.tier')}</th>{en.path === 'performance' ? <><th>{t('en.heatLoss')}</th><th>{t('en.improve')}</th><th>{t('en.target')}</th></> : <th>{t('en.points')}</th>}<th>{t('en.pick')}</th></tr></thead>
        <tbody>{(en.path === 'performance' ? E.PERFORMANCE[en.size] : E.PRESCRIPTIVE).map((r) => (
          <tr key={r.tier} data-testid={`tier-${r.tier}`}><td>{r.tier}</td>
            {en.path === 'performance' ? <><td>{r.heatLoss == null ? t('en.na') : `≥ ${r.heatLoss}%`}</td><td>≥ {pct(r.improve)}</td><td>≤ {pct(r.target)}</td></> : <td>{r.points == null ? t('en.reserved') : r.points}</td>}
            <td><button className={`chip ${en.targetTier === r.tier ? 'on' : ''}`} disabled={en.path === 'prescriptive' && r.points == null} onClick={() => put({ targetTier: r.tier })}>{t('en.choose')}</button></td></tr>))}</tbody>
      </table></div>
      <p className="muted small">{t('en.note')}</p>
    </div>
  )
}

export function Lifecycle({ plan, set, rules }) {
  const R = ruleValues(rules)
  const l = { kWh: null, gasGJ: null, gasRow: 'gasAtco', escalationPct: null, items: [], ...(plan.life || {}) }
  const put = (patch) => set({ life: { ...l, ...patch } })
  const r = E.lifecycle({ kWh: l.kWh, elecCents: R.elecRate, gasGJ: l.gasGJ, gasRate: R[l.gasRow], escalationPct: l.escalationPct, items: l.items })
  const setItem = (id, patch) => put({ items: l.items.map((x) => (x.id === id ? { ...x, ...patch } : x)) })
  return (
    <section className="panel" data-testid="lifecycle">
      <h2>{t('lc2.title')}</h2>
      <p className="muted small">{t('lc2.help', { elec: R.elecRate })}</p>
      <div className="add-row">
        <label>{t('lc2.kWh')}<input id="lc2-kwh" type="number" step="100" min="0" value={l.kWh ?? ''} onChange={(e) => put({ kWh: num(e.target.value) })} /></label>
        <label>{t('lc2.gj')}<input id="lc2-gj" type="number" step="1" min="0" value={l.gasGJ ?? ''} onChange={(e) => put({ gasGJ: num(e.target.value) })} /></label>
        <label>{t('lc2.gasRow')}<select value={l.gasRow} onChange={(e) => put({ gasRow: e.target.value })}><option value="gasAtco">ATCO Gas ({R.gasAtco} $/GJ)</option><option value="gasApex">Apex Utilities ({R.gasApex} $/GJ)</option></select></label>
        <label>{t('lc2.esc')}<input id="lc2-esc" type="number" step="0.1" value={l.escalationPct ?? ''} onChange={(e) => put({ escalationPct: num(e.target.value) })} /></label>
      </div>
      <ul className="tray">{l.items.map((it) => (
        <li key={it.id}>
          <input aria-label={t('lc2.item')} placeholder={t('lc2.item')} value={it.name || ''} onChange={(e) => setItem(it.id, { name: e.target.value })} />
          <input aria-label={t('lc2.cost')} type="number" step="100" min="0" placeholder={t('lc2.cost')} value={it.cost ?? ''} onChange={(e) => setItem(it.id, { cost: num(e.target.value) })} />
          <input aria-label={t('lc2.life')} type="number" step="1" min="1" placeholder={t('lc2.life')} value={it.life ?? ''} onChange={(e) => setItem(it.id, { life: num(e.target.value) })} />
          {r.missing.includes(it.id) && <span className="tag warn">{t('lc2.missing')}</span>}
          <button className="btn tiny" onClick={() => put({ items: l.items.filter((x) => x.id !== it.id) })}>{t('ed.remove')}</button>
        </li>))}</ul>
      <button className="btn quiet" id="lc2-add" onClick={() => put({ items: [...l.items, { id: pid('lc'), name: '', cost: null, life: null }] })}>+ {t('lc2.add')}</button>
      <table className="rules"><tbody>
        <tr><td>{t('lc2.energyYear')}</td><td data-testid="lc2-energy-year">{money(r.energyYear)}</td></tr>
        <tr><td>{t('lc2.energy30')}</td><td>{money(r.energy)}</td></tr>
        <tr><td>{t('lc2.replace')}</td><td>{money(r.replace)}</td></tr>
        <tr className="sum"><td><b>{t('lc2.total')}</b></td><td data-testid="lc2-total"><b>{money(r.total)}</b></td></tr>
      </tbody></table>
      {r.escalationMissing && <p className="small warn" data-testid="lc2-no-esc">{t('lc2.noEsc')}</p>}
      <p className="muted small">{t('lc2.note')}</p>
    </section>
  )
}
