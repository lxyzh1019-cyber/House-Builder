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
