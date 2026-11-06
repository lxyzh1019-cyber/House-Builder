// Budget meter (SPEC §8): every line typed by the user, nothing hidden. Build rates are the Rules table
// rows (changed here or there, one number). Area = rooms placed on the Lot board.
import { budgetState, bid, newBudget } from '../budget/budget.js'
import { RULES } from '../rules.js'
import { t, tlist, tx } from '../i18n.js'

const money = (n) => (Number.isFinite(n) ? `${n < 0 ? '−' : ''}C$${Math.round(Math.abs(n)).toLocaleString('en-CA')}` : '–')
const range = (r) => (Math.round(r.lo) === Math.round(r.hi) ? money(r.lo) : `${money(r.lo)} – ${money(r.hi)}`)
const parse = (v) => (v === '' || v === null ? null : Number.isFinite(Number(v)) ? Number(v) : null)
const RATE = Object.fromEntries(RULES.filter((r) => r.id === 'rateLow' || r.id === 'rateHigh').map((r) => [r.id, r.value]))

export default function Budget({ budget, rooms, st, rules, onBudget, onRules }) {
  const b = { ...newBudget(), ...(budget || {}) }
  const s = budgetState(b, rooms, st, rules)
  const set = (patch) => onBudget({ ...b, ...patch })
  const setSoft = (id, patch) => set({ soft: b.soft.map((x) => (x.id === id ? { ...x, ...patch } : x)) })
  const setRate = (id, v) => { const next = { ...rules }; const n = parse(v); if (n === null) delete next[id]; else next[id] = n; onRules(next) }
  const name = (id) => tx(rooms.find((r) => r.id === id)?.name)
  const scale = Math.max(b.goal || 0, s.total.hi, 1) * 1.05 // room past the end so the goal mark shows
  const pctOf = (x) => `${Math.max(0, Math.min(100, (x / scale) * 100))}%`
  return (
    <main className="lot budget">
      <section className="panel lot-side">
        <h2>{t('bud.title')}</h2>
        <p className="muted small">{t('bud.help')}</p>
        <div className="lot-inputs">
          <label>{t('bud.goal')}<input id="bud-goal" type="number" step="1000" min="0" value={b.goal ?? ''} onChange={(e) => set({ goal: parse(e.target.value) })} /></label>
          <label>{t('bud.lot')}<input id="bud-lot" type="number" step="1000" min="0" value={b.lotPrice ?? ''} onChange={(e) => set({ lotPrice: parse(e.target.value) })} /></label>
        </div>
        <label className="check"><input id="bud-lot-in" type="checkbox" checked={b.lotInGoal !== false} onChange={(e) => set({ lotInGoal: e.target.checked })} />{t('bud.lotIn')}</label>

        <h3>{t('bud.softH')}</h3>
        {b.soft.length === 0 && <p className="muted small">{t('bud.softNone')}</p>}
        <ul className="tray soft">
          {b.soft.map((x) => (
            <li key={x.id}>
              <input aria-label={t('bud.softName')} placeholder={t('bud.softName')} value={x.name} onChange={(e) => setSoft(x.id, { name: e.target.value })} />
              <input aria-label={t('bud.softAmount')} type="number" step="500" min="0" value={x.amount ?? ''} onChange={(e) => setSoft(x.id, { amount: parse(e.target.value) })} />
              <button className="btn tiny" aria-label={t('bud.softRemove', { name: x.name })} onClick={() => set({ soft: b.soft.filter((y) => y.id !== x.id) })}>{t('ed.remove')}</button>
            </li>
          ))}
        </ul>
        <button className="btn quiet" id="bud-add-soft" onClick={() => set({ soft: [...b.soft, { id: bid(), name: '', amount: null }] })}>+ {t('bud.softAdd')}</button>

        <h3>{t('bud.contH')}</h3>
        <label>{t('bud.cont')}<input id="bud-cont" type="number" step="1" min="0" max="100" value={b.contingencyPct ?? ''} onChange={(e) => set({ contingencyPct: parse(e.target.value) })} /></label>
        <p className="muted small">{t('bud.contHelp')}</p>

        <h3>{t('bud.rateH')}</h3>
        <div className="lot-inputs">
          <label>{t('bud.rateLow')}<input id="bud-rate-lo" type="number" step="5" min="0" value={rules.rateLow ?? RATE.rateLow} onChange={(e) => setRate('rateLow', e.target.value)} /></label>
          <label>{t('bud.rateHigh')}<input id="bud-rate-hi" type="number" step="5" min="0" value={rules.rateHigh ?? RATE.rateHigh} onChange={(e) => setRate('rateHigh', e.target.value)} /></label>
        </div>
        <p className="muted small">{t('bud.rateHelp')}</p>
      </section>

      <section className="panel lot-board">
        <h2>{t('bud.sumH')}</h2>
        <table className="rules bud-table" data-testid="bud-table">
          <tbody>
            <tr><td>{t('bud.area', { n: s.counted.length })}</td><td data-testid="bud-area">{s.area.toFixed(1)} ft²</td></tr>
            <tr><td>{t('bud.build', { lo: s.rates.lo, hi: s.rates.hi })}</td><td data-testid="bud-build">{range(s.build)}</td></tr>
            <tr><td>{t('bud.contRow', { pct: b.contingencyPct ?? 0 })}</td><td>{range(s.cont)}</td></tr>
            <tr><td>{t('bud.softRow', { n: b.soft.length })}</td><td>{money(s.soft)}</td></tr>
            <tr><td>{b.lotInGoal !== false ? t('bud.lotRow') : t('bud.lotOut')}</td><td>{b.lotInGoal !== false ? money(s.lot) : '–'}</td></tr>
            <tr className="sum"><td><b>{t('bud.total')}</b></td><td data-testid="bud-total"><b>{range(s.total)}</b></td></tr>
            <tr className="sum"><td><b>{t('bud.goalRow')}</b></td><td>{money(b.goal)}</td></tr>
            <tr className="sum"><td><b>{t('bud.left')}</b></td><td data-testid="bud-left" className={s.over ? 'warn' : ''}><b>{s.left ? range(s.left) : t('bud.noGoal')}</b></td></tr>
          </tbody>
        </table>
        {s.left && <div className={`result ${s.over ? 'bad' : 'ok'}`} data-testid="bud-verdict">{t(s.overAtLow ? 'bud.overLow' : s.over ? 'bud.overHigh' : 'bud.ok', { lo: money(s.left.lo), hi: money(s.left.hi), shortLo: money(-s.left.lo), shortHi: money(-s.left.hi) })}</div>}
        <div className="bud-bar" role="img" aria-label={t('bud.barAria', { goal: money(b.goal), lo: money(s.total.lo), hi: money(s.total.hi) })}>
          <span className="lo" style={{ width: pctOf(s.total.lo) }} />
          <span className="hi" style={{ left: pctOf(s.total.lo), width: `calc(${pctOf(s.total.hi)} - ${pctOf(s.total.lo)})` }} />
          {Number.isFinite(b.goal) && <span className="goal" style={{ left: pctOf(b.goal) }} />}
        </div>
        <div className="legend"><span className="sw bud-lo" /> {t('bud.legLo')} <span className="sw bud-hi" /> {t('bud.legHi')} <span className="sw bud-goal" /> {t('bud.legGoal')}</div>
        {s.notCounted.length > 0 && <p className="muted small" data-testid="bud-not-counted">{t('bud.notCounted', { names: tlist(s.notCounted.map(name)) })}</p>}
        <p className="muted small">{t('bud.privacy')}</p>
      </section>
    </main>
  )
}
