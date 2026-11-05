// Furniture geometry ported from Furnish2 (github.com/lxyzh1019-cyber/Furnish2, MIT; see THIRD_PARTY_NOTICES.md):
// rotated bounding box, overlap check (separating axis test with the same exceptions), wall snap and
// clearance-to-wall distances. Units: mm. An item is { id, type, cx, cy, w, d, rot } (rot in degrees).

export function aabb(f) {
  const a = (f.rot * Math.PI) / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a))
  return { hw: (f.w / 2) * c + (f.d / 2) * s, hh: (f.w / 2) * s + (f.d / 2) * c }
}

export function corners(f) {
  const a = (f.rot * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a), hw = f.w / 2, hd = f.d / 2
  return [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([x, y]) => [f.cx + x * c - y * s, f.cy + x * s + y * c])
}

// Two rotated rectangles overlap; touching or overlapping by less than 5 mm does not count (Furnish2 rule).
export function obbOverlap(a, b) {
  const A = corners(a), B = corners(b)
  for (const P of [A, B]) for (let i = 0; i < 2; i++) {
    const nx = P[i + 1][1] - P[i][1], ny = P[i][0] - P[i + 1][0], L = Math.hypot(nx, ny) || 1
    const pa = A.map((p) => (p[0] * nx + p[1] * ny) / L), pb = B.map((p) => (p[0] * nx + p[1] * ny) / L)
    if (Math.max(...pa) <= Math.min(...pb) + 5 || Math.max(...pb) <= Math.min(...pa) + 5) return false
  }
  return true
}

// Not overlap-checked: rugs, wall-hung or ceiling items, items standing on counters, plants. Chairs may sit under tables.
export const NO_OVERLAP_CHECK = new Set(['rug', 'pendant', 'acwall', 'wallart', 'curtain', 'mirror', 'tv', 'stove', 'ksink', 'dishwasher', 'plant'])
const SEATS = new Set(['chair', 'barstool', 'officechair', 'armchair'])
const TABLES = new Set(['table', 'roundtable', 'desk', 'island'])

// Returns [[idA, idB], ...] for every overlapping pair.
export function overlaps(items) {
  const L = items.filter((f) => !NO_OVERLAP_CHECK.has(f.type)), out = [], box = L.map(aabb)
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
    const a = L[i], b = L[j]
    if (Math.abs(a.cx - b.cx) >= box[i].hw + box[j].hw || Math.abs(a.cy - b.cy) >= box[i].hh + box[j].hh) continue
    if ((SEATS.has(a.type) && TABLES.has(b.type)) || (SEATS.has(b.type) && TABLES.has(a.type))) continue
    if (obbOverlap(a, b)) out.push([a.id, b.id])
  }
  return out
}

// Wall snap inside a rectangular room (0..W, 0..D, mm): an item edge within `tol` of a wall lands on it.
// Also keeps the item inside the room. Grid step as in Furnish2 (10 mm).
export function snapMove(f, cx, cy, W, D, tol = 150, grid = 10) {
  const { hw, hh } = aabb(f)
  let nx = Math.round(cx / grid) * grid, ny = Math.round(cy / grid) * grid
  for (const c of [hw, W - hw]) if (Math.abs(c - cx) < tol) nx = c
  for (const c of [hh, D - hh]) if (Math.abs(c - cy) < tol) ny = c
  nx = Math.min(Math.max(nx, Math.min(hw, W / 2)), Math.max(W - hw, W / 2))
  ny = Math.min(Math.max(ny, Math.min(hh, D / 2)), Math.max(D - hh, D / 2))
  return [Math.round(nx), Math.round(ny)]
}

// Clear distance from the item to each wall of the room (mm): { l, r, t, b }.
export function clearances(f, W, D) {
  const { hw, hh } = aabb(f)
  return { l: f.cx - hw, r: W - (f.cx + hw), t: f.cy - hh, b: D - (f.cy + hh) }
}

export const isOutside = (f, W, D) => {
  const { hw, hh } = aabb(f)
  return f.cx - hw < -5 || f.cy - hh < -5 || f.cx + hw > W + 5 || f.cy + hh > D + 5
}
