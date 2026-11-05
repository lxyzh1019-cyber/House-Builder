// Size engine (SPEC §6 R4–R7, chat-D16, chat-D21). Pure functions, no React, no Pascal.
// Sizes in ft unless named *Mm. Items carry mm sizes (furniture library unit).
import { ruleValues } from '../rules.js'
import { mmToFt, ftToMm, roundUp } from '../units.js'
import { byId } from '../furniture/library.js'

export const ROOM_PLAIN = new Set(['garage', 'kitchen', 'backkitchen'])

const ft = (mm) => mmToFt(mm)
const ofRole = (room, role) => room.items.filter((i) => i.role === role)
const tvDiagIn = (tv) => tv.diagIn ?? (tv.w / 25.4) * (Math.hypot(16, 9) / 16)
const sum = (xs) => xs.reduce((a, b) => a + b, 0)

// Walkway after sharing with an open neighbour (R10): minus the shared strip.
// Is the main walkway shared with an open neighbour (R10)? On the lot board the lot decides (ctx.shared:
// an open side touching a neighbour's open side); off the lot the room's own "open" answer does.
export const isShared = (room, ctx) => (ctx && typeof ctx.shared === 'boolean' ? ctx.shared : room.answers?.open === 'yes')
const walkOf = (room, R, ctx) => (room.type === 'living' && isShared(room, ctx) ? Math.max(0, R.walkway - R.sharedStrip) : R.walkway)

// Items lined along the right wall (role "extra"): the strip adds their depth to the width and
// the room must be at least as deep as they are long together.
function addExtras(room, w, d) {
  const ex = ofRole(room, 'extra')
  if (!ex.length) return [w, d]
  return [w + Math.max(...ex.map((e) => ft(e.d))), Math.max(d, sum(ex.map((e) => ft(e.w))))]
}

// Unrounded minimum (ft) for each room type.
function rawMinimum(room, R, ctx) {
  const walk = walkOf(room, R, ctx)
  if (ROOM_PLAIN.has(room.type)) {
    // Plain rooms (garage, kitchen, back kitchen) have no contents to size them yet: their size is the one typed.
    return room.size ? { w: room.size.w / 0.3048, d: room.size.d / 0.3048 } : { w: 0, d: 0 }
  }
  let w = 0, d = 0
  if (room.type === 'living') {
    const seats = [...ofRole(room, 'main'), ...ofRole(room, 'side')]
    const main = seats[0], sides = seats.slice(1)
    const tv = ofRole(room, 'tv')[0], stand = ofRole(room, 'tvstand')[0]
    if (tv) {
      w = main ? ft(main.w) + sum(sides.map((s) => ft(s.d))) + R.seatGap * sides.length : 0
      w = Math.max(w, stand ? ft(stand.w) : 0, ft(tv.w))
      d = R.tvStand + (R.tvRatio * tvDiagIn(tv)) / 12 + walk
    } else {
      const facing = sides[0], rest = sides.slice(1)
      w = Math.max(main ? ft(main.w) : 0, facing ? ft(facing.w) : 0) + sum(rest.map((s) => ft(s.d))) + R.seatGap * rest.length
      d = (main ? ft(main.d) : 0) + (facing ? R.facingSeats + ft(facing.d) : 0) + walk
    }
  } else if (room.type === 'office') {
    const desks = ofRole(room, 'desk')
    w = sum(desks.map((x) => ft(x.w)))
    d = (desks.length ? Math.max(...desks.map((x) => ft(x.d))) + R.deskChair : 0) + walk + (ofRole(room, 'shelf').length ? R.shelfWall : 0)
  } else if (room.type === 'dining') {
    const t = ofRole(room, 'table')[0]
    w = t ? ft(t.w) + 2 * R.diningChair : 0
    d = t ? ft(t.d) + 2 * R.diningChair : 0
  } else if (room.type === 'primary') {
    const b = ofRole(room, 'bed')[0]
    w = b ? ft(b.w) + 2 * R.bedSide : 0
    d = b ? ft(b.d) + walk : walk
  } else if (room.type === 'kid') {
    const b = ofRole(room, 'kidbed')[0], desk = ofRole(room, 'deskside')[0]
    w = (b ? ft(b.w) + R.bedSide : 0) + (desk ? ft(desk.d) + R.deskChair : 0)
    d = Math.max(b ? ft(b.d) + walk : walk, desk ? ft(desk.w) : 0)
  } else if (room.type === 'mudroom') {
    const items = ofRole(room, 'wall')
    w = sum(items.map((x) => ft(x.w)))
    d = (items.length ? Math.max(...items.map((x) => ft(x.d))) : 0) + walk
  }
  ;[w, d] = addExtras(room, w, d)
  if (room.type === 'office') { w = Math.max(w, R.officeMinSide); d = Math.max(d, R.officeMinSide) }
  return { w, d }
}

