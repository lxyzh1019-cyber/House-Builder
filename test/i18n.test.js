// Language rule (SPEC §4): every UI key has English and Simplified Chinese, and every English name the
// screens show from the data (room types, presets, questions, furniture, rules rows, lot words) has a
// Chinese entry. Also checks that each key the app code uses exists.
import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { DATA, UI, setLang, t, tx } from '../src/i18n.js'
import { ROOM_TYPES } from '../src/rooms/types.js'
import { LIBRARY } from '../src/furniture/library.js'
import { RULES } from '../src/rules.js'

const hasHan = (s) => /[一-鿿]/.test(s)
// Text with letters other than units and fixed names needs a translation.
const needsZh = (s) => /[A-Za-z]{2,}/.test(s.replace(/\b(ft|in|m|mm|C\$|SPEC|THX|SMPTE|chat-D\d+|WebGPU|WebGL|GPU|Pascal|Firestore|Furnish2|MIT|CI|L\d|T\d|E\d|R\d+)\b/g, ''))

describe('i18n (SPEC §4 Language rule)', () => {
  it('every UI key has both languages, with the same {values}', () => {
    const vars = (s) => [...s.matchAll(/\{\/?\w+\}/g)].map((m) => m[0]).sort().join()
    for (const [k, row] of Object.entries(UI)) {
      expect(row, k).toHaveLength(2)
      expect(row[0].length, `${k} en`).toBeGreaterThan(0)
      expect(row[1].length, `${k} zh`).toBeGreaterThan(0)
      expect(vars(row[1]), `${k} placeholders`).toBe(vars(row[0]))
      if (needsZh(row[0].replace(/\{\/?\w+\}/g, ''))) expect(hasHan(row[1]), `${k} zh is Chinese`).toBe(true)
    }
  })

  it('every data name shown on screen has a Chinese entry', () => {
    const names = new Set()
    for (const ty of Object.values(ROOM_TYPES)) {
      names.add(ty.label)
      Object.keys(ty.presets).forEach((p) => names.add(p))
      for (const q of ty.questions) { names.add(q.label); q.options.forEach(([, l]) => names.add(l)) }
    }
    for (const i of LIBRARY) { names.add(i.name); names.add(i.category) }
    for (const r of RULES) { names.add(r.label); names.add(r.unit); names.add(r.source) }
    ;['3-Seat Sofa Bed', 'Sofa Bed (2-seat)', 'walkway', 'chair space', 'Core route', 'front setback', 'rear setback', 'left setback', 'right setback'].forEach((n) => names.add(n))
    const missing = [...names].filter((n) => needsZh(n) && !DATA[n])
    expect(missing).toEqual([])
    for (const [en, zh] of Object.entries(DATA)) expect(zh.length, en).toBeGreaterThan(0)
  })

  it('every key the app code asks for exists', () => {
    const dir = new URL('../src/app/', import.meta.url)
    const used = new Set()
    for (const f of readdirSync(dir)) {
      const src = readFileSync(new URL(f, dir), 'utf8')
      for (const m of src.matchAll(/\b(?:t|tr|tn)\('(\w[\w-]*\.[\w.-]+)'/g)) used.add(m[1])
      for (const m of src.matchAll(/\['\w+', '(tab\.\w+)'\]/g)) used.add(m[1])
    }
    const engine = readFileSync(new URL('../src/rooms/engine.js', import.meta.url), 'utf8')
    for (const m of engine.matchAll(/msg: \['([\w.-]+)'/g)) used.add(m[1])
    for (const m of engine.matchAll(/push\(\['([\w.-]+)'/g)) used.add(m[1])
    // Keys built at run time: lot inputs, sides, ports, table heads, statuses, store, save state, GPU.
    const dyn = [['lot', ['w', 'd', 'front', 'rear', 'left', 'right']], ['lot.side', ['n', 'e', 's', 'w']], ['port', ['door', 'open', 'wall']],
      ['rules', ['rule', 'value', 'unit', 'tag', 'source', 'date']], ['tests', ['test', 'what', 'expected', 'got', 'result']], ['st', ['fits', 'too-small']],
      ['store', ['Firestore', 'browser storage']], ['save', ['loading', 'loaded', 'new', 'saving', 'saved', 'error']], ['gpu', ['webgpu', 'webgl', 'unknown']]]
    for (const [pre, ks] of dyn) ks.forEach((k) => used.add(`${pre}.${k}`))
    expect(used.size).toBeGreaterThan(100)
    expect([...used].filter((k) => !UI[k])).toEqual([])
  })

  it('switches language and fills values, translating data names inside them', () => {
    setLang('zh')
    expect(t('chg.remove', { name: 'Loveseat' })).toBe('去掉一个双人沙发')
    expect(tx('My own sofa')).toBe('My own sofa')
    setLang('en')
    expect(t('chg.remove', { name: 'Loveseat' })).toBe('Remove one Loveseat')
    expect(tx('Loveseat')).toBe('Loveseat')
  })
})
