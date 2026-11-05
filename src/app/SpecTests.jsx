// SPEC v1 §6 tests T1–T6, run live in this browser with the default rules table (so they show on the
// Pages link). The same tests run in CI (test/engine.test.js; T4's save and reload in test/rules.test.js).
import { applyAnswers, newRoom } from '../rooms/types.js'
import { checkSize, minimumSize } from '../rooms/engine.js'
import { sizeFt } from '../units.js'

const living = (a = {}) => { const r = newRoom('living', 'Family TV room'); return applyAnswers(r, { ...r.answers, ...a }) }
const near = (a, b) => Math.abs(a - b) < 1e-6

function run() {
  const out = []
  const t = (id, what, expected, got, pass) => out.push({ id, what, expected, got, pass })
  const m1 = minimumSize(living())
  t('T1', 'Living room, 6–8 seats, 75-in TV, separate room', '15.0 x 13.5 ft', sizeFt(m1.w, m1.d), m1.w === 15 && m1.d === 13.5)
  const m2 = minimumSize(living({ open: 'yes' }))
  t('T2', 'Same room, open to dining', '15.0 x 11.0 ft', sizeFt(m2.w, m2.d), m2.w === 15 && m2.d === 11)
  const m3 = minimumSize(newRoom('office', 'Home office'))
  t('T3', 'Office, 1 person, 6 ft desk, shelf wall', '10.0 x 10.0 ft', sizeFt(m3.w, m3.d), m3.w === 10 && m3.d === 10)
  const c4 = checkSize(living(), 20, 20)
  t('T4', 'T1 room set to 20 x 20 ft (save and reload checked in CI and in Rooms)', 'fits, spare 197.5 ft²', `${c4.status}, spare ${c4.spare?.toFixed(1)} ft²`, c4.status === 'fits' && near(c4.spare, 197.5))
  const c5 = checkSize(living(), 14, 13)
  t('T5', 'T1 room set to 14 x 13 ft', 'too small, width short 1.0, depth short 0.5, changes listed',
    `${c5.status}, short ${c5.shortW?.toFixed(1)} / ${c5.shortD?.toFixed(1)}, ${c5.changes?.length ?? 0} change(s)`,
    c5.status === 'too-small' && near(c5.shortW, 1) && near(c5.shortD, 0.5) && c5.changes.length > 0)
  const rooms = [living(), living({ open: 'yes' }), newRoom('office'), newRoom('dining'), newRoom('primary'), newRoom('kid'), newRoom('mudroom')]
  const ok6 = rooms.every((r) => { const m = minimumSize(r); return checkSize(r, m.w, m.d).status === 'fits' && checkSize(r, m.w - 0.5, m.d).status === 'too-small' && checkSize(r, m.w, m.d - 0.5).status === 'too-small' })
  t('T6', 'Round trip: each minimum passes its own check; 0.5 ft smaller fails', `${rooms.length} rooms pass`, ok6 ? `${rooms.length} rooms pass` : 'a room failed', ok6)
  return out
}

export default function SpecTests() {
  const rows = run()
  const passed = rows.filter((r) => r.pass).length
  return (
    <section className="panel">
      <h2>Spec tests</h2>
      <p className="muted"><b data-testid="spec-summary">{passed} of {rows.length} pass</b> in this browser, with the default rules table. T7 is the owner's phone test.</p>
      <div className="table-wrap">
        <table className="rules">
          <thead><tr><th>Test</th><th>What</th><th>Expected</th><th>Got</th><th>Result</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id}><td>{r.id}</td><td>{r.what}</td><td>{r.expected}</td><td>{r.got}</td><td><span className={`tag ${r.pass ? 'pass' : 'warn'}`}>{r.pass ? 'Pass' : 'Fail'}</span></td></tr>)}</tbody>
        </table>
      </div>
    </section>
  )
}
