// Questionnaire sections 4, 5 and 6 as room questions (SPEC v1.3 §6.5, R11, chat-D37). Each answer is saved
// in the project's `answers` map under its question id: { value, answeredBy, answeredAt } (chat-D40); the
// later Stage 1 questionnaire reads and writes the same ids. Answering also sets the rooms it sizes.
import { applyOptions, LEVELS } from './types.js'

const Q = (id, section, kind, en, zh, options, effect) => ({ id, section, kind, label: [en, zh], options, effect })
export const SECTIONS = { 4: ['Coming in + storage', '进门与收纳'], 5: ['Work, study + hobbies', '工作、学习与爱好'], 6: ['Guests + family', '客人与家人'] }

export const QUESTIONS = [
  Q('q4.1', 4, 'pick', 'Winter coats, boots and sports bags per person.', '每人冬衣、靴子、运动包数量', [['light', 'light', '少'], ['normal', 'normal', '一般'], ['heavy', 'heavy sports gear', '大件运动装备']], 'locker width; household size sets the locker count'),
  Q('q4.2', 4, 'multi', 'What gear comes home wet?', '哪些装备回家是湿的？', [['boots', 'boots', '靴子'], ['skates', 'skates', '冰鞋'], ['swim', 'swim bags', '游泳包'], ['none', 'none', '没有']], 'a boot tray in the locker band'),
  Q('q4.3', 4, 'rank', 'Garage: what goes in it, most important first.', '车库：放什么，按重要性排', [['cars', 'cars', '车'], ['bikes', 'bikes', '自行车'], ['tools', 'tools', '工具'], ['sports', 'sports gear', '运动装备'], ['storage', 'storage', '杂物']], 'saved now, used by the garage piece later'),
  Q('q4.4', 4, 'pick', 'Seasonal storage (winter tires, decorations, camping).', '季节性储物（冬季轮胎、节日装饰、露营用品）', [['little', 'a little', '少量'], ['some', 'some', '一些'], ['lots', 'a lot', '很多']], 'saved now, used by storage by use later'),
  Q('q5.1', 5, 'perPerson', 'Who works from home, and how many days?', '谁在家办公、几天？', [['0', '0', '0'], ['1-2', '1–2 days', '1–2 天'], ['3-5', '3–5 days', '3–5 天']], 'office desks = people with 1+ days'),
  Q('q5.2', 5, 'pick', 'Do video calls need a door that closes?', '视频会议要关门吗？', [['yes', 'yes', '要'], ['no', 'no', '不要']], 'office door (closed room)'),
  Q('q5.3', 5, 'pick', 'Homework: near parents or in own room?', '作业在哪做？', [['near', 'near parents', '在父母身边'], ['own', 'own room', '自己房间']], 'kid bedroom desk, or a homework spot in the dining room or office'),
  Q('q5.4', 5, 'note', 'Hobby gear (a short note).', '爱好装备（简短说明）', [], 'saved now'),
  Q('q6.1', 6, 'pick', 'How often do relatives stay, and for how long?', '亲戚多久来住、住多久？', [['never', 'never', '从不'], ['few', 'a few nights a year', '每年几晚'], ['weeks', 'weeks at a time', '一住几周']], 'offers a sofa bed in the office'),
  Q('q6.2', 6, 'pick', 'Do guests need their own bathroom?', '客人要独立卫生间吗？', [['yes', 'yes', '要'], ['no', 'no', '不要']], 'saved for the guest room type later'),
  Q('q6.3', 6, 'pick', 'Largest gathering we host.', '最多招待多少人？', [['6', 'up to 6', '最多 6 人'], ['8', '8', '8 人'], ['10+', '10+', '10 人以上']], 'dining table and living room seats'),
  Q('q6.4', 6, 'pick', 'Do we need a main-floor bedroom?', '需要一楼卧室吗？', [['yes', 'yes', '要'], ['no', 'no', '不要']], 'suggests level main for one bedroom'),
]
export const questionById = (id) => QUESTIONS.find((q) => q.id === id)
export const valueOf = (answers, id) => answers?.[id]?.value

// The options an answer sets for one room type (SPEC §6.5). `household` = setup.household (people).
// Guesses, stated to the owner: "light" gear keeps the normal 1.5 ft locker (§6.4 has no smaller one);
// q6.3 up to 6 or 8 sets living seats 6–8, 10+ sets 10+.
export function optionsFrom(answers, type, household = []) {
  const v = (id) => valueOf(answers, id)
  const o = {}
  if (type === 'mudroom') {
    if (v('q4.1')) { o.gear = v('q4.1') === 'heavy' ? 'heavy' : 'normal'; if (household.length) o.people = household.length }
    const wet = v('q4.2')
    if (Array.isArray(wet)) o.boot_tray = wet.some((x) => x !== 'none')
  }
  if (type === 'office') {
    const days = v('q5.1')
    if (days && typeof days === 'object') { const n = Object.values(days).filter((d) => d && d !== '0').length; if (n) o.desks = Math.min(2, n) }
    if (v('q5.3') === 'near') o.homework_spot = true
  }
  if (type === 'kid' && v('q5.3')) o.desk = v('q5.3') === 'own'
  if (type === 'dining') {
    const g = v('q6.3')
    if (g) { o.seats = g === '6' ? '6' : '8'; o.big_gathering = g === '10+' }
    if (v('q5.3') === 'near') o.homework_spot = true
  }
  if (type === 'living' && v('q6.3')) o.seats = v('q6.3') === '10+' ? '10+' : '6-8'
  return o
}

// Answer a question: save it and set the rooms it sizes. Returns { answers, rooms }.
// q5.3 "near parents" puts the homework spot in the dining room, or the office when there is no dining room.
// q6.1 only offers a sofa bed (the office card shows the offer); q6.4 only suggests a level.
export function answer(answers, rooms, id, value, { by = null, household = [], overrides } = {}) {
  const next = { ...answers, [id]: { value, answeredBy: by, answeredAt: new Date().toISOString() } }
  const touched = { 'q4.1': ['mudroom'], 'q4.2': ['mudroom'], 'q5.1': ['office'], 'q5.3': ['kid', 'dining', 'office'], 'q6.3': ['dining', 'living'] }[id] || []
  const hasDining = rooms.some((r) => r.type === 'dining')
  const out = rooms.map((r) => {
    if (!touched.includes(r.type)) return r
    const o = optionsFrom(next, r.type, household)
    if (id === 'q5.3' && r.type === 'office') o.homework_spot = value === 'near' && !hasDining
    if (id === 'q5.3' && r.type === 'dining') o.homework_spot = value === 'near'
    return applyOptions(r, o, overrides)
  })
  if (id === 'q5.2') return { answers: next, rooms: out.map((r) => (r.type === 'office' ? { ...r, closed: value === 'yes', ports: value === 'yes' ? Object.fromEntries(Object.entries(r.ports || { n: 'wall', e: 'wall', s: 'door', w: 'wall' }).map(([k, p]) => [k, p === 'open' ? 'door' : p])) : r.ports } : r)) }
  return { answers: next, rooms: out }
}

// Offers and suggestions the answers make, shown on the room cards (they change nothing until chosen).
export const offersSofaBed = (answers) => !!valueOf(answers, 'q6.1') && valueOf(answers, 'q6.1') !== 'never'
export function mainBedroomWanted(answers, rooms) {
  if (valueOf(answers, 'q6.4') !== 'yes') return false
  return !rooms.some((r) => (r.type === 'primary' || r.type === 'kid' || (r.type === 'office' && r.options?.bedroom_ready)) && (r.level || 'main') === 'main')
}
export { LEVELS }
