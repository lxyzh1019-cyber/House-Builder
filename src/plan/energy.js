// Batch E, reduced (SPEC §16, chat-D50). The NBC(AE) 2023 section 9.36 energy tiers (2nd printing, NRC;
// checked 2026-11-06) as a reference and a target-tier pick, and a 30-year cost calculator with no built-in life
// spans or price rise: the owner types them. Energy prices come from the Rules table rows (checked sources).
export const TIER_SOURCE = 'https://nrc-publications.canada.ca/eng/view/ft/?id=0316d953-0d55-4311-af69-cad55efec499&dp=2&dsl=en'

// Table 9.36.7.2 (performance path, houses): heat-loss reduction (must be met), then percent improvement OR
// percent house energy target. null = not applicable.
export const PERFORMANCE = {
  over300: [{ tier: 1, heatLoss: null, improve: 0, target: 100 }, { tier: 2, heatLoss: 5, improve: 10, target: 90 }, { tier: 3, heatLoss: 10, improve: 20, target: 80 }, { tier: 4, heatLoss: 20, improve: 40, target: 60 }, { tier: 5, heatLoss: 40, improve: 70, target: 30 }],
  upTo300: [{ tier: 1, heatLoss: null, improve: 0, target: 100 }, { tier: 2, heatLoss: 0, improve: 0, target: 100 }, { tier: 3, heatLoss: 5, improve: 10, target: 90 }, { tier: 4, heatLoss: 15, improve: 30, target: 70 }, { tier: 5, heatLoss: 25, improve: 60, target: 40 }],
}
// Table 9.36.8.2 (prescriptive path): tier 1 is the baseline (9.36.2–9.36.4, no points), tier 2 needs 10 energy
// conservation points, tiers 3–5 are reserved.
export const PRESCRIPTIVE = [{ tier: 1, points: 0 }, { tier: 2, points: 10 }, { tier: 3, points: null }, { tier: 4, points: null }, { tier: 5, points: null }]

// 30-year cost: yearly energy (kWh × ¢/kWh + GJ × $/GJ), plus each component replaced every lifeYears, all
// rising by escalationPct a year (typed). Items without a cost or life span are listed as missing, not counted.
export function lifecycle({ years = 30, kWh = null, elecCents = null, gasGJ = null, gasRate = null, escalationPct = null, items = [] }) {
  const e = Number.isFinite(escalationPct) ? escalationPct / 100 : null
  const grow = (y) => (e == null ? 1 : (1 + e) ** y)
  const energyYear = (Number.isFinite(kWh) && Number.isFinite(elecCents) ? (kWh * elecCents) / 100 : 0) + (Number.isFinite(gasGJ) && Number.isFinite(gasRate) ? gasGJ * gasRate : 0)
  let energy = 0
  for (let y = 0; y < years; y++) energy += energyYear * grow(y)
  const missing = [], counted = []
  let replace = 0
  for (const it of items) {
    if (!Number.isFinite(it.cost) || !Number.isFinite(it.life) || it.life <= 0) { missing.push(it.id); continue }
    let sum = 0
    for (let y = it.life; y < years; y += it.life) sum += it.cost * grow(y)
    replace += sum; counted.push({ id: it.id, sum })
  }
  return { energyYear, energy, replace, total: energy + replace, counted, missing, escalationMissing: e == null }
}
