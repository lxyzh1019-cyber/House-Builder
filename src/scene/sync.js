// Rooms -> Pascal scene (SPEC §4: Pascal is the only owner of walls; a room block is a Pascal zone
// with its walls and items; other views read from the same scene).
// Each room becomes a zone + 4 walls; each furniture item a plain box (block node) tagged with
// metadata { roomId, itemId }. Rooms sit side by side on level 0 until the lot board places them.
import * as P from '@pascal-app/core'
import { ftToM } from '../units.js'
import { layoutRoom, minimumSize } from '../rooms/engine.js'
import { traceFrame } from '../trace/trace.js'

const WALL = { height: 2.7, thickness: 0.15 }
const GAP_M = ftToM(5)
const HEIGHT_M = { sofa: 0.85, armchair: 0.85, tvstand: 0.5, tv: 0.05, coffeetable: 0.45, desk: 0.75, officechair: 0.9, bookshelf: 2.0, table: 0.75, chair: 0.9, bed: 0.6, nightstand: 0.55, dresser: 0.8, cabinet: 1.6, bench: 0.45, shoecab: 0.9, wardrobe: 2.1 }
const COLOUR = { sofa: '#8a7f72', tv: '#1d1d1f', tvstand: '#b49a7a', bed: '#9fb2c2', desk: '#b49a7a', table: '#b49a7a', bookshelf: '#c2a57f' }

// The size used for a room: the one the user set, else its minimum (R5 default).
export function roomSizeFt(room, rules) {
  if (room.size) return { w: room.size.w / 0.3048, d: room.size.d / 0.3048 }
  const m = minimumSize(room, rules)
  return { w: m.w, d: m.d }
}

// lotInfo = { lot, state } from lotState(): rooms on the lot sit at their footprint (turned); rooms not on
// the lot sit in a row beside it. Item positions come from layoutRoom in the room's own frame and are
// turned with the room.
// traceInfo = { trace, guideUrl }: the traced plan (SPEC §11) becomes its own building, built from the
// saved trace each time, so rebuilding the room blocks never loses it.
export function syncScene(rooms, rules, lotInfo, traceInfo) {
  const s = P.useScene.getState()
  s.setScene({}, [])
  const site = P.SiteNode.parse({ name: 'Site' }); s.createNode(site)
  const building = P.BuildingNode.parse({ name: 'House' }); s.createNode(building, site.id)
  const level = P.LevelNode.parse({ name: 'Level 0', level: 0 }); s.createNode(level, building.id)
  const lotW = lotInfo?.lot ? lotInfo.lot.w : 0
  let rowY = 0
  for (const room of rooms) {
    const st = lotInfo?.state?.[room.id]
    const size = st?.size ?? roomSizeFt(room, rules)
    const W = ftToM(size.w), D = ftToM(size.d)
    let x0, z0, rot = 0
    if (st?.fp) { x0 = ftToM(st.fp.x); z0 = ftToM(st.fp.y); rot = st.fp.rot || 0 }
    else { x0 = lotW + GAP_M; z0 = rowY; rowY += D + GAP_M }
    const fw = rot % 180 === 0 ? W : D, fd = rot % 180 === 0 ? D : W
    // Room frame (metres) -> lot frame, turning clockwise as seen from above.
    const toLot = (lx, ly) => {
      if (rot === 90) return [x0 + (D - ly), z0 + lx]
      if (rot === 180) return [x0 + (W - lx), z0 + (D - ly)]
      if (rot === 270) return [x0 + ly, z0 + (W - lx)]
      return [x0 + lx, z0 + ly]
    }
    const c = [[x0, z0], [x0 + fw, z0], [x0 + fw, z0 + fd], [x0, z0 + fd]]
    s.createNode(P.ZoneNode.parse({ name: room.name, polygon: c, metadata: { roomId: room.id, rot, localW: W * 1000, localD: D * 1000, onLot: !!st?.fp } }), level.id)
    for (let i = 0; i < 4; i++) {
      s.createNode(P.WallNode.parse({ name: `${room.id} wall ${i + 1}`, start: c[i], end: c[(i + 1) % 4], height: WALL.height, thickness: WALL.thickness, slots: { a: '#ece7df', b: '#ece7df' }, metadata: { roomId: room.id } }), level.id)
    }
    const { place } = layoutRoom(room, size.w, size.d, rules, st?.ctx)
    for (const it of room.items) {
      const p = place[it.id]
      const h = it.type === 'tv' ? 0.7 : HEIGHT_M[it.type] ?? 0.8
      const lift = it.type === 'tv' ? 0.5 : 0
      const [px, pz] = toLot(p.cx / 1000, p.cy / 1000)
      s.createNode(P.BlockNode.parse({
        name: it.name,
        position: [px, lift, pz],
        rotation: (-(p.rot + rot) * Math.PI) / 180,
        topology: P.createBoxBlockTopology(it.w / 1000, h, it.d / 1000),
        slots: { body: COLOUR[it.type] ?? '#c9bfb2' },
        metadata: { roomId: room.id, itemId: it.id, local: { cx: p.cx, cy: p.cy, rot: p.rot } },
      }), level.id)
    }
  }
  if (traceInfo?.trace) buildTrace(s, site.id, traceInfo.trace, traceInfo.guideUrl)
}

