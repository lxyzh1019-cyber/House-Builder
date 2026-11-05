// Pure room logic for the spike: build one living room with 4 walls and a sofa box,
// resize it, and read its size back. No React, no Firebase — so Vitest can test it.
import * as P from '@pascal-app/core'

export const FT = 0.3048
export const ftToM = (ft) => ft * FT
export const mToFt = (m) => m / FT

export const START_FT = { w: 15, d: 12.3 }
export const WALL = { height: 2.7, thickness: 0.15 }
const WALL_COLOUR = '#ece7df'
// 3-seat sofa: 7.5 ft long, 3 ft deep. Height 2.75 ft is a guess (not in the task).
export const SOFA_FT = { w: 7.5, d: 3, h: 2.75 }

const scene = () => P.useScene.getState()

// Corners of a room centred on the origin: x ±w/2, z ±d/2 (metres).
export function corners(wFt, dFt) {
  const x = ftToM(wFt) / 2
  const z = ftToM(dFt) / 2
  return [[-x, -z], [x, -z], [x, z], [-x, z]]
}

// Sofa against the back wall (z = -d/2), centred on x. Inner face of wall + small gap.
export function sofaPosition(dFt) {
  const z = -ftToM(dFt) / 2 + WALL.thickness / 2 + ftToM(SOFA_FT.d) / 2 + 0.05
  return [0, 0, z]
}

export function buildRoom(wFt = START_FT.w, dFt = START_FT.d) {
  const s = scene()
  const site = P.SiteNode.parse({ name: 'Site' })
  s.createNode(site)
  const building = P.BuildingNode.parse({ name: 'House' })
  s.createNode(building, site.id)
  const level = P.LevelNode.parse({ name: 'Level 0', level: 0 })
  s.createNode(level, building.id)
  const c = corners(wFt, dFt)
  const zone = P.ZoneNode.parse({ name: 'Living room', polygon: c })
  s.createNode(zone, level.id)
  for (let i = 0; i < 4; i++) {
    const wall = P.WallNode.parse({
      name: `Wall ${i + 1}`,
      start: c[i],
      end: c[(i + 1) % 4],
      height: WALL.height,
      thickness: WALL.thickness,
      // Plain paint colour: Pascal's default drywall finish downloads textures from its own server.
      slots: { a: WALL_COLOUR, b: WALL_COLOUR },
    })
    s.createNode(wall, level.id)
  }
  const sofa = P.BlockNode.parse({
    name: 'Sofa (3-seat)',
    position: sofaPosition(dFt),
    topology: P.createBoxBlockTopology(ftToM(SOFA_FT.w), ftToM(SOFA_FT.h), ftToM(SOFA_FT.d)),
    slots: { body: '#8a7f72' },
  })
  s.createNode(sofa, level.id)
}

export const nodesOfType = (type) =>
  Object.values(scene().nodes).filter((n) => n.type === type)

export function resizeRoom(wFt, dFt) {
  const s = scene()
  const c = corners(wFt, dFt)
  const zone = nodesOfType('zone')[0]
  s.updateNode(zone.id, { polygon: c })
  nodesOfType('wall')
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach((wall, i) => s.updateNode(wall.id, { start: c[i], end: c[(i + 1) % 4] }))
  const sofa = nodesOfType('block')[0]
  if (sofa) s.updateNode(sofa.id, { position: sofaPosition(dFt) })
}

// Room size read from the zone polygon, in feet.
export function roomSizeFt() {
  const zone = nodesOfType('zone')[0]
  if (!zone) return null
  const xs = zone.polygon.map((p) => p[0])
  const zs = zone.polygon.map((p) => p[1])
  return { w: mToFt(Math.max(...xs) - Math.min(...xs)), d: mToFt(Math.max(...zs) - Math.min(...zs)) }
}

export const wallLengthsFt = () =>
  nodesOfType('wall').map((w) => mToFt(Math.hypot(w.end[0] - w.start[0], w.end[1] - w.start[1])))

export const sizeLabel = (size) => (size ? `${size.w.toFixed(1)} x ${size.d.toFixed(1)} ft` : '—')
