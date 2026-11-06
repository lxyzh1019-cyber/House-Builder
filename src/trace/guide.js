// The Plan intake step strip (SPEC §11 P7, chat-D43): one live line that says the current step, what to tap
// next, and where its result shows. Pure: it reads the trace, the selected tool and the points tapped so far,
// and returns { n, of, key, params } for src/i18n.js (n = 0 for Erase, which is not a step).
import { CHECKS_NEEDED, mPerPx, roomAreaFt2, sizeCheck, wallFt } from './trace.js'
import { ftIn } from '../units.js'

export const STEPS = 5
const STEP_OF = { scale: 1, wall: 2, door: 3, window: 3, room: 4, check: 5, erase: 0 }

export function traceStep({ trace, tool, pts = [], level, checkWall = null, rules }) {
  const lv = level || trace.levels[0]
  const scaled = !!mPerPx(trace)
  const n = scaled ? STEP_OF[tool] ?? 1 : 1
  const out = (key, params = {}) => ({ n, of: STEPS, key, params })
  if (!scaled || tool === 'scale') {
    if (pts.length === 1) return out('step.scale1')
    if (pts.length >= 2) return out('step.scale2')
    if (!scaled) return out('step.scale0')
    const s = trace.scale
    return out('step.scaleSet', { px: Math.round(Math.hypot(s.b.x - s.a.x, s.b.y - s.a.y)), ft: s.ft })
  }
  if (tool === 'wall') {
    const last = lv.walls[lv.walls.length - 1]
    if (!lv.walls.length) return out(pts.length ? 'step.wallStarted' : 'step.walls0')
    return out(pts.length ? 'step.wallsDrawing' : 'step.walls', { count: lv.walls.length, last: ftIn(wallFt(trace, last)) })
  }
  if (tool === 'door' || tool === 'window') {
    const all = lv.walls.flatMap((w) => w.openings || [])
    return out(lv.walls.length ? 'step.openings' : 'step.openingsNoWalls', { doors: all.filter((o) => o.kind === 'door').length, windows: all.filter((o) => o.kind === 'window').length })
  }
  if (tool === 'room') {
    if (pts.length) return out('step.roomDrawing', { n: pts.length })
    const last = lv.rooms[lv.rooms.length - 1]
    return out(lv.rooms.length ? 'step.rooms' : 'step.rooms0', { count: lv.rooms.length, area: last ? Math.round(roomAreaFt2(trace, last) ?? 0) : 0 })
  }
  if (tool === 'check') {
    if (checkWall) return out('step.checkType')
    const c = sizeCheck(trace, rules)
    if (c.status === 'match') return out('step.checkMatch', { n: c.rows.length })
    if (c.status === 'again') return out('step.checkAgain', { list: c.off.map((o) => ftIn(o.ft)).join(', ') })
    return out('step.checkNeed', { n: c.rows.length, of: CHECKS_NEEDED })
  }
  return out('step.erase')
}