const DOOR_H = 2.1, WIN_H = 1.2, SILL = 0.9
function buildTrace(s, siteId, trace, guideUrl) {
  const f = traceFrame(trace, GAP_M)
  if (!f) return
  const P2 = (p) => [f.ox + p.x * f.k, f.oz + p.y * f.k]
  const b = P.BuildingNode.parse({ name: 'Traced plan', metadata: { trace: true, k: f.k, ox: f.ox, oz: f.oz } })
  s.createNode(b, siteId)
  trace.levels.forEach((lv, i) => {
    const level = P.LevelNode.parse({ name: lv.name, level: i, metadata: { traceLevelId: lv.id } })
    s.createNode(level, b.id)
    if (i === 0 && guideUrl) {
      s.createNode(P.GuideNode.parse({ name: 'Plan picture', url: guideUrl, position: [f.ox + f.wM / 2, 0.01, f.oz + f.hM / 2], scale: f.wM / 10, opacity: trace.opacity ?? 60 }), level.id)
    }
    for (const w of lv.walls) {
      const wall = P.WallNode.parse({ name: `traced wall ${w.id}`, start: P2(w.a), end: P2(w.b), height: WALL.height, thickness: WALL.thickness, slots: { a: '#ece7df', b: '#ece7df' }, metadata: { traceWallId: w.id, traceLevelId: lv.id } })
      s.createNode(wall, level.id)
      const L = Math.hypot(w.b.x - w.a.x, w.b.y - w.a.y) * f.k
      for (const o of w.openings || []) {
        const at = o.t * L
        const node = o.kind === 'door'
          ? P.DoorNode.parse({ wallId: wall.id, position: [at, DOOR_H / 2, 0], width: o.width, height: DOOR_H, metadata: { traceOpeningId: o.id } })
          : P.WindowNode.parse({ wallId: wall.id, position: [at, SILL + WIN_H / 2, 0], width: o.width, height: WIN_H, metadata: { traceOpeningId: o.id } })
        s.createNode(node, wall.id)
      }
    }
    for (const r of lv.rooms) {
      if (r.pts.length < 3) continue
      s.createNode(P.ZoneNode.parse({ name: r.name, polygon: r.pts.map(P2), metadata: { traceRoomId: r.id, traceLevelId: lv.id } }), level.id)
    }
  })
}

// The traced plan as the Pascal scene holds it, in picture pixels (what the trace board draws):
// { [levelId]: { walls: [{ id, a, b, openings: [{ id, kind, t, width }] }], rooms: [{ id, name, pts }] } }.
export function readTrace(nodes) {
  const all = Object.values(nodes)
  const b = all.find((n) => n.type === 'building' && n.metadata?.trace)
  if (!b) return null
  const { k, ox, oz } = b.metadata
  const px = ([x, z]) => ({ x: (x - ox) / k, y: (z - oz) / k })
  const out = {}
  const lv = (id) => (out[id] ||= { walls: [], rooms: [] })
  for (const n of all) {
    if (n.type === 'wall' && n.metadata?.traceWallId) {
      const L = Math.hypot(n.end[0] - n.start[0], n.end[1] - n.start[1])
      const openings = all.filter((o) => (o.type === 'door' || o.type === 'window') && o.wallId === n.id)
        .map((o) => ({ id: o.metadata?.traceOpeningId, kind: o.type, t: L ? o.position[0] / L : 0, width: o.width }))
      lv(n.metadata.traceLevelId).walls.push({ id: n.metadata.traceWallId, a: px(n.start), b: px(n.end), openings })
    }
    if (n.type === 'zone' && n.metadata?.traceRoomId) lv(n.metadata.traceLevelId).rooms.push({ id: n.metadata.traceRoomId, name: n.name, pts: n.polygon.map(px) })
  }
  return out
}

// Rooms as the lot board shows them, read from the scene: footprint on the lot in ft.
export function readLot(nodes) {
  const out = {}
  for (const n of Object.values(nodes)) {
    if (n.type !== 'zone' || !n.metadata?.roomId || !n.metadata.onLot) continue
    const xs = n.polygon.map((p) => p[0]), zs = n.polygon.map((p) => p[1])
    out[n.metadata.roomId] = { x: Math.min(...xs) / 0.3048, y: Math.min(...zs) / 0.3048, w: (Math.max(...xs) - Math.min(...xs)) / 0.3048, d: (Math.max(...zs) - Math.min(...zs)) / 0.3048, rot: n.metadata.rot || 0 }
  }
  return out
}

// What the drawing shows, read back from the scene: room rectangle (mm) and item centres (mm, room coords).
export function readRoom(nodes, roomId) {
  const all = Object.values(nodes)
  const zone = all.find((n) => n.type === 'zone' && n.metadata?.roomId === roomId)
  if (!zone) return null
  const items = {}
  for (const n of all) {
    if (n.type !== 'block' || n.metadata?.roomId !== roomId) continue
    items[n.metadata.itemId] = { ...n.metadata.local }
  }
  return { W: Math.round(zone.metadata.localW), D: Math.round(zone.metadata.localD), items, walls: all.filter((n) => n.type === 'wall' && n.metadata?.roomId === roomId).length }
}

// The saved scene leaves out the plan picture (a guide): its link only works in the browser that holds the
// picture (DN6 A), and the trace itself is saved with the project.
export const sceneJson = () => {
  const { nodes, rootNodeIds } = P.useScene.getState()
  const keep = {}
  for (const [id, n] of Object.entries(nodes)) {
    if (n.type === 'guide') continue
    keep[id] = Array.isArray(n.children) ? { ...n, children: n.children.filter((c) => nodes[c]?.type !== 'guide') } : n
  }
  return JSON.stringify({ v: 1, nodes: keep, rootNodeIds })
}
