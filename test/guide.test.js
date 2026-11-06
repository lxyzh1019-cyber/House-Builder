// SPEC §11 P7, tests N1 and N2 (chat-D43): the Plan intake step strip says the current step, what to tap
// next and where the result shows. Made-up trace on the sample plan (20 px per ft). N3 is the owner's I8 on a PC.
import { describe, expect, it } from 'vitest'
import { traceStep } from '../src/trace/guide.js'
import { newTrace } from '../src/trace/trace.js'
import { SAMPLE } from '../src/trace/sample.js'
import { UI, setLang, t } from '../src/i18n.js'

const base = () => { const tr = newTrace(); tr.image = { kind: 'sample', name: SAMPLE.name, w: SAMPLE.w, h: SAMPLE.h }; return tr }
const scaled = () => { const tr = base(); tr.scale = { a: { x: 60, y: 40 }, b: { x: 460, y: 40 }, ft: 20 }; return tr }
const wall = (id, a, b, openings = []) => ({ id, a, b, openings })
const step = (o) => { const s = traceStep(o); return [s.n, s.key, s.params] }

describe('Plan intake step strip (SPEC §11 P7)', () => {
  it('N1 Step 1 Scale: 0 of 2, 1 of 2, type the length, then scale set', () => {
    expect(step({ trace: base(), tool: 'scale', pts: [] })).toEqual([1, 'step.scale0', {}])
    expect(step({ trace: base(), tool: 'scale', pts: [{ x: 1, y: 1 }] })).toEqual([1, 'step.scale1', {}])
    expect(step({ trace: base(), tool: 'scale', pts: [{ x: 1, y: 1 }, { x: 9, y: 1 }] })).toEqual([1, 'step.scale2', {}])
    expect(step({ trace: scaled(), tool: 'scale', pts: [] })).toEqual([1, 'step.scaleSet', { px: 400, ft: 20 }])
    // before the scale is set the strip stays on Step 1 whatever tool was left selected
    expect(step({ trace: base(), tool: 'wall', pts: [] })[0]).toBe(1)
  })

  it('N1 Step 2 Walls: count and last length; Step 3 doors and windows on their walls', () => {
    const tr = scaled()
    expect(step({ trace: tr, tool: 'wall', pts: [] })).toEqual([2, 'step.walls0', {}])
    tr.levels[0].walls = [wall('w1', { x: 60, y: 80 }, { x: 860, y: 80 }, [{ id: 'd', kind: 'door', t: 0.5, width: 0.9 }]), wall('w2', { x: 860, y: 80 }, { x: 860, y: 680 }, [{ id: 'n', kind: 'window', t: 0.5, width: 1.2 }, { id: 'n2', kind: 'window', t: 0.2, width: 1.2 }])]
    expect(step({ trace: tr, tool: 'wall', pts: [] })).toEqual([2, 'step.walls', { count: 2, last: '30′ 0″' }])
    expect(step({ trace: tr, tool: 'wall', pts: [{ x: 860, y: 680 }] })[1]).toBe('step.wallsDrawing')
    expect(step({ trace: tr, tool: 'door', pts: [] })).toEqual([3, 'step.openings', { doors: 1, windows: 2 }])
    expect(step({ trace: scaled(), tool: 'window', pts: [] })[1]).toBe('step.openingsNoWalls')
  })

  it('N1 Step 4 Rooms and Step 5 Size check: need, match, trace again', () => {
    const tr = scaled()
    expect(step({ trace: tr, tool: 'room', pts: [{ x: 1, y: 1 }, { x: 2, y: 2 }] })).toEqual([4, 'step.roomDrawing', { n: 2 }])
    tr.levels[0].rooms = [{ id: 'r', name: 'Living', pts: [{ x: 60, y: 80 }, { x: 460, y: 80 }, { x: 460, y: 440 }, { x: 60, y: 440 }] }]
    expect(step({ trace: tr, tool: 'room', pts: [] })).toEqual([4, 'step.rooms', { count: 1, area: 360 }])
    tr.levels[0].walls = [wall('a', { x: 60, y: 80 }, { x: 860, y: 80 }), wall('b', { x: 860, y: 80 }, { x: 860, y: 680 }), wall('c', { x: 860, y: 680 }, { x: 60, y: 680 })]
    tr.checks = [{ id: 'c1', wallId: 'a', ft: 40 }, { id: 'c2', wallId: 'b', ft: 30 }]
    expect(step({ trace: tr, tool: 'check', pts: [] })).toEqual([5, 'step.checkNeed', { n: 2, of: 3 }])
    expect(step({ trace: tr, tool: 'check', pts: [], checkWall: 'c' })[1]).toBe('step.checkType')
    tr.checks.push({ id: 'c3', wallId: 'c', ft: 40 })
    expect(step({ trace: tr, tool: 'check', pts: [] })).toEqual([5, 'step.checkMatch', { n: 3 }])
    tr.checks[1] = { id: 'c2', wallId: 'b', ft: 32 }
    expect(step({ trace: tr, tool: 'check', pts: [] })).toEqual([5, 'step.checkAgain', { list: '32′ 0″' }])
  })

  it('N2 a greyed-out tool says why, in both languages; every strip line exists in both', () => {
    setLang('en'); expect(t('step.needScale')).toMatch(/^Set the scale first \(Step 1\)/)
    setLang('zh'); expect(t('step.needScale')).toMatch(/^请先设定比例/)
    setLang('en')
    for (const k of Object.keys(UI).filter((k) => k.startsWith('step.'))) expect(UI[k][1].length, k).toBeGreaterThan(0)
  })
})