// R4: the smallest rectangle (ft) where the items fit with their clearances, rounded up to the size step.
export function minimumSize(room, overrides, ctx) {
  const R = ruleValues(overrides)
  const raw = rawMinimum(room, R, ctx)
  return { w: roundUp(raw.w, R.sizeStep), d: roundUp(raw.d, R.sizeStep), raw }
}

// chat-D16: a plain rectangle, tried either way round. Returns the orientation with the smaller shortfall.
function compare(min, W, D) {
  const a = { turned: false, shortW: Math.max(0, min.w - W), shortD: Math.max(0, min.d - D) }
  const b = { turned: true, shortW: Math.max(0, min.d - W), shortD: Math.max(0, min.w - D) }
  const tot = (o) => o.shortW + o.shortD
  return tot(b) < tot(a) - 1e-9 ? b : a
}
const fits = (min, W, D) => { const c = compare(min, W, D); return c.shortW < 1e-9 && c.shortD < 1e-9 }

// Candidate changes for "smallest changes that fit" (R6): remove or shrink items.
const TV_STEPS = [85, 75, 65, 55]
function candidateChanges(room) {
  const ops = []
  const seen = new Set()
  for (const it of room.items) {
    if (!['side', 'extra', 'shelf', 'deskside', 'wall'].includes(it.role)) continue
    if (seen.has(it.name)) continue
    seen.add(it.name)
    ops.push({ key: `rm:${it.name}`, label: `Remove one ${it.name}`, msg: ['chg.remove', { name: it.name }], apply: (r) => { const i = r.items.findIndex((x) => x.name === it.name); return i < 0 ? null : { ...r, items: r.items.filter((_, k) => k !== i) } } })
  }
  const tv = room.items.find((i) => i.role === 'tv')
  if (tv) {
    const next = TV_STEPS.find((s) => s < Math.round(tvDiagIn(tv)))
    if (next) ops.push({ key: 'tv', label: `Smaller TV: ${next} in`, msg: ['chg.tv', { n: next }], apply: (r) => ({ ...r, items: r.items.map((i) => (i.role === 'tv' ? { ...i, ...pick(byId(`app-tv${next}`)) } : i)) }) })
  }
  if (room.type === 'living' && room.answers?.open !== 'yes') ops.push({ key: 'open', label: 'Open it to the next room (shares the walkway)', msg: ['chg.open'], apply: (r) => ({ ...r, answers: { ...r.answers, open: 'yes' } }) })
  const desk = room.items.find((i) => i.role === 'desk')
  if (desk) {
    const feet = Math.round(ft(desk.w))
    if (feet > 4) ops.push({ key: 'desk', label: `Shorter desk: ${feet - 1} ft`, msg: ['chg.desk', { n: feet - 1 }], apply: (r) => ({ ...r, items: r.items.map((i) => (i.role === 'desk' ? { ...i, ...pick(byId(`app-desk${feet - 1}`)) } : i)) }) })
  }
  const bed = room.items.find((i) => i.libId === 'app-king' || i.libId === 'app-full')
  if (bed) {
    const smaller = bed.libId === 'app-king' ? 'app-queen' : 'app-twin'
    ops.push({ key: 'bed', label: `Smaller bed: ${byId(smaller).name}`, msg: ['chg.bed', { name: byId(smaller).name }], apply: (r) => ({ ...r, items: r.items.map((i) => (i.id === bed.id ? { ...i, ...pick(byId(smaller)) } : i)) }) })
  }
  const table = room.items.find((i) => i.role === 'table')
  if (table && table.libId !== 'f2-32') {
    const smaller = table.libId === 'app-table8' ? 'f2-33' : 'f2-32'
    ops.push({ key: 'table', label: `Smaller table: ${byId(smaller).name}`, msg: ['chg.table', { name: byId(smaller).name }], apply: (r) => ({ ...r, items: r.items.map((i) => (i.id === table.id ? { ...i, ...pick(byId(smaller)) } : i)) }) })
  }
  return ops
}
const pick = (lib) => ({ libId: lib.id, name: lib.name, w: lib.w, d: lib.d, ...(lib.diagIn ? { diagIn: lib.diagIn } : {}) })

