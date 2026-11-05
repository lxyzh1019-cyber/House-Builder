// Store metres (Pascal) and mm (furniture sizes from Furnish2); show feet and inches.
export const M_PER_FT = 0.3048
export const ftToM = (ft) => ft * M_PER_FT
export const mToFt = (m) => m / M_PER_FT
export const mmToFt = (mm) => mm / 304.8
export const ftToMm = (ft) => ft * 304.8

// 13.5 -> 13' 6"
export function ftIn(ft) {
  let f = Math.floor(ft + 1e-9), i = Math.round((ft - f) * 12)
  if (i === 12) { f += 1; i = 0 }
  return `${f}′ ${i}″`
}
export const ft1 = (ft) => (Math.round(ft * 10) / 10).toFixed(1)
export const sizeFt = (w, d) => `${ft1(w)} x ${ft1(d)} ft`
// Round up to the next step (the size step rule); the epsilon absorbs float noise like 13.250000000000002.
export const roundUp = (x, step) => Math.ceil(x / step - 1e-9) * step
