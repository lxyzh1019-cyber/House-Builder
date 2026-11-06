// SPEC §16 reduced batch E, tests Y1–Y4 (Y2 save and reload in test/rules.test.js). Made-up amounts.
import { describe, expect, it } from 'vitest'
import * as E from '../src/plan/energy.js'
import { RULES } from '../src/rules.js'

describe('SPEC §16 energy tiers and 30-year cost', () => {
  it('Y1 the 9.36 tier tables as NBC(AE) 2023 states them', () => {
    expect(E.PERFORMANCE.over300.find((x) => x.tier === 3)).toEqual({ tier: 3, heatLoss: 10, improve: 20, target: 80 })
    expect(E.PERFORMANCE.upTo300.find((x) => x.tier === 5)).toEqual({ tier: 5, heatLoss: 25, improve: 60, target: 40 })
    expect(E.PRESCRIPTIVE.map((x) => x.points)).toEqual([0, 10, null, null, null])
    expect(RULES.find((r) => r.id === 'gasAtco')).toMatchObject({ value: 1.893, unit: '$/GJ', date: '2026-11-06' })
  })
  it('Y3 10,000 kWh at 12.06¢ for 30 years plus an 8,000 furnace lasting 20 years, no price rise: 44,180', () => {
    const r = E.lifecycle({ kWh: 10000, elecCents: 12.06, escalationPct: 0, items: [{ id: 'f', cost: 8000, life: 20 }] })
    expect(r.energyYear).toBeCloseTo(1206, 6); expect(r.energy).toBeCloseTo(36180, 6)
    expect(r.replace).toBeCloseTo(8000, 6); expect(r.total).toBeCloseTo(44180, 6)
    const g = E.lifecycle({ gasGJ: 100, gasRate: 2, escalationPct: 0 })
    expect(g.energy).toBeCloseTo(6000, 6)
  })
  it('Y3b with 2% a year the furnace at year 20 costs 8,000 × 1.02^20', () => {
    const r = E.lifecycle({ escalationPct: 2, items: [{ id: 'f', cost: 8000, life: 20 }] })
    expect(r.replace).toBeCloseTo(8000 * 1.02 ** 20, 6)
  })
  it('Y4 an item without a life span is listed as missing and not counted; no price rise typed is flagged', () => {
    const r = E.lifecycle({ items: [{ id: 'roof', cost: 15000, life: null }, { id: 'wh', cost: 2000, life: 12 }] })
    expect(r.missing).toEqual(['roof']); expect(r.replace).toBeCloseTo(4000, 6) // years 12 and 24
    expect(r.escalationMissing).toBe(true)
  })
})