// R6: the smallest sets of changes (1 or 2 changes) after which the room fits W x D.
export function smallestChanges(room, W, D, overrides, limit = 3, ctx) {
  const ops = candidateChanges(room).filter((o) => !(o.key === 'open' && ctx && typeof ctx.shared === 'boolean'))
  const found = []
  const tryOps = (list) => {
    let r = room
    for (const op of list) { r = op.apply(r); if (!r) return null }
    const m = minimumSize(r, overrides, ctx)
    return fits(m, W, D) ? { changes: list.map((o) => o.label), msgs: list.map((o) => o.msg), min: m, turned: compare(m, W, D).turned } : null
  }
  for (const op of ops) { const f = tryOps([op]); if (f) found.push(f) }
  const singles = new Set(found.map((f) => f.changes[0]))
  for (let i = 0; i < ops.length; i++) for (let j = i; j < ops.length; j++) {
    if (singles.has(ops[i].label) || singles.has(ops[j].label)) continue
    if (i === j && !ops[i].key.startsWith('rm:')) continue
    if (i === j && room.items.filter((x) => `rm:${x.name}` === ops[i].key).length < 2) continue
    const f = tryOps([ops[i], ops[j]])
    if (f) found.push(f)
  }
  found.sort((a, b) => a.changes.length - b.changes.length || b.min.w * b.min.d - a.min.w * a.min.d)
  return found.slice(0, limit)
}

// R5–R7: "Check my size".
export function checkSize(room, W, D, overrides, ctx) {
  const R = ruleValues(overrides)
  const min = minimumSize(room, overrides, ctx)
  const c = compare(min, W, D)
  if (c.shortW > 1e-9 || c.shortD > 1e-9) {
    return { status: 'too-small', min, W, D, shortW: c.shortW, shortD: c.shortD, turned: c.turned, changes: smallestChanges(room, W, D, overrides, 3, ctx) }
  }
  const spare = W * D - min.w * min.d
  return { status: 'fits', min, W, D, turned: c.turned, spare, costLow: spare * R.rateLow, costHigh: spare * R.rateHigh }
}

// Notes the room needs (sofa bed → egress window if anyone sleeps there), as [key, params] for src/i18n.js.
export function roomNotes(room, overrides) {
  const R = ruleValues(overrides)
  const notes = []
  if (room.items.some((i) => i.sofaBed)) notes.push(['note.sofaBed', { ft: R.sofaBedOpen }])
  return notes
}

