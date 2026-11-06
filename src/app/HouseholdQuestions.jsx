// Questionnaire sections 4, 5 and 6 as room questions (SPEC v1.3 §6.5, R11, chat-D37): one at a time per
// section, choices first, English and 简体中文. Each answer is saved under its question id with who answered
// and when (answers/{id}, chat-D40) and sets the rooms it sizes (src/rooms/answers.js).
import { useState } from 'react'
import { QUESTIONS, SECTIONS, valueOf } from '../rooms/answers.js'
import { t, useLang } from '../i18n.js'

export default function HouseholdQuestions({ answers, household, onAnswer }) {
  const lang = useLang(), L = (pair) => pair[lang === 'zh' ? 1 : 0]
  const [open, setOpen] = useState(false)
  const done = QUESTIONS.filter((q) => valueOf(answers, q.id) !== undefined).length
  const people = household.length ? household : [{ id: 'you', label: t('hq.you') }]
  return (
    <section className="panel hq" data-testid="household-questions">
      <h2>{t('hq.title')} <span className="muted small">{t('hq.count', { n: done, of: QUESTIONS.length })}</span></h2>
      <p className="muted small">{t('hq.help')}</p>
      <button className="btn quiet" onClick={() => setOpen(!open)}>{t(open ? 'hq.hide' : 'hq.show')}</button>
      {open && Object.entries(SECTIONS).map(([n, title]) => (
        <div key={n}>
          <h3>{t('hq.section', { n })} · {L(title)}</h3>
          {QUESTIONS.filter((q) => String(q.section) === n).map((q) => {
            const v = valueOf(answers, q.id)
            return (
              <div key={q.id} className="q" data-testid={`q-${q.id}`}>
                <div className="q-label">{L(q.label)} <span className="tag">{q.id}</span></div>
                {q.kind === 'pick' && <div className="chips">{q.options.map(([val, en, zh]) => <button key={val} className={`chip ${v === val ? 'on' : ''}`} onClick={() => onAnswer(q.id, val)}>{lang === 'zh' ? zh : en}</button>)}</div>}
                {q.kind === 'multi' && <div className="chips">{q.options.map(([val, en, zh]) => {
                  const list = Array.isArray(v) ? v : [], on = list.includes(val)
                  const next = val === 'none' ? (on ? [] : ['none']) : on ? list.filter((x) => x !== val) : [...list.filter((x) => x !== 'none'), val]
                  return <button key={val} className={`chip ${on ? 'on' : ''}`} onClick={() => onAnswer(q.id, next)}>{lang === 'zh' ? zh : en}</button>
                })}</div>}
                {q.kind === 'rank' && <div className="chips">{q.options.map(([val, en, zh]) => {
                  const list = Array.isArray(v) ? v : [], k = list.indexOf(val)
                  return <button key={val} className={`chip ${k >= 0 ? 'on' : ''}`} onClick={() => onAnswer(q.id, k >= 0 ? list.filter((x) => x !== val) : [...list, val])}>{k >= 0 ? `${k + 1}. ` : ''}{lang === 'zh' ? zh : en}</button>
                })}</div>}
                {q.kind === 'perPerson' && people.map((p) => (
                  <div key={p.id} className="person"><span className="small">{p.label || t('proj.person')}</span>
                    <div className="chips">{q.options.map(([val, en, zh]) => <button key={val} className={`chip ${v?.[p.id] === val ? 'on' : ''}`} onClick={() => onAnswer(q.id, { ...(v || {}), [p.id]: val })}>{lang === 'zh' ? zh : en}</button>)}</div>
                  </div>
                ))}
                {q.kind === 'note' && <input aria-label={L(q.label)} value={v || ''} onChange={(e) => onAnswer(q.id, e.target.value)} />}
              </div>
            )
          })}
        </div>
      ))}
    </section>
  )
}
