// Batch A (SPEC §13): schedule view, liked floor plans, cheap wins, plan versions, idea inbox, decision cards,
// hidden works and build tracking. Pure functions over plain data; each is a field of the project document
// (chat-D40 style): schedule, likedPlans, cheapWins, versions, ideas, decisions, hiddenWorks, build.
// The project's `plan` field holds everything here but versions, which have their own field.
export const newPlan = () => ({ schedule: { gates: {} }, likedPlans: [], checklist: [], cheapWins: [], ideas: [], decisions: [], hiddenWorks: [], build: { changeOrders: [], stageCost: {}, photos: {} } })

let n = 0
export const pid = (p = 'p') => `${p}${Date.now().toString(36)}${(n++).toString(36)}`
const stamp = (by, at = new Date().toISOString()) => ({ by: by || null, at })

// ---- 13.1 Schedule view: the 7 stages and the 19 gates exactly as SPEC §1 lists them (no D2, D3). ----
export const STAGES = [
  { n: 0, gates: [] },
  { n: 1, gates: ['D1'] },
  { n: 2, gates: ['D4', 'D5'] },
  { n: 3, gates: ['D7', 'D8', 'D9', 'D6'] },
  { n: 4, gates: ['D18', 'D19', 'D10', 'D11', 'D12'] },
  { n: 5, gates: ['D13', 'D14', 'D15', 'D16', 'D17', 'D21'] },
  { n: 6, gates: ['D20'] },
]
export const GATE_STATUS = ['open', 'passed', 'na']
export const newSchedule = () => ({ gates: {} })
export const gateOf = (schedule, id) => schedule?.gates?.[id] || { status: 'open' }
export function setGate(schedule, id, status, by, note) {
  const g = gateOf(schedule, id)
  return { ...schedule, gates: { ...(schedule?.gates || {}), [id]: { ...g, status, note: note ?? g.note ?? '', ...stamp(by) } } }
}
// A stage is done when every gate in it is passed or not needed (Stage 0 has no gate: never "done" by itself).
export const stageDone = (schedule, stage) => stage.gates.length > 0 && stage.gates.every((id) => gateOf(schedule, id).status !== 'open')
// D5 "estimate within budget" reads the budget meter: 'ok' (within the goal at the high total), 'lowOnly'
// (within only at the low total), 'over', or 'noGoal'.
export function d5Verdict(bs) {
  if (!bs?.left) return 'noGoal'
  if (bs.overAtLow) return 'over'
  if (bs.over) return 'lowOnly'
  return 'ok'
}

// ---- 13.2 Liked floor plans with "why I like it", and the plan checklist. ----
export const newLikedPlan = (name = '') => ({ id: pid('lp'), name, source: '', reasons: [] })
export const addReason = (plan, text) => ({ ...plan, reasons: [...plan.reasons, { id: pid('r'), text, toChecklist: false }] })
export function sendToChecklist(plans, checklist, planId, reasonId) {
  const plan = plans.find((p) => p.id === planId), r = plan?.reasons.find((x) => x.id === reasonId)
  if (!r || checklist.some((c) => c.reasonId === reasonId)) return { plans, checklist }
  return {
    plans: plans.map((p) => (p.id === planId ? { ...p, reasons: p.reasons.map((x) => (x.id === reasonId ? { ...x, toChecklist: true } : x)) } : p)),
    checklist: [...checklist, { id: pid('ck'), reasonId, planName: plan.name, text: r.text, status: 'open', roomId: null }],
  }
}
export const CHECK_STATUS = ['open', 'met', 'dropped']

// ---- 13.3 Cheap wins, kept when the budget is tight. ----
export const WIN_STATUS = ['idea', 'keep', 'done']
export const newWin = () => ({ id: pid('cw'), name: '', cost: null, note: '', status: 'idea' })
// Shown on the Budget tab when the meter is over the goal (at either total): the ones marked keep.
export const keptWins = (wins, bs) => (bs?.left && (bs.over || bs.overAtLow) ? (wins || []).filter((w) => w.status === 'keep') : [])

