// Plan intake (SPEC §11), tests I1–I5 and I7 (I6, save and reload, runs in the emulator: rules.test.js).
import { describe, expect, it } from 'vitest'
import * as P from '@pascal-app/core'
import { builtinPlugin } from '@pascal-app/nodes'
import { mPerPx, newTrace, placeOpening, roomAreaFt2, sizeCheck, snapPoint, wallFt } from '../src/trace/trace.js'
import { SAMPLE, sampleUrl } from '../src/trace/sample.js'
import { readTrace, sceneJson, syncScene } from '../src/scene/sync.js'
import { coverage, lotState, newLot } from '../src/lot/lot.js'
import { newRoom } from '../src/rooms/types.js'
import { ftToM } from '../src/units.js'

await P.loadPlugin(builtinPlugin)
const walls = (pts) => pts.map((a, i) => ({ id: `w${i}`, a, b: pts[(i + 1) % pts.length], openings: [] }))
const sampleTrace = () => {
  const t = newTrace()
  t.image = { kind: 'sample', name: SAMPLE.name, w: SAMPLE.w, h: SAMPLE.h }
  t.scale = { ...SAMPLE.dim }
  t.levels[0].walls = walls(SAMPLE.outer)
  return t
}

describe('Plan intake (SPEC §11)', () => {
  it("I1 the sample plan's 4 outside walls, traced, give its printed size within the tolerance", () => {
    const t = sampleTrace()
    const [top, right, bottom, left] = t.levels[0].walls.map((w) => wallFt(t, w))
    expect(top).toBeCloseTo(SAMPLE.printed.w, 6); expect(bottom).toBeCloseTo(SAMPLE.printed.w, 6)
    expect(right).toBeCloseTo(SAMPLE.printed.d, 6); expect(left).toBeCloseTo(SAMPLE.printed.d, 6)
    t.checks = [{ id: 'c1', wallId: 'w0', ft: 40 }, { id: 'c2', wallId: 'w1', ft: 30 }, { id: 'c3', wallId: 'w2', ft: 40 }]
    expect(sizeCheck(t).status).toBe('match')
    expect(sampleUrl().startsWith('data:image/svg+xml')).toBe(true)
  })

  it('I2 two points 100 px apart set to 10 ft make a 200 px wall read 20.0 ft', () => {
    const t = newTrace()
    t.scale = { a: { x: 0, y: 0 }, b: { x: 100, y: 0 }, ft: 10 }
    expect(mPerPx(t)).toBeCloseTo(ftToM(10) / 100, 9)
    expect(wallFt(t, { a: { x: 50, y: 50 }, b: { x: 250, y: 50 } }).toFixed(1)).toBe('20.0')
    // drawing help: a point 5° off level squares up; a point near a wall end lands on it
    expect(snapPoint({ x: 300, y: 58 }, { x: 100, y: 50 }, [], 10)).toEqual({ x: 300, y: 50 })
    expect(snapPoint({ x: 104, y: 47 }, null, [{ x: 100, y: 50 }], 10)).toEqual({ x: 100, y: 50 })
  })

  it('I3 three matching sizes say "matches"; one off by more than the tolerance says "trace again" and names it', () => {
    const t = sampleTrace()
    t.checks = [{ id: 'c1', wallId: 'w0', ft: 40 }, { id: 'c2', wallId: 'w1', ft: 30.2 }]
    expect(sizeCheck(t).status).toBe('need')
    t.checks.push({ id: 'c3', wallId: 'w3', ft: 30 })
    expect(sizeCheck(t).status).toBe('match') // 30.2 is 2.4 in off: inside 3 in
    t.checks[1].ft = 30.5 // 6 in off
    const r = sizeCheck(t)
    expect(r.status).toBe('again')
    expect(r.off.map((o) => o.wallId)).toEqual(['w1'])
    expect(r.off[0].diff).toBeCloseTo(-0.5, 6)
  })

  it('I4 a door and a window sit on their wall in the Pascal scene, at the traced place and width', () => {
    const t = sampleTrace(), lv = t.levels[0]
    const d = placeOpening(t, lv, { x: 200, y: 82 }, 'door', ftToM(3), 20) // top wall, 7 ft from its start
    const w = placeOpening(t, lv, { x: 858, y: 670 }, 'window', ftToM(4), 20) // 29.5 ft along the right wall: slides back to fit
    for (const o of [d, w]) lv.walls.find((x) => x.id === o.wallId).openings.push(o.opening)
    syncScene([], {}, null, { trace: t })
    const nodes = P.useScene.getState().nodes
    const all = Object.values(nodes)
    const top = all.find((n) => n.type === 'wall' && n.metadata?.traceWallId === 'w0')
    const right = all.find((n) => n.type === 'wall' && n.metadata?.traceWallId === 'w1')
    const door = all.find((n) => n.type === 'door'), win = all.find((n) => n.type === 'window')
    expect(door.wallId).toBe(top.id); expect(door.parentId).toBe(top.id)
    expect(door.position[0]).toBeCloseTo(ftToM(7), 6)
    expect(door.width).toBeCloseTo(ftToM(3), 6)
    expect(win.wallId).toBe(right.id)
    expect(win.position[0]).toBeCloseTo(ftToM(30 - 2), 6) // slid back so the 4 ft window fits
    // the trace board reads the same back from the scene
    const back = readTrace(nodes).lv0.walls.find((x) => x.id === 'w0')
    expect(back.a.x).toBeCloseTo(60, 6); expect(back.openings[0].t).toBeCloseTo(7 / 40, 6)
  })

  it('I5 a traced room becomes a Pascal room with its name and area; a Level 1 wall sits on Level 1', () => {
    const t = sampleTrace()
    t.levels[0].rooms.push({ id: 'r1', name: 'Living', pts: [{ x: 60, y: 80 }, { x: 460, y: 80 }, { x: 460, y: 440 }, { x: 60, y: 440 }] })
    t.levels.push({ id: 'lv1', name: 'Level 1', walls: [{ id: 'u1', a: { x: 60, y: 80 }, b: { x: 460, y: 80 }, openings: [] }], rooms: [] })
    expect(roomAreaFt2(t, t.levels[0].rooms[0])).toBeCloseTo(20 * 18, 6)
    syncScene([], {}, null, { trace: t, guideUrl: sampleUrl() })
    const all = Object.values(P.useScene.getState().nodes)
    const zone = all.find((n) => n.type === 'zone' && n.metadata?.traceRoomId === 'r1')
    expect(zone.name).toBe('Living')
    const lv1 = all.find((n) => n.type === 'level' && n.metadata?.traceLevelId === 'lv1')
    const up = all.find((n) => n.type === 'wall' && n.metadata?.traceWallId === 'u1')
    expect(lv1.level).toBe(1); expect(up.parentId).toBe(lv1.id)
    // the picture is in the live scene (overlay) but never in the saved scene (DN6 A)
    expect(all.some((n) => n.type === 'guide')).toBe(true)
    const saved = JSON.parse(sceneJson())
    expect(Object.values(saved.nodes).some((n) => n.type === 'guide')).toBe(false)
    expect(Object.values(saved.nodes).every((n) => !(n.children || []).some((c) => c.startsWith('guide_')))).toBe(true)
  })

  it('I7 coverage = area under the placed rooms / lot area, flagged when over the limit', () => {
    const at = (r, x, y) => ({ ...r, place: { x: ftToM(x), y: ftToM(y), rot: 0 } })
    const office = at(newRoom('office'), 10, 10) // 9 x 9.5 (T3)
    const dining = at(newRoom('dining'), 15, 15) // 12 x 9 (T8): overlaps the office by 4 x 4.5
    const lot = { ...newLot(), site: { zone: 'RS', maxHeightFt: 30, maxCoveragePct: 40 } }
    const st = lotState([office, dining], lot, {})
    const dn = st[dining.id].fp
    const c = coverage(lot, st)
    expect(c.area).toBeCloseTo(9 * 9.5 + dn.w * dn.d - 4 * 4.5, 6)
    expect(c.pct).toBeCloseTo((c.area / 6000) * 100, 6)
    expect(c.over).toBe(false)
    expect(coverage({ ...lot, site: { ...lot.site, maxCoveragePct: 2 } }, st).over).toBe(true)
  })
})
