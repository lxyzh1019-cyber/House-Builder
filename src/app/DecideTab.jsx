// Decide (SPEC §13.4–13.6): plan versions (save, compare, restore), the idea inbox, decision cards.
import { useState } from 'react'
import * as P from '../plan/plan.js'
import { ftIn, mToFt } from '../units.js'
import { t, tx } from '../i18n.js'

const size = (s) => (s ? `${ftIn(mToFt(s.w))} x ${ftIn(mToFt(s.d))}` : t('ver.min'))

export default function DecideTab({ plan, onPlan, versions, onVersions, design, onRestore, by }) {
  const set = (patch) => onPlan({ ...plan, ...patch })
  return (
    <main className="decide">
      <Versions versions={versions} onVersions={onVersions} design={design} onRestore={onRestore} by={by} />
      <Ideas ideas={plan.ideas} onIdeas={(ideas) => set({ ideas })} by={by} />
      <Cards cards={plan.decisions} onCards={(decisions) => set({ decisions })} versions={versions} by={by} />
    </main>
  )
}

function Versions({ versions, onVersions, design, onRestore, by }) {
  const [name, setName] = useState(''), [a, setA] = useState(''), [b, setB] = useState(''), [msg, setMsg] = useState(null)
  const va = versions.find((v) => v.id === a), vb = versions.find((v) => v.id === b)
  const cmp = va && vb ? P.compareVersions(va, vb) : null
  return (
    <section className="panel" data-testid="versions">
      <h2>{t('ver.title')}</h2>
      <p className="muted small">{t('ver.help', { max: P.MAX_VERSIONS })}</p>
      <div className="add-row">
        <input id="ver-name" placeholder={t('ver.namePh')} value={name} onChange={(e) => setName(e.target.value)} />
        <button className="btn" id="ver-save" onClick={() => { const r = P.saveVersion(versions, design, name.trim(), by); if (r.full) setMsg('ver.full'); else { onVersions(r.versions); setName(''); setMsg('ver.saved') } }}>{t('ver.save')}</button>
      </div>
      {msg && <p className="small" data-testid="ver-msg">{t(msg, { max: P.MAX_VERSIONS })}</p>}
      <ul className="tray">{versions.map((v) => (
        <li key={v.id}><span>{tx(v.name)} <span className="muted small">· {v.at?.slice(0, 10)} · {t('ver.rooms', { n: v.design.rooms?.length || 0 })}</span></span>
          <button className="btn tiny" onClick={() => { if (confirm(t('ver.restoreAsk', { name: v.name }))) { const r = P.restoreVersion(versions, design, v.id, by); if (r) { onVersions(r.versions); onRestore(r.design); setMsg(r.full ? 'ver.restoredFull' : 'ver.restored') } } }}>{t('ver.restore')}</button>
        </li>))}</ul>
      {versions.length >= 2 && <div className="add-row">
        <select aria-label={t('ver.from')} value={a} onChange={(e) => setA(e.target.value)}><option value="">{t('ver.from')}</option>{versions.map((v) => <option key={v.id} value={v.id}>{tx(v.name)}</option>)}</select>
        <select aria-label={t('ver.to')} value={b} onChange={(e) => setB(e.target.value)}><option value="">{t('ver.to')}</option>{versions.map((v) => <option key={v.id} value={v.id}>{tx(v.name)}</option>)}</select>
      </div>}
      {cmp && <div className="result" data-testid="ver-compare">
        {cmp.added.length + cmp.removed.length + cmp.resized.length === 0 && <div>{t('ver.same')}</div>}
        {cmp.added.map((r) => <div key={r.id}>+ {tx(r.name)}</div>)}
        {cmp.removed.map((r) => <div key={r.id}>− {tx(r.name)}</div>)}
        {cmp.resized.map((r) => <div key={r.id}>{t('ver.resized', { name: tx(r.name), from: size(r.from), to: size(r.to) })}</div>)}
      </div>}
    </section>
  )
}