// ---- 13.4 Plan versions: a copy of the design (not the 3D scene, not the trace picture). At most 20. ----
export const MAX_VERSIONS = 20
const KEEP = ['rooms', 'answers', 'lot', 'clusters', 'budget']
export function saveVersion(versions, design, name, by) {
  const list = versions || []
  if (list.length >= MAX_VERSIONS) return { versions: list, full: true }
  const copy = Object.fromEntries(KEEP.map((k) => [k, structuredClone(design[k] ?? null)]))
  return { versions: [...list, { id: pid('v'), name: name || `Version ${list.length + 1}`, ...stamp(by), design: copy }], full: false }
}
const sizeKey = (r) => (r.size ? `${r.size.w.toFixed(4)}x${r.size.d.toFixed(4)}` : 'min')
// Compare: rooms added, removed and resized (old -> new size in metres, null = its minimum).
export function compareVersions(a, b) {
  const A = a.design.rooms || [], B = b.design.rooms || []
  const byId = (list) => Object.fromEntries(list.map((r) => [r.id, r]))
  const ia = byId(A), ib = byId(B)
  return {
    added: B.filter((r) => !ia[r.id]).map((r) => ({ id: r.id, name: r.name })),
    removed: A.filter((r) => !ib[r.id]).map((r) => ({ id: r.id, name: r.name })),
    resized: B.filter((r) => ia[r.id] && sizeKey(ia[r.id]) !== sizeKey(r)).map((r) => ({ id: r.id, name: r.name, from: ia[r.id].size || null, to: r.size || null })),
  }
}
// Restore: the current design is saved as a version first, then the version's design comes back.
export function restoreVersion(versions, current, versionId, by) {
  const v = (versions || []).find((x) => x.id === versionId)
  if (!v) return null
  const saved = saveVersion(versions, current, `Before restoring ${v.name}`, by)
  return { versions: saved.versions, full: saved.full, design: structuredClone(v.design) }
}

// ---- 13.5 Idea loop inbox: captured -> sorted -> analysed -> shown -> decided -> applied. ----
export const IDEA_STEPS = ['captured', 'sorted', 'analysed', 'shown', 'decided', 'applied']
export const DECISIONS = ['keep', 'drop', 'later']
export const newIdea = (text, by, tag = '') => ({ id: pid('id'), text, tag, status: 'captured', decision: null, history: [{ status: 'captured', ...stamp(by) }] })
// One step forward at a time. At "decided" the idea gets keep / drop / later; only a kept idea goes on to applied.
export function moveIdea(idea, by, decision) {
  const i = IDEA_STEPS.indexOf(idea.status)
  if (i < 0 || i === IDEA_STEPS.length - 1) return idea
  const next = IDEA_STEPS[i + 1]
  if (next === 'decided' && !DECISIONS.includes(decision)) return idea
  if (next === 'applied' && idea.decision !== 'keep') return idea
  return { ...idea, status: next, decision: next === 'decided' ? decision : idea.decision, history: [...idea.history, { status: next, ...(next === 'decided' ? { decision } : {}), ...stamp(by) }] }
}
export const countByStatus = (ideas) => Object.fromEntries(IDEA_STEPS.map((s) => [s, (ideas || []).filter((x) => x.status === s).length]))

// ---- 13.6 Decision cards with "+ New comparison". ----
export const DEFAULT_CRITERIA = ['cost', 'effort', 'undo']
export const newCard = (question = '', criteria = DEFAULT_CRITERIA.map((k) => ({ id: pid('c'), key: k, label: '' }))) => ({ id: pid('dc'), question, options: [], criteria, cells: {}, pick: null, why: '', status: 'open', versionId: null })
export const copyCriteria = (card) => newCard('', card.criteria.map((c) => ({ ...c, id: pid('c') })))
export const addOption = (card, name) => (card.options.length >= 5 ? card : { ...card, options: [...card.options, { id: pid('o'), name }] })
export const setCell = (card, optionId, criterionId, text) => ({ ...card, cells: { ...card.cells, [`${optionId}|${criterionId}`]: text } })
export function decideCard(card, optionId, why, by) {
  if (card.options.length < 2 || !card.options.some((o) => o.id === optionId)) return card
  return { ...card, pick: optionId, why, status: 'decided', ...stamp(by) }
}

// ---- 13.7 Hidden works: behind walls and floors, decided in one stage and built in another. ----
export const HIDDEN_KINDS = ['plumbing', 'wiring', 'ducts', 'insulation', 'blocking', 'other']
export const newHidden = () => ({ id: pid('hw'), kind: 'plumbing', text: '', roomId: null, decideStage: 2, buildStage: 5, status: 'open', photographed: false })
export const hiddenInStage = (items, stageN) => (items || []).filter((h) => Number(h.decideStage) === stageN || Number(h.buildStage) === stageN)
export const notPhotographed = (items) => (items || []).filter((h) => !h.photographed)

// ---- 13.8 Build tracking: change orders, stage cost, photo and video record before drywall. ----
export const newBuild = () => ({ changeOrders: [], stageCost: {}, photos: {} })
export const newChangeOrder = () => ({ id: pid('co'), text: '', amount: null, date: new Date().toISOString().slice(0, 10), approved: false })
export function stageDiff(build, stageN) {
  const c = build?.stageCost?.[stageN] || {}
  const p = Number.isFinite(c.planned) ? c.planned : null, a = Number.isFinite(c.actual) ? c.actual : null
  return { planned: p, actual: a, diff: p != null && a != null ? a - p : null }
}
export const photoCount = (build, rooms) => (rooms || []).filter((r) => build?.photos?.[r.id]?.done).length
