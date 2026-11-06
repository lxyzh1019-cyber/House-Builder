// A saved project opens with its own rooms, whatever else it has or lacks (regression: rooms were replaced
// by the starting rooms when a project had no trace or no budget).
import { describe, expect, it } from 'vitest'
import { startFrom } from '../src/load.js'
import { newRoom } from '../src/rooms/types.js'

describe('opening a project', () => {
  const mine = [newRoom('kid'), newRoom('dining')]
  it.each([
    ['rooms only', { rooms: mine }],
    ['rooms and a trace, no budget', { rooms: mine, trace: { levels: [], checks: [] } }],
    ['rooms and a budget, no trace', { rooms: mine, budget: { goal: 1 } }],
    ['rooms, trace and budget', { rooms: mine, trace: { levels: [], checks: [] }, budget: { goal: 1 } }],
  ])('keeps the saved rooms: %s', (_, data) => {
    const p = startFrom(data)
    expect(p.isNew).toBe(false)
    expect(p.rooms).toEqual(mine) // read through fromSaved (v1.3 rooms come back unchanged)
    if (data.trace) expect(p.trace).toBe(data.trace)
    if (data.budget) expect(p.budget).toBe(data.budget)
  })
  it('a new project starts with the living room and the office', () => {
    for (const data of [null, {}, { rooms: [] }, { budget: { goal: 5 } }]) {
      const p = startFrom(data)
      expect(p.isNew).toBe(true)
      expect(p.rooms.map((r) => r.type)).toEqual(['living', 'office'])
    }
  })
})

// chat-D41: a room saved before SPEC v1.3 keeps its type, name, set size, place and ports; its contents
// reset to the v1.3 preset, keeping the answers that still exist. Old rule ids carry over (migrateRules).
describe('rooms saved before v1.3', () => {
  const old = {
    id: 'r1', type: 'living', name: 'Family room', preset: 'Small den', size: { w: 6, d: 5 }, place: { x: 1, y: 2, rot: 90 }, ports: { n: 'wall', e: 'open', s: 'door', w: 'wall' },
    answers: { seats: '2-3', tv: '65', open: 'yes', storage: 'shelf', sofaBed: 'no' }, items: [{ id: 'x', libId: 'f2-15', role: 'main', w: 2000, d: 900 }],
  }
  it('keeps type, name, size, place and ports; resets contents; keeps TV 65 and open', () => {
    const [r] = startFrom({ rooms: [old] }).rooms
    expect(r).toMatchObject({ id: 'r1', type: 'living', name: 'Family room', size: old.size, place: old.place, ports: old.ports, preset: 'living_tv', level: 'main' })
    expect(r.options).toMatchObject({ seats: '6-8', tv_in: 65, open: true })
    expect(r.answers).toBeUndefined()
    expect(r.items.some((i) => i.id === 'x')).toBe(false)
    expect(r.items.find((i) => i.part === 'tv').libId).toBe('app-tv65')
  })
  it('an old office keeps its desk, people, shelf and guest answers; a 4 ft desk falls back to 6 ft', () => {
    const [o] = startFrom({ rooms: [{ id: 'o', type: 'office', name: 'Office', answers: { people: '2', desk: '4', storage: 'none', guest: 'yes' }, items: [] }] }).rooms
    expect(o.options).toMatchObject({ desks: 2, desk_len: 6, shelf: false, sofa_bed: true })
  })
  it('old rule ids carry their values over; dropped rows go', () => {
    const p = startFrom({ rooms: [old], rules: { walkway: 3.5, tvStand: 2, sizeStep: 1, rateLow: 190 } })
    expect(p.rules).toEqual({ walkway_main: 3.5, rateLow: 190 })
  })
})
