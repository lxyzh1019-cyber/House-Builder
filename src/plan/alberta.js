// Batch C (SPEC §14): Alberta and Red Deer facts, each opened on its official page and checked on 2026-11-06.
// Sources are kept with the facts so the app can show where each one comes from.
import { ftToM } from '../units.js'

export const CHECKED = '2026-11-06'
export const SRC = {
  code: 'https://nrc-publications.canada.ca/eng/view/object/?id=0316d953-0d55-4311-af69-cad55efec499',
  codeInForce: 'https://www.alberta.ca/building-codes-and-standards',
  permits: 'https://www.reddeer.ca/business/permits-and-inspections/residential-permits-and-applications/residential---new-build-and-additions/',
  dpList: 'https://www.reddeer.ca/media/reddeerca/business-in-red-deer/permits/june-2016-permit-forms/2024-Development-Permit-Application---RESIDENTIAL.pdf',
  bpList: 'https://www.reddeer.ca/media/reddeerca/business-in-red-deer/permits/june-2016-permit-forms/BP-App-Requirement-List---RESIDENTIAL.pdf',
  fees: 'https://www.reddeer.ca/business/permits-and-inspections/permit-fee-schedule/',
  bylaw: 'https://reddeer.ca/media/reddeerca/city-government/bylaws/land-use-bylaws/Red-Deer-Zoning-Bylaw-3357-2024---(Amended-June-9,-2026).pdf',
  map: 'https://www.reddeer.ca/about-red-deer/city-maps/interactive-city-map-web-map/',
  elec: 'https://www.reddeer.ca/city-services/electric-light-and-power/getting-electricity/rate-of-last-resort/',
  gas: 'https://ucahelps.alberta.ca/utility-choices/current-rates-and-pricing/default-rates/',
  cmhc: 'https://www.cmhc-schl.gc.ca/professionals/project-funding-and-mortgage-financing/mortgage-loan-insurance/mortgage-loan-insurance-homeownership-programs/improvement',
  warranty: 'https://www.alberta.ca/new-home-warranty-overview',
  registry: 'https://www.alberta.ca/public-registries-new-home-warranty',
}

// 14.1 Final rules gate (D7): National Building Code – 2023 Alberta Edition, 2nd printing (NRC), Part 9.
export const CODE_ITEMS = [
  { id: 'egress', clause: '9.9.10.1' },
  { id: 'smoke', clause: '9.10.19' },
  { id: 'co', clause: '9.32.3.9' },
  { id: 'vent', clause: '9.32.3' },
  { id: 'stairs', clause: '9.8.4' },
  { id: 'radon', clause: '9.13.4' },
]
export const CHECK_STATES = ['open', 'met', 'na']
// The egress item is needed when any room may be slept in: a bedroom, or an office with a sofa bed or bedroom-ready (R15).
export const egressRooms = (rooms) => (rooms || []).filter((r) => r.type === 'primary' || r.type === 'kid' || r.options?.sofa_bed || r.options?.bedroom_ready)

// 14.2 Red Deer permits for a new house (gates D10–D12).
export const PERMITS = ['dp', 'bp', 'electrical', 'gas', 'heating', 'plumbing']
export const DP_DOCS = ['sitePlan', 'elevations', 'floorPlan', 'authorization', 'intent', 'title', 'grade']
export const BP_DOCS = ['sitePlan', 'heatLoss', 'warranty', 'soils', 'plans', 'trusses', 'energy']
// The building permit is issued only after the development permit is issued and the subtrade permits are applied for.
export function bpBlocked(status) {
  const s = status || {}
  return s.dp !== 'issued' || ['electrical', 'gas', 'heating', 'plumbing'].some((k) => !['applied', 'issued'].includes(s[k]))
}
export const PERMIT_STATES = ['todo', 'applied', 'issued']

// 14.3 Red Deer Zoning Bylaw 3357/2024, R-L Residential Low-Density Zone, house (sections 6.10.5 and 6.10.8).
export const RL = { zone: 'R-L', frontM: 3.0, frontGarageM: 6.0, rearM: 7.5, rearGarageM: 6.0, sideM: 1.5, heightM: 15.0, storeys: 3, coveragePct: 45 }
export function fillFromRL(lot) {
  return {
    ...lot,
    setbacks: { front: RL.frontM, rear: RL.rearM, left: RL.sideM, right: RL.sideM },
    site: { ...(lot.site || {}), zone: RL.zone, maxHeightFt: Math.round((RL.heightM / 0.3048) * 10) / 10, maxCoveragePct: RL.coveragePct },
  }
}
export const ftOfM = (m) => m / 0.3048
export { ftToM }

// 14.5 Money: the pre-approval can set the budget goal; the draw schedule (advance per stage) adds up against the loan.
export function drawCheck(money) {
  const draws = Object.values(money?.draws || {}).filter(Number.isFinite)
  const sum = draws.reduce((a, b) => a + b, 0)
  const loan = Number.isFinite(money?.loan) ? money.loan : null
  return { sum, loan, diff: loan == null ? null : sum - loan, ok: loan != null && Math.abs(sum - loan) < 0.005 }
}

// 14.6 Warranty walks: Alberta's minimum new home warranty, 1 / 2 / 5 / 10 years from possession.
export const WARRANTY = [{ years: 1, key: 'labour' }, { years: 2, key: 'systems' }, { years: 5, key: 'envelope' }, { years: 10, key: 'structure' }]
export function warrantyWalks(possession) {
  if (!/^\d{4}-\d\d-\d\d$/.test(possession || '')) return []
  const [y, m, d] = possession.split('-').map(Number)
  return WARRANTY.map((w) => ({ ...w, date: `${y + w.years}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}` }))
}
