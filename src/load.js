// What a loaded project starts the screens with. One place, tested (test/load.test.js), so a saved project's
// rooms are never swapped for the starting rooms because some other part (trace, budget) is missing.
import { newRoom } from './rooms/types.js'
import { newLot } from './lot/lot.js'
import { newTrace } from './trace/trace.js'
import { newBudget } from './budget/budget.js'

export function startFrom(data) {
  const saved = !!data?.rooms?.length
  const rooms = saved ? data.rooms : [newRoom('living', 'Family TV room'), newRoom('office', 'Home office')]
  return {
    isNew: !saved,
    rooms,
    rules: data?.rules || {},
    lot: data?.lot || newLot(data?.rules),
    clusters: data?.clusters || [],
    trace: data?.trace || newTrace(),
    budget: data?.budget || newBudget(),
  }
}
