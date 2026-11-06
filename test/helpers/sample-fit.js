// The sample plan's rooms, traced at their corners (20 px per ft; outside walls x 60–860, y 80–680),
// with Living as a Family TV room and Bath as a home office. Shared by fit.test.js and rules.test.js.
import { fitRoom } from '../../src/trace/fit.js'
import { newTrace } from '../../src/trace/trace.js'
import { SAMPLE } from '../../src/trace/sample.js'

const R = (id, name, x0, y0, x1, y1) => ({ id, name, pts: [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }] })
export function sampleFit() {
  const t = newTrace()
  t.image = { kind: 'sample', name: SAMPLE.name, w: SAMPLE.w, h: SAMPLE.h }
  t.scale = { ...SAMPLE.dim }
  t.levels[0].rooms = [R('liv', 'Living', 60, 80, 460, 440), R('bath', 'Bath', 340, 440, 460, 680), R('bed1', 'Bedroom 1', 60, 440, 340, 680)]
  t.fit = { on: true, rooms: { liv: fitRoom('living'), bath: fitRoom('office') } }
  return t
}
