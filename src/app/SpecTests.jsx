// SPEC v1 §6 tests T1–T6, run live in this browser with the default rules table (so they show on the
// Pages link). The same tests run in CI (test/engine.test.js; T4's save and reload in test/rules.test.js).
import { applyAnswers, newRoom } from '../rooms/types.js'
import { checkSize, minimumSize } from '../rooms/engine.js'
import { ftToM, mToFt, sizeFt } from '../units.js'
import { lotFt, lotState, moveRoom, newLot, rotateRoom } from '../lot/lot.js'

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

  // Lot board, SPEC §7 (L7, save and reload, is tested in CI and by reloading the Lot board).
  const at = (r, x, y, rot = 0) => ({ ...r, place: { x: ftToM(x), y: ftToM(y), rot } })
  const pos = (r) => [Math.round(mToFt(r.place.x) * 100) / 100, Math.round(mToFt(r.place.y) * 100) / 100]
  const L = lotFt(newLot()), o1 = at(newRoom('office'), 10, 10), [mv1] = moveRoom([o1], [], o1.id, 13.3, 24.9, {})
  t('L1', 'New lot is 60 x 100 ft; a drag to 13.3, 24.9 ft snaps to 2 ft', '60 x 100, at 14, 24', `${L.w} x ${L.d}, at ${pos(mv1).join(', ')}`, L.w === 60 && L.d === 100 && pos(mv1)[0] === 14 && pos(mv1)[1] === 24)
  const l2 = at(newRoom('living', 'Family TV room'), 10, 10), [r2] = rotateRoom([l2], l2.id, {}), f2 = lotState([r2], newLot(), {})[r2.id].fp
  t('L2', 'A room turns 90°', '15 x 13.5 becomes 13.5 x 15', `${sizeFt(f2.w, f2.d)}, ${r2.place.rot}°`, r2.place.rot === 90 && f2.w === 13.5 && f2.d === 15)
  const a3 = at(newRoom('office'), 10, 10), b3 = at(newRoom('dining'), 15, 15), s3 = lotState([a3, b3], newLot(), {})
  t('L3', 'Two overlapping rooms are flagged', 'both flagged', s3[a3.id].overlap.length && s3[b3.id].overlap.length ? 'both flagged' : 'not flagged', !!(s3[a3.id].overlap.length && s3[b3.id].overlap.length))
  const lot4 = { ...newLot(), setbacks: { front: ftToM(20), rear: 0, left: 0, right: 0 } }, cr4 = at(newRoom('office'), 10, 15), s4 = lotState([cr4], lot4, {})[cr4.id]
  t('L4', 'A room crossing a 20 ft front setback is flagged', 'front setback', s4.outside.join(', ') || 'none', s4.outside.includes('front setback'))
  const liv = { ...newRoom('living', 'Family TV room') }; liv.answers = { ...liv.answers, open: 'yes' }
  const lv = at(liv, 10, 20), dn = at(newRoom('dining'), 10, 33.5)
  const s5a = lotState([lv, dn], newLot(), {})[lv.id].min, s5b = lotState([at(lv, 10, 2), dn], newLot(), {})[lv.id].min
  t('L5', 'T1 living room (open) against an open dining room, then moved away', '15 x 11, then 15 x 13.5', `${sizeFt(s5a.w, s5a.d)}, then ${sizeFt(s5b.w, s5b.d)}`, s5a.w === 15 && s5a.d === 11 && s5b.w === 15 && s5b.d === 13.5)
  const mud = at(newRoom('mudroom'), 10, 40), din = at(newRoom('dining'), 22, 40)
  const m6 = moveRoom([mud, din], [{ id: 'c', name: 'Core route', roomIds: [mud.id, din.id] }], mud.id, 14, 46, {})
  t('L6', 'A glued core route moves as one', 'both moved 4, 6 ft', `${pos(m6[0]).join(', ')} and ${pos(m6[1]).join(', ')}`, pos(m6[0]).join() === '14,46' && pos(m6[1]).join() === '26,46')
  return out
}

export default function SpecTests() {
  const rows = run()
  const passed = rows.filter((r) => r.pass).length
  return (
    <section className="panel">
      <h2>Spec tests</h2>
      <p className="muted"><b data-testid="spec-summary">{passed} of {rows.length} pass</b> in this browser, with the default rules table. T7 is the owner's phone test; L7 (lot saved and reloaded) runs in CI.</p>
      <div className="table-wrap">
        <table className="rules">
          <thead><tr><th>Test</th><th>What</th><th>Expected</th><th>Got</th><th>Result</th></tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id}><td>{r.id}</td><td>{r.what}</td><td>{r.expected}</td><td>{r.got}</td><td><span className={`tag ${r.pass ? 'pass' : 'warn'}`}>{r.pass ? 'Pass' : 'Fail'}</span></td></tr>)}</tbody>
        </table>
      </div>
    </section>
  )
}
