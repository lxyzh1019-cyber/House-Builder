import { beforeAll, describe, expect, it } from 'vitest'
import * as P from '@pascal-app/core'
import { builtinPlugin } from '@pascal-app/nodes'
import { newRoom } from '../src/rooms/types.js'
import { readRoom, syncScene } from '../src/scene/sync.js'
import { ftToM } from '../src/units.js'

beforeAll(async () => { await P.loadPlugin(builtinPlugin) })

describe('rooms -> Pascal scene', () => {
  it('each room is a zone with 4 walls and its items; the drawing reads the size back from the scene', () => {
    const living = newRoom('living', 'Family TV room')
    const office = { ...newRoom('office', 'Home office'), size: { w: ftToM(12), d: ftToM(11) } }
    syncScene([living, office])
    const nodes = P.useScene.getState().nodes
    const a = readRoom(nodes, living.id), b = readRoom(nodes, office.id)
    expect(a.walls).toBe(4)
    expect(Math.round(a.W / 304.8 * 10) / 10).toBe(15)      // minimum, since no size is set
    expect(Math.round(a.D / 304.8 * 10) / 10).toBe(13.5)
    expect(Math.round(b.W / 304.8 * 10) / 10).toBe(12)      // the size the user set
    expect(Object.keys(a.items)).toHaveLength(living.items.length)
    expect(Object.keys(b.items)).toHaveLength(office.items.length)
  })
})

describe('rooms on the lot -> Pascal scene', () => {
  it('a room placed and turned 90° on the lot becomes a turned zone; the board reads it back', async () => {
    const { lotState, newLot, rotateRoom } = await import('../src/lot/lot.js')
    const { readLot } = await import('../src/scene/sync.js')
    let living = { ...newRoom('living', 'Family TV room'), place: { x: ftToM(10), y: ftToM(20), rot: 0 } }
    ;[living] = rotateRoom([living], living.id, {})
    const lot = newLot()
    syncScene([living], {}, { lot, state: lotState([living], lot, {}) })
    const fp = readLot(P.useScene.getState().nodes)[living.id]
    expect(fp.rot).toBe(90)
    expect(Math.round(fp.w * 10) / 10).toBe(13.5)
    expect(Math.round(fp.d * 10) / 10).toBe(15)
    const r = readRoom(P.useScene.getState().nodes, living.id)
    expect(Math.round(r.W / 304.8 * 10) / 10).toBe(15) // room frame keeps its own width
    expect(r.walls).toBe(4)
  })
})
