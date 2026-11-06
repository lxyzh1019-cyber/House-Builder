// Project (SPEC §12 Stage 0, many projects; §9 family sharing). Setup: name, new build or renovation, city,
// household. Projects: mine and shared with me; open, new, delete. Sharing (chat-D33): this device's code,
// and the owner adds members by their device code. Project data stays in Firestore, never in the repo.
import { useState } from 'react'
import { newSetup } from '../load.js'
import { t, tx } from '../i18n.js'

const hid = () => `h${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

export default function ProjectTab({ store, setup, onSetup, projects, current, meta, onOpen, onNew, onDelete, onShare }) {
  const s = { ...newSetup(), ...(setup || {}) }
  const set = (patch) => onSetup({ ...s, ...patch })
  const setPerson = (id, patch) => set({ household: s.household.map((p) => (p.id === id ? { ...p, ...patch } : p)) })
  const [code, setCode] = useState(''), [label, setLabel] = useState('')
  const [msg, setMsg] = useState(null), [copied, setCopied] = useState(false)
  const isOwner = meta.role !== 'member'
  const members = meta.members || [], names = meta.memberNames || {}
  const myCode = store.deviceCode?.()
  const add = async () => {
    const c = code.trim()
    if (!c || c === myCode || members.includes(c) || c === meta.owner) { setMsg('share.badCode'); return }
    try { await onShare([...members, c], { ...names, [c]: label.trim() || t('share.member') }); setCode(''); setLabel(''); setMsg('share.added') }
    catch (e) { console.error(e); setMsg('share.failed') }
  }
  const removeMember = async (c) => {
    const n = { ...names }; delete n[c]
    try { await onShare(members.filter((x) => x !== c), n); setMsg(null) } catch (e) { console.error(e); setMsg('share.failed') }
  }
  const copy = async () => { try { await navigator.clipboard.writeText(myCode); setCopied(true) } catch { setCopied(false) } }

  return (
    <main className="lot project">
      <section className="panel lot-side">
        <h2>{t('proj.setupH')}</h2>
        <p className="muted small">{t('proj.setupHelp')}</p>
        <label>{t('proj.name')}<input id="proj-name" value={tx(s.name)} onChange={(e) => set({ name: e.target.value })} /></label>
        <div className="q-label small">{t('proj.type')}</div>
        <div className="chips">{['new', 'renovation'].map((k) => <button key={k} className={`chip ${s.type === k ? 'on' : ''}`} onClick={() => set({ type: k })}>{t(`proj.type.${k}`)}</button>)}</div>
        <label>{t('proj.city')}<input id="proj-city" value={s.city} onChange={(e) => set({ city: e.target.value })} /></label>
        <h3>{t('proj.householdH')}</h3>
        {s.household.length === 0 && <p className="muted small">{t('proj.householdNone')}</p>}
        <ul className="tray soft household">
          {s.household.map((p) => (
            <li key={p.id}>
              <input aria-label={t('proj.person')} placeholder={t('proj.person')} value={p.label} onChange={(e) => setPerson(p.id, { label: e.target.value })} />
              <select aria-label={t('proj.group')} value={p.group} onChange={(e) => setPerson(p.id, { group: e.target.value })}>
                <option value="adult">{t('proj.adult')}</option><option value="child">{t('proj.child')}</option>
              </select>
              <button className="btn tiny" onClick={() => set({ household: s.household.filter((x) => x.id !== p.id) })}>{t('ed.remove')}</button>
            </li>
          ))}
        </ul>
        <button className="btn quiet" id="proj-add-person" onClick={() => set({ household: [...s.household, { id: hid(), label: '', group: 'adult' }] })}>+ {t('proj.addPerson')}</button>
        <p className="muted small">{t('proj.budgetNote')}</p>
      </section>

      <section className="panel lot-board">
        <h2>{t('proj.listH')}</h2>
        <ul className="tray" data-testid="proj-list">
          {projects.map((p) => (
            <li key={p.id} className={p.id === current ? 'on' : ''}>
              <span>{tx(p.id === current ? s.name : p.name) || t('proj.unnamed')} {p.role === 'member' && <span className="tag">{t('proj.shared')}</span>}{p.id === current && <span className="tag pass">{t('proj.open')}</span>}</span>
              <span className="chips">
                {p.id !== current && <button className="btn tiny" onClick={() => onOpen(p.id)}>{t('proj.openBtn')}</button>}
                {p.role === 'owner' && <button className="btn tiny" onClick={() => { if (confirm(t('proj.deleteAsk', { name: tx(p.name) || t('proj.unnamed') }))) onDelete(p.id) }}>{t('proj.delete')}</button>}
              </span>
            </li>
          ))}
        </ul>
        <button className="btn" id="proj-new" onClick={onNew}>+ {t('proj.new')}</button>

        <h2>{t('share.h')}</h2>
        {!store.canShare ? <p className="muted small">{t('share.offline')}</p> : <>
          <p className="muted small">{t('share.help')}</p>
          <div className="q-label small">{t('share.myCode')}</div>
          <div className="add-row"><code className="code" data-testid="device-code">{myCode}</code><button className="btn tiny" onClick={copy}>{copied ? t('share.copied') : t('share.copy')}</button></div>
          {isOwner ? <>
            <h3>{t('share.membersH')}</h3>
            {members.length === 0 && <p className="muted small">{t('share.none')}</p>}
            <ul className="tray">{members.map((c) => <li key={c}><span>{names[c] || t('share.member')} <code className="code small">{c.slice(0, 8)}…</code></span><button className="btn tiny" onClick={() => removeMember(c)}>{t('ed.remove')}</button></li>)}</ul>
            <div className="add-row">
              <input id="share-code" placeholder={t('share.codePh')} value={code} onChange={(e) => setCode(e.target.value)} />
              <input id="share-label" placeholder={t('share.labelPh')} value={label} onChange={(e) => setLabel(e.target.value)} />
              <button className="btn" id="share-add" onClick={add}>{t('share.add')}</button>
            </div>
          </> : <p className="note">{t('share.youAreMember')}</p>}
          {msg && <p className="small" data-testid="share-msg">{t(msg)}</p>}
          <p className="muted small">{t('share.risk')}</p>
        </>}
      </section>
    </main>
  )
}
