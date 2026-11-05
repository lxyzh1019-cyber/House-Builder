// R12: the rules table. Every row shows value, unit, source, evidence tag and date; a row older than
// 2 years is flagged. Values can be changed for this project (saved with the project).
import { RULES, needsRefresh } from '../rules.js'
import { t, tx } from '../i18n.js'

export default function RulesTable({ overrides, onChange }) {
  const setVal = (id, v) => {
    const next = { ...overrides }
    if (v === '' || v === null) delete next[id]
    else next[id] = Number(v)
    onChange(next)
  }
  return (
    <section className="panel">
      <h2>{t('rules.title')}</h2>
      <p className="muted">{t('rules.help')}</p>
      <div className="table-wrap">
        <table className="rules">
          <thead><tr>{['rule', 'value', 'unit', 'tag', 'source', 'date'].map((k) => <th key={k}>{t(`rules.${k}`)}</th>)}</tr></thead>
          <tbody>
            {RULES.map((r) => (
              <tr key={r.id}>
                <td>{tx(r.label)}</td>
                <td><input aria-label={t('rules.valueOf', { label: r.label })} type="number" step="any" value={overrides[r.id] ?? r.value} onChange={(e) => setVal(r.id, e.target.value === '' ? '' : e.target.value)} />{overrides[r.id] !== undefined && <button className="btn tiny" onClick={() => setVal(r.id, null)}>{t('rules.default')}</button>}</td>
                <td>{tx(r.unit)}</td>
                <td><span className="tag">{r.tag}</span></td>
                <td>{tx(r.source)}</td>
                <td>{r.date}{needsRefresh(r) && <span className="tag warn">{t('rules.refresh')}</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
