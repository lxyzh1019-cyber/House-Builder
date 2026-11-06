// The sample plan (SPEC §11 P4): a made-up 40 x 30 ft house, drawn at 20 px per foot, so every piece of
// Plan intake works before a real plan exists. Its 40'-0" dimension line runs from (60, 40) to (860, 40);
// the outside walls run x 60–860, y 80–680 (picture pixels).
import svg from './sample-plan.svg?raw'

export const SAMPLE = {
  name: 'Sample plan',
  w: 920, h: 740,
  dim: { a: { x: 60, y: 40 }, b: { x: 860, y: 40 }, ft: 40 },
  outer: [{ x: 60, y: 80 }, { x: 860, y: 80 }, { x: 860, y: 680 }, { x: 60, y: 680 }],
  printed: { w: 40, d: 30 },
}
export const sampleUrl = () => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
