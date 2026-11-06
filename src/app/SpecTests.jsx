// SPEC v1.3 §6.6 tests (T1–T6, T8–T12, T15 from src/data/presets.json) and §7 L1–L6, run live in this
// browser with the default rules table (so they show on the Pages link). The same tests run in CI
// (test/engine.test.js, test/lot.test.js; T4's save and reload, T13 and T14 in test/rules.test.js).
import PRESETS from '../data/presets.json'
import { applyOptions, newRoom } from '../rooms/types.js'
import { checkSize, egressNeeded, minimumSize } from '../rooms/engine.js'
import { PRESET_OF } from '../rooms/bands.js'
import { ftIn, ftToM, mToFt, sizeFt } from '../units.js'
import { lotFt, lotState, moveRoom, newLot, rotateRoom } from '../lot/lot.js'
import { t as tr, tx } from '../i18n.js'

const TYPE_OF = Object.fromEntries(Object.entries(PRESET_OF).map(([k, p]) => [p, k]))
const roomFor = (preset, opts) => applyOptions(newRoom(TYPE_OF[preset]), opts)
const living = (o = {}) => roomFor('living_tv', { seats: '6-8', tv_in: 75, open: false, ...o })
const near = (a, b) => Math.abs(a - b) < 0.01
const show = (m) => `${ftIn(m.w)} x ${ftIn(m.d)}`

function run() {
  const out = []
  const t = (id, what, expected, got, pass) => out.push({ id, what, expected, got, pass })
  for (const tc of PRESETS.tests) {
    const r = roomFor(tc.preset, tc.opts), m = minimumSize(r)
    const flag = tc.id === 'T12' || tc.id === 'T15'
    const pass = near(m.w, tc.min[0]) && near(m.d, tc.min[1]) && (!flag || egressNeeded(r))
    t(tc.id, tr(`${tc.id}.what`), `${show({ w: tc.min[0], d: tc.min[1] })}${flag ? tr('tests.egress') : ''}`, `${show(m)}${flag && egressNeeded(r) ? tr('tests.egress') : ''}`, pass)
  }
  const c4 = checkSize(living(), 20, 20)
  t('T4', tr('T4.what'), tr('T4.expected'), tr('T4.got', { status: tr(`st.${c4.status}`), spare: c4.spare?.toFixed(1) }), c4.status === 'fits' && near(c4.spare, 197.5))
  const c5 = checkSize(living(), 14, 13)
  const list = (c5.changes || []).map((c) => `${c.side} ${c.ft.toFixed(2)}`).join(', ')
  t('T5', tr('T5.what'), tr('T5.expected'),
    tr('T5.got', { status: tr(`st.${c5.status}`), w: c5.shortW?.toFixed(1), d: c5.shortD?.toFixed(1), n: list }),
    c5.status === 'too-small' && near(c5.shortW, 1) && near(c5.shortD, 0.5) && list === 'w 13.50, d 12.33, d 12.25')
  const rooms = PRESETS.tests.map((tc) => roomFor(tc.preset, tc.opts))
  const ok6 = rooms.every((r) => { const m = minimumSize(r); return checkSize(r, m.w, m.d).status === 'fits' && checkSize(r, m.w - 0.5, m.d).status === 'too-small' && checkSize(r, m.w, m.d - 0.5).status === 'too-small' })
  t('T6', tr('T6.what'), tr('T6.pass', { n: rooms.length }), ok6 ? tr('T6.pass', { n: rooms.length }) : tr('T6.fail'), ok6)

  // Lot board, SPEC §7 (L7, save and reload, is tested in CI and by reloading the Lot board).
  const at = (r, x, y, rot = 0) => ({ ...r, place: { x: ftToM(x), y: ftToM(y), rot } })
  const pos = (r) => [Math.round(mToFt(r.place.x) * 100) / 100, Math.round(mToFt(r.place.y) * 100) / 100]
  const L = lotFt(newLot()), o1 = at(newRoom('office'), 10, 10), [mv1] = moveRoom([o1], [], o1.id, 13.3, 24.9, {})
  t('L1', tr('L1.what'), tr('L1.expected'), tr('L1.got', { w: L.w, d: L.d, pos: pos(mv1).join(', ') }), L.w === 60 && L.d === 100 && pos(mv1)[0] === 14 && pos(mv1)[1] === 24)
  const l2 = at(newRoom('living'), 10, 10), [r2] = rotateRoom([l2], l2.id, {}), f2 = lotState([r2], newLot(), {})[r2.id].fp
  t('L2', tr('L2.what'), tr('L2.expected'), `${sizeFt(f2.w, f2.d)}, ${r2.place.rot}°`, r2.place.rot === 90 && f2.w === 13.5 && f2.d === 15)
  const a3 = at(newRoom('office'), 10, 10), b3 = at(newRoom('dining'), 15, 15), s3 = lotState([a3, b3], newLot(), {})
  t('L3', tr('L3.what'), tr('L3.both'), s3[a3.id].overlap.length && s3[b3.id].overlap.length ? tr('L3.both') : tr('L3.none'), !!(s3[a3.id].overlap.length && s3[b3.id].overlap.length))
  const lot4 = { ...newLot(), setbacks: { front: ftToM(20), rear: 0, left: 0, right: 0 } }, cr4 = at(newRoom('office'), 10, 15), s4 = lotState([cr4], lot4, {})[cr4.id]
  t('L4', tr('L4.what'), tx('front setback'), s4.outside.map(tx).join(tr('list.sep')) || tr('L4.none'), s4.outside.includes('front setback'))
  const liv = applyOptions(newRoom('living'), { open: true })
  const lv = at(liv, 10, 20), dn = at(newRoom('dining'), 10, 33.5)
  const s5a = lotState([lv, dn], newLot(), {})[lv.id].min, s5b = lotState([at(lv, 10, 2), dn], newLot(), {})[lv.id].min
  t('L5', tr('L5.what'), tr('L5.expected'), tr('L5.got', { a: sizeFt(s5a.w, s5a.d), b: sizeFt(s5b.w, s5b.d) }), s5a.w === 15 && s5a.d === 11 && s5b.w === 15 && s5b.d === 13.5)
  const mud = at(newRoom('mudroom'), 10, 40), din = at(newRoom('dining'), 22, 40)
  const m6 = moveRoom([mud, din], [{ id: 'c', name: 'Core route', roomIds: [mud.id, din.id] }], mud.id, 14, 46, {})
  t('L6', tr('L6.what'), tr('L6.expected'), tr('L6.got', { a: pos(m6[0]).join(', '), b: pos(m6[1]).join(', ') }), pos(m6[0]).join() === '14,46' && pos(m6[1]).join() === '26,46')
  return out
}

export default function SpecTests() {
  const rows = run()
  const passed = rows.filter((r) => r.pass).length
  return (
    <section className="panel">
      <h2>{tr('tests.title')}</h2>
      <p className="muted"><b data-testid="spec-summary" data-passed={passed} data-total={rows.length}>{tr('tests.summary', { p: passed, n: rows.length })}</b>{tr('tests.help')}</p>
      <div className="table-wrap">
        <table className="rules">
          <thead><tr>{['test', 'what', 'expected', 'got', 'result'].map((k) => <th key={k}>{tr(`tests.${k}`)}</th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r.id}><td>{r.id}</td><td>{r.what}</td><td>{r.expected}</td><td>{r.got}</td><td><span className={`tag ${r.pass ? 'pass' : 'warn'}`}>{r.pass ? tr('tests.pass') : tr('tests.fail')}</span></td></tr>)}</tbody>
        </table>
      </div>
    </section>
  )
}
