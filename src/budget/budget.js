// Budget meter (SPEC §8): every line is typed by the user and shown; nothing is hidden.
// budget = { goal, lotPrice, lotInGoal, soft: [{ id, name, amount }], contingencyPct } (C$; blank = null).
// Build rates are the Rules table rows rateLow / rateHigh (one home for each number).
// Area counted = the rooms placed on the Lot board (their sizes); rooms not on the lot are listed, not counted.
// Contingency is a % of the build cost only (DN8 = A, owner 2026-11-05). The lot counts inside the goal by
// default (chat-D7); total = build + contingency + soft costs (+ lot when in the goal); left = goal − total.
import { ruleValues } from '../rules.js'

let n = 0
export const bid = () => `s${Date.now().toString(36)}${(n++).toString(36)}`
export const newBudget = () => ({ goal: null, lotPrice: null, lotInGoal: true, soft: [], contingencyPct: null })
const num = (v) => (Number.isFinite(v) ? v : 0)

export function budgetState(budget, rooms, st, overrides) {
  const b = { ...newBudget(), ...(budget || {}) }
  const R = ruleValues(overrides)
  const counted = [], notCounted = []
  let area = 0
  for (const r of rooms) {
    const s = st?.[r.id]
    if (r.place && s?.size) { counted.push(r.id); area += s.size.w * s.size.d } else notCounted.push(r.id)
  }
  const build = { lo: area * R.rateLow, hi: area * R.rateHigh }
  const pct = num(b.contingencyPct) / 100
  const cont = { lo: build.lo * pct, hi: build.hi * pct }
  const soft = b.soft.reduce((s, x) => s + num(x.amount), 0)
  const lot = b.lotInGoal ? num(b.lotPrice) : 0
  const total = { lo: build.lo + cont.lo + soft + lot, hi: build.hi + cont.hi + soft + lot }
  const hasGoal = Number.isFinite(b.goal)
  const left = hasGoal ? { lo: b.goal - total.lo, hi: b.goal - total.hi } : null // lo = left at the low rate
  return { area, counted, notCounted, rates: { lo: R.rateLow, hi: R.rateHigh }, build, cont, soft, lot, total, left, over: !!left && left.hi < 0, overAtLow: !!left && left.lo < 0 }
}
