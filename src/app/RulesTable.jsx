// R12: the rules table. Every row shows value, unit, source, evidence tag and date; a row older than
// 2 years is flagged. Values can be changed for this project (saved with the project).
import { RULES, needsRefresh } from '../rules.js'

export default function RulesTable({ overrides, onChange }) {
  const setVal = (id, v) => {
    const next = { ...overrides }
    if (v === '' || v === null) delete next[id]
    else next[id] = Number(v)
    onChange(next)
  }
  return (
    <section className="panel">
      <h2>Rules table</h2>
      <p className="muted">The size engine uses only these numbers. E1 own experience · E2 a quote or spec sheet with its source · E3 general knowledge (a starting value). Change a value for this project; clear it to go back to the default.</p>
      <div className="table-wrap">
        <table className="rules">
          <thead><tr><th>Rule</th><th>Value</th><th>Unit</th><th>Tag</th><th>Source</th><th>Date</th></tr></thead>
          <tbody>
            {RULES.map((r) => (
              <tr key={r.id}>
                <td>{r.label}</td>
                <td><input aria-label={`${r.label} value`} type="number" step="any" value={overrides[r.id] ?? r.value} onChange={(e) => setVal(r.id, e.target.value === '' ? '' : e.target.value)} />{overrides[r.id] !== undefined && <button className="btn tiny" onClick={() => setVal(r.id, null)}>Default</button>}</td>
                <td>{r.unit}</td>
                <td><span className="tag">{r.tag}</span></td>
                <td>{r.source}</td>
                <td>{r.date}{needsRefresh(r) && <span className="tag warn">refresh</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