function Ideas({ ideas, onIdeas, by }) {
  const [text, setText] = useState(''), [tag, setTag] = useState(''), [filter, setFilter] = useState('all')
  const counts = P.countByStatus(ideas)
  const shown = filter === 'all' ? ideas : ideas.filter((i) => i.status === filter)
  const move = (id, decision) => onIdeas(ideas.map((i) => (i.id === id ? P.moveIdea(i, by, decision) : i)))
  return (
    <section className="panel" data-testid="ideas">
      <h2>{t('idea.title')}</h2>
      <p className="muted small">{t('idea.help')}</p>
      <div className="add-row">
        <input id="idea-text" placeholder={t('idea.textPh')} value={text} onChange={(e) => setText(e.target.value)} />
        <input id="idea-tag" placeholder={t('idea.tagPh')} value={tag} onChange={(e) => setTag(e.target.value)} />
        <button className="btn" id="idea-add" disabled={!text.trim()} onClick={() => { onIdeas([...ideas, P.newIdea(text.trim(), by, tag.trim())]); setText(''); setTag('') }}>{t('idea.add')}</button>
      </div>
      <div className="chips" data-testid="idea-filter">
        <button className={`chip ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>{t('idea.all', { n: ideas.length })}</button>
        {P.IDEA_STEPS.map((s) => <button key={s} className={`chip ${filter === s ? 'on' : ''}`} onClick={() => setFilter(s)}>{t(`idea.st.${s}`)} ({counts[s]})</button>)}
      </div>
      <ul className="tray">{shown.map((i) => {
        const next = P.IDEA_STEPS[P.IDEA_STEPS.indexOf(i.status) + 1]
        return (
          <li key={i.id} data-testid={`idea-${i.id}`}><span>{i.text}{i.tag ? <span className="tag">{i.tag}</span> : null} <span className="tag">{t(`idea.st.${i.status}`)}{i.decision ? ` · ${t(`idea.dec.${i.decision}`)}` : ''}</span></span>
            <span className="chips">
              {next === 'decided' ? P.DECISIONS.map((d) => <button key={d} className="btn tiny" onClick={() => move(i.id, d)}>{t(`idea.dec.${d}`)}</button>)
                : next && !(next === 'applied' && i.decision !== 'keep') ? <button className="btn tiny" onClick={() => move(i.id)}>→ {t(`idea.st.${next}`)}</button> : null}
              <button className="btn tiny" onClick={() => onIdeas(ideas.filter((x) => x.id !== i.id))}>{t('ed.remove')}</button>
            </span>
          </li>
        )
      })}</ul>
    </section>
  )
}

function Cards({ cards, onCards, versions, by }) {
  const [open, setOpen] = useState(null), [from, setFrom] = useState('')
  const put = (c) => onCards(cards.map((x) => (x.id === c.id ? c : x)))
  const add = (c) => { onCards([...cards, c]); setOpen(c.id) }
  return (
    <section className="panel" data-testid="cards">
      <h2>{t('card2.title')}</h2>
      <p className="muted small">{t('card2.help')}</p>
      <div className="add-row">
        <button className="btn" id="card-new" onClick={() => add(from ? P.copyCriteria(cards.find((c) => c.id === from)) : P.newCard())}>+ {t('card2.new')}</button>
        {cards.length > 0 && <select aria-label={t('card2.copyFrom')} value={from} onChange={(e) => setFrom(e.target.value)}><option value="">{t('card2.blank')}</option>{cards.map((c) => <option key={c.id} value={c.id}>{t('card2.copyOf', { q: c.question || '…' })}</option>)}</select>}
      </div>
      {cards.map((c) => <Card key={c.id} c={c} open={open === c.id} onOpen={() => setOpen(open === c.id ? null : c.id)} onPut={put} onRemove={() => onCards(cards.filter((x) => x.id !== c.id))} versions={versions} by={by} />)}
    </section>
  )
}

function Card({ c, open, onOpen, onPut, onRemove, versions, by }) {
  const [opt, setOpt] = useState(''), [why, setWhy] = useState(c.why || ''), [pick, setPick] = useState(c.pick || '')
  const label = (cr) => cr.label || (P.DEFAULT_CRITERIA.includes(cr.key) ? t(`crit.${cr.key}`) : cr.key)
  return (
    <div className="item-edit" data-testid={`card-${c.id}`}>
      <div className="add-row">
        <input aria-label={t('card2.question')} placeholder={t('card2.question')} value={c.question} onChange={(e) => onPut({ ...c, question: e.target.value })} />
        <span className={`tag ${c.status === 'decided' ? 'pass' : ''}`}>{t(`card2.st.${c.status}`)}</span>
        <button className="btn tiny" onClick={onOpen}>{t(open ? 'card2.close' : 'card2.open')}</button>
        <button className="btn tiny" onClick={onRemove}>{t('ed.remove')}</button>
      </div>
      {c.status === 'decided' && <p className="small">{t('card2.picked', { name: c.options.find((o) => o.id === c.pick)?.name || '', why: c.why })}</p>}
      {open && <>
        <div className="table-wrap"><table className="rules">
          <thead><tr><th>{t('card2.criterion')}</th>{c.options.map((o) => <th key={o.id}>{o.name}</th>)}</tr></thead>
          <tbody>{c.criteria.map((cr) => (
            <tr key={cr.id}><td><input aria-label={t('card2.criterion')} value={label(cr)} onChange={(e) => onPut({ ...c, criteria: c.criteria.map((x) => (x.id === cr.id ? { ...x, label: e.target.value } : x)) })} /></td>
              {c.options.map((o) => <td key={o.id}><input aria-label={`${o.name} · ${label(cr)}`} value={c.cells[`${o.id}|${cr.id}`] || ''} onChange={(e) => onPut(P.setCell(c, o.id, cr.id, e.target.value))} /></td>)}</tr>
          ))}</tbody>
        </table></div>
        <div className="add-row">
          <input placeholder={t('card2.optionPh')} value={opt} onChange={(e) => setOpt(e.target.value)} />
          <button className="btn tiny" disabled={!opt.trim() || c.options.length >= 5} onClick={() => { onPut(P.addOption(c, opt.trim())); setOpt('') }}>+ {t('card2.option')}</button>
          <button className="btn tiny" onClick={() => onPut({ ...c, criteria: [...c.criteria, { id: P.pid('c'), key: 'other', label: '' }] })}>+ {t('card2.criterionAdd')}</button>
        </div>
        {c.options.length >= 2 && <div className="add-row">
          <select aria-label={t('card2.pick')} value={pick} onChange={(e) => setPick(e.target.value)}><option value="">{t('card2.pick')}</option>{c.options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select>
          <input placeholder={t('card2.why')} value={why} onChange={(e) => setWhy(e.target.value)} />
          {versions.length > 0 && <select aria-label={t('card2.version')} value={c.versionId || ''} onChange={(e) => onPut({ ...c, versionId: e.target.value || null })}><option value="">{t('card2.version')}</option>{versions.map((v) => <option key={v.id} value={v.id}>{tx(v.name)}</option>)}</select>}
          <button className="btn" disabled={!pick} onClick={() => onPut(P.decideCard(c, pick, why, by))}>{t('card2.decide')}</button>
        </div>}
      </>}
    </div>
  )
}
