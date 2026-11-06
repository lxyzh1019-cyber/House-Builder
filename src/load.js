// What a loaded project starts the screens with. One place, tested (test/load.test.js), so a saved project's
// rooms are never swapped for the starting rooms because some other part (trace, budget) is missing.
import { newRoom } from './rooms/types.js'
import { fromSaved } from './rooms/migrate.js'
import { migrateRules } from './rules.js'
import { newLot } from './lot/lot.js'
import { newTrace } from './trace/trace.js'
import { newBudget } from './budget/budget.js'

// Stage 0 setup (SPEC §12): name, new build or renovation, city, household. Blank until typed.
export const newSetup = () => ({ name: '', type: 'new', city: '', household: [] })

export function startFrom(data) {
  const saved = !!data?.rooms?.length
  const rooms = saved ? data.rooms.map(fromSaved) : [newRoom('living'), newRoom('office')]
  return {
    isNew: !saved,
    rooms,
    rules: migrateRules(data?.rules || {}),
    answers: data?.answers || {},
    lot: data?.lot || newLot(migrateRules(data?.rules || {})),
    clusters: data?.clusters || [],
    trace: data?.trace || newTrace(),
    budget: data?.budget || newBudget(),
    setup: { ...newSetup(), ...(data?.setup || {}) },
  }
}

// Which project to open: the one this browser opened last, else my first own project, else none (new).
export function pickProject(list, lastId) {
  return list.find((p) => p.id === lastId) || list.find((p) => p.role === 'owner') || null
}
