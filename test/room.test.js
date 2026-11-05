import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import * as P from '@pascal-app/core'
import { builtinPlugin } from '@pascal-app/nodes'
import { buildRoom, nodesOfType, resizeRoom, roomSizeFt, sizeLabel, wallLengthsFt, SOFA_FT, mToFt } from '../src/room.js'
import { jsonToScene, sceneToJson } from '../src/scene-io.js'

beforeAll(async () => {
  await P.loadPlugin(builtinPlugin)
})

beforeEach(() => {
  P.useScene.getState().setScene({}, [])
  buildRoom()
})

const round1 = (xs) => xs.map((x) => Number(x.toFixed(1)))

describe('living room', () => {
  it('starts at 15.0 x 12.3 ft with 4 walls', () => {
    expect(sizeLabel(roomSizeFt())).toBe('15.0 x 12.3 ft')
    expect(round1(wallLengthsFt()).sort()).toEqual([12.3, 12.3, 15, 15])
  })

  it('has a 7.5 x 3 ft sofa box', () => {
    const sofa = nodesOfType('block')[0]
    const xs = sofa.topology.vertices.map((v) => v.position[0])
    const zs = sofa.topology.vertices.map((v) => v.position[2])
    expect(mToFt(Math.max(...xs) - Math.min(...xs))).toBeCloseTo(SOFA_FT.w, 3)
    expect(mToFt(Math.max(...zs) - Math.min(...zs))).toBeCloseTo(SOFA_FT.d, 3)
  })

  it('resizes the room and its 4 walls to 20 x 20 ft', () => {
    resizeRoom(20, 20)
    expect(sizeLabel(roomSizeFt())).toBe('20.0 x 20.0 ft')
    expect(round1(wallLengthsFt())).toEqual([20, 20, 20, 20])
  })

  it('save -> clear -> load round trip keeps 20 x 20 ft', () => {
    resizeRoom(20, 20)
    const json = sceneToJson()
    P.useScene.getState().setScene({}, [])
    expect(roomSizeFt()).toBeNull()
    jsonToScene(json)
    expect(sizeLabel(roomSizeFt())).toBe('20.0 x 20.0 ft')
    expect(round1(wallLengthsFt())).toEqual([20, 20, 20, 20])
    expect(nodesOfType('block')).toHaveLength(1)
  })
})