// Default positions (mm, origin at the top-left inside corner; x along the width, y along the depth).
// Returns { place: { [itemId]: { cx, cy, rot } }, walkways: [{ x, y, w, d, label }] }.
export function layoutRoom(room, Wft, Dft, overrides, ctx) {
  const R = ruleValues(overrides)
  const W = ftToMm(Wft), D = ftToMm(Dft), walk = ftToMm(walkOf(room, R, ctx))
  const place = {}, walkways = []
  const put = (it, cx, cy, rot = 0) => { place[it.id] = { cx: Math.round(cx), cy: Math.round(cy), rot } }
  const extras = ofRole(room, 'extra')
  const stripW = extras.length ? Math.max(...extras.map((e) => e.d)) : 0
  const innerW = W - stripW
  let y = 0
  for (const e of extras) { put(e, W - e.d / 2, y + e.w / 2, 90); y += e.w }

  if (room.type === 'living') {
    const seats = [...ofRole(room, 'main'), ...ofRole(room, 'side')]
    const main = seats[0], sides = seats.slice(1)
    const tv = ofRole(room, 'tv')[0], stand = ofRole(room, 'tvstand')[0]
    const gap = ftToMm(R.seatGap)
    if (tv) {
      const back = ftToMm(R.tvStand + (R.tvRatio * tvDiagIn(tv)) / 12)
      if (stand) put(stand, innerW / 2, stand.d / 2)
      put(tv, innerW / 2, stand ? stand.d / 2 : tv.d / 2)
      if (main) {
        put(main, innerW / 2, back - main.d / 2)
        const left = innerW / 2 - main.w / 2, right = innerW / 2 + main.w / 2
        sides.forEach((s, k) => {
          const onLeft = k % 2 === 0
          put(s, onLeft ? left - gap - s.d / 2 : right + gap + s.d / 2, back - s.w / 2, 90)
        })
        walkways.push({ x: 0, y: back, w: innerW, d: walk, label: 'walkway' })
        const table = ofRole(room, 'free').find((i) => i.type === 'coffeetable')
        if (table) put(table, innerW / 2, ((stand ? stand.d : 0) + back - main.d) / 2)
      }
    } else if (main) {
      const facing = sides[0], rest = sides.slice(1)
      if (facing) put(facing, innerW / 2, facing.d / 2, 180)
      const back = (facing ? facing.d + ftToMm(R.facingSeats) : 0) + main.d
      put(main, innerW / 2, back - main.d / 2)
      rest.forEach((s, k) => put(s, k % 2 === 0 ? innerW / 2 - main.w / 2 - gap - s.d / 2 : innerW / 2 + main.w / 2 + gap + s.d / 2, back - s.w / 2, 90))
      walkways.push({ x: 0, y: back, w: innerW, d: walk, label: 'walkway' })
      const table = ofRole(room, 'free').find((i) => i.type === 'coffeetable')
      if (table) put(table, innerW / 2, back - main.d - ftToMm(R.facingSeats) / 2)
    }
  } else if (room.type === 'office') {
    const desks = ofRole(room, 'desk'), chairs = ofRole(room, 'free').filter((i) => i.type === 'officechair')
    let x = 0
    desks.forEach((dk, k) => { put(dk, x + dk.w / 2, dk.d / 2); if (chairs[k]) put(chairs[k], x + dk.w / 2, dk.d + chairs[k].d / 2 + 100); x += dk.w })
    const deskD = desks.length ? Math.max(...desks.map((x) => x.d)) : 0
    const shelf = ofRole(room, 'shelf')[0]
    if (shelf) put(shelf, innerW / 2, D - shelf.d / 2)
    const top = deskD + (desks.length ? ftToMm(R.deskChair) : 0)
    walkways.push({ x: 0, y: top, w: innerW, d: walk, label: 'walkway' })
  } else if (room.type === 'dining') {
    const t = ofRole(room, 'table')[0], chairs = ofRole(room, 'free').filter((i) => i.type === 'chair')
    if (t) {
      const cx = innerW / 2, cy = D / 2
      put(t, cx, cy)
      const ends = chairs.length >= 8 ? 2 : 0, perSide = Math.ceil((chairs.length - ends) / 2)
      chairs.forEach((c, k) => {
        if (k < perSide) put(c, cx - t.w / 2 + (t.w / perSide) * (k + 0.5), cy - t.d / 2 - c.d / 2 + 120, 180)
        else if (k < 2 * perSide && k < chairs.length - ends) put(c, cx - t.w / 2 + (t.w / perSide) * (k - perSide + 0.5), cy + t.d / 2 + c.d / 2 - 120)
        else put(c, k === chairs.length - 1 ? cx + t.w / 2 + c.d / 2 - 120 : cx - t.w / 2 - c.d / 2 + 120, cy, 90)
      })
      const s = ftToMm(R.diningChair)
      walkways.push({ x: cx - t.w / 2 - s, y: cy - t.d / 2 - s, w: t.w + 2 * s, d: t.d + 2 * s, label: 'chair space', ring: { x: cx - t.w / 2, y: cy - t.d / 2, w: t.w, d: t.d } })
    }
  } else if (room.type === 'primary') {
    const b = ofRole(room, 'bed')[0], stands = ofRole(room, 'free').filter((i) => i.type === 'nightstand')
    if (b) {
      put(b, innerW / 2, b.d / 2)
      stands.forEach((s, k) => put(s, k === 0 ? innerW / 2 - b.w / 2 - s.w / 2 - 50 : innerW / 2 + b.w / 2 + s.w / 2 + 50, s.d / 2))
      walkways.push({ x: 0, y: b.d, w: innerW, d: walk, label: 'walkway' })
    }
  } else if (room.type === 'kid') {
    const b = ofRole(room, 'kidbed')[0], desk = ofRole(room, 'deskside')[0], stand = ofRole(room, 'free').find((i) => i.type === 'nightstand')
    if (b) { put(b, b.w / 2, b.d / 2); if (stand) put(stand, b.w + stand.w / 2 + 50, stand.d / 2); walkways.push({ x: 0, y: b.d, w: b.w + ftToMm(R.bedSide), d: walk, label: 'walkway' }) }
    if (desk) put(desk, innerW - desk.d / 2, desk.w / 2, 90)
  } else if (room.type === 'mudroom') {
    let x = 0
    const items = ofRole(room, 'wall')
    for (const it of items) { put(it, x + it.w / 2, it.d / 2); x += it.w }
    const deep = items.length ? Math.max(...items.map((i) => i.d)) : 0
    walkways.push({ x: 0, y: deep, w: innerW, d: walk, label: 'walkway' })
  }
  // Anything not placed yet (hand-added items): centre of the room.
  for (const it of room.items) if (!place[it.id]) put(it, innerW / 2, D / 2)
  // Positions the user dragged win over the default layout.
  for (const it of room.items) if (it.pos) place[it.id] = { ...it.pos }
  return { place, walkways, W, D }
}
