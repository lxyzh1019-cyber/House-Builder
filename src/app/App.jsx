import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as P from '@pascal-app/core'
import { minimumSize, checkSize } from '../rooms/engine.js'
import { ROOM_TYPES, TYPE_ORDER, newRoom } from '../rooms/types.js'
import { readRoom, roomSizeFt, sceneJson, syncScene } from '../scene/sync.js'
import { sizeFt } from '../units.js'
import RoomEditor from './RoomEditor.jsx'
import RulesTable from './RulesTable.jsx'
import SpecTests from './SpecTests.jsx'

const View3D = lazy(() => import('./View3D.jsx'))
const TABS = [['rooms', 'Rooms'], ['rules', 'Rules table'], ['tests', 'Spec tests'], ['3d', '3D view']]
const tabFromHash = () => (TABS.some(([id]) => `#${id}` === location.hash) ? location.hash.slice(1) : 'rooms')
// ?fx=0 (or #fx0) turns off Pascal's post-effects in the 3D view.
const postFx = new URLSearchParams(location.search).get('fx') !== '0'

export default function App({ store, pluginReady }) {
  const [ready, setReady] = useState(false)
  const [rooms, setRooms] = useState([])
  const [rules, setRules] = useState({})
  const [selId, setSelId] = useState(null)
  const [tab, setTab] = useState(tabFromHash())
  const [saveState, setSaveState] = useState('loading…')
  const [error, setError] = useState(null)
  const [backend, setBackend] = useState(null)
  const nodes = P.useScene((s) => s.nodes)
  const saveTimer = useRef(null)

  useEffect(() => { const f = () => setTab(tabFromHash()); addEventListener('hashchange', f); return () => removeEventListener('hashchange', f) }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        await pluginReady
        const data = await store.load()
        if (!alive) return
        if (data?.rooms?.length) { setRooms(data.rooms); setRules(data.rules || {}); setSelId(data.rooms[0].id); setSaveState('loaded') }
        else { const start = [newRoom('living', 'Family TV room'), newRoom('office', 'Home office')]; setRooms(start); setSelId(start[0].id); setSaveState('new project') }
        setReady(true)
      } catch (e) { console.error(e); setError(String(e?.message || e)); setSaveState('error') }
    })()
    return () => { alive = false }
  }, [store, pluginReady])

  // Pascal owns the walls: every change rebuilds the scene, then the project (scene + rooms + rules) is saved.
  useEffect(() => {
    if (!ready) return
    try { syncScene(rooms, rules) } catch (e) { console.error(e); setError('Could not build the 3D scene: ' + (e?.message || e)) }
    clearTimeout(saveTimer.current)
    setSaveState('saving…')
    saveTimer.current = setTimeout(async () => {
      try { await store.save({ scene: sceneJson(), rooms, rules }); setSaveState('saved') }
      catch (e) { console.error(e); setError('Could not save: ' + (e?.message || e)); setSaveState('error') }
    }, 600)
  }, [ready, rooms, rules, store])

  const room = rooms.find((r) => r.id === selId)
  const geo = useMemo(() => (room ? readRoom(nodes, room.id) : null), [nodes, room])
  const target = useMemo(() => {
    const z = room && Object.values(nodes).find((n) => n.type === 'zone' && n.metadata?.roomId === room.id)
    if (!z) return null
    const xs = z.polygon.map((p) => p[0]), zs = z.polygon.map((p) => p[1])
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2, Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs))]
  }, [nodes, room])

  const changeRoom = (r) => setRooms(rooms.map((x) => (x.id === r.id ? r : x)))
  const addRoom = (type) => { const r = newRoom(type); setRooms([...rooms, r]); setSelId(r.id); location.hash = 'rooms' }
  const deleteRoom = (id) => { const rest = rooms.filter((r) => r.id !== id); setRooms(rest); setSelId(rest[0]?.id ?? null) }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">House Designer <span className="muted">· Rooms from contents</span></div>
        <div className="save" data-testid="save-state">Saved in {store.name}: {saveState}</div>
      </header>
      <nav className="tabs" aria-label="Sections">{TABS.map(([id, label]) => <a key={id} href={`#${id}`} className={tab === id ? 'on' : ''} aria-current={tab === id ? 'page' : undefined}>{label}</a>)}</nav>
      {error && <div className="error" role="alert">{error}</div>}
      {!ready && !error && <div className="panel muted">Loading your project…</div>}

      {ready && tab === 'rooms' && (
        <main className="rooms">
          <aside className="room-list">
            {rooms.map((r) => {
              const m = minimumSize(r, rules), s = roomSizeFt(r, rules)
              const st = r.size ? checkSize(r, s.w, s.d, rules).status : 'min'
              return (
                <button key={r.id} className={`room-card ${r.id === selId ? 'on' : ''}`} onClick={() => setSelId(r.id)}>
                  <b>{r.name}</b>
                  <span>{sizeFt(s.w, s.d)}</span>
                  <span className={`tag ${st === 'too-small' ? 'warn' : st === 'fits' ? 'pass' : ''}`}>{st === 'too-small' ? 'Too small' : st === 'fits' ? 'Fits' : 'Minimum'}</span>
                  <span className="muted small">min {sizeFt(m.w, m.d)}</span>
                </button>
              )
            })}
            <div className="add-room">
              <div className="muted small">Add a room</div>
              <div className="chips">{TYPE_ORDER.map((t) => <button key={t} className="chip" onClick={() => addRoom(t)}>+ {ROOM_TYPES[t].label}</button>)}</div>
            </div>
          </aside>
          {room ? <RoomEditor key={room.id} room={room} rules={rules} geo={geo} onChange={changeRoom} onDelete={() => deleteRoom(room.id)} /> : <div className="panel muted">Add a room to start.</div>}
        </main>
      )}
      {ready && tab === 'rules' && <RulesTable overrides={rules} onChange={setRules} />}
      {tab === 'tests' && <SpecTests />}
      {ready && tab === '3d' && (
        <section className="panel">
          <div className="muted small">Pascal scene · {room ? room.name : 'no room'} · GPU: {backend ?? '…'}{postFx ? '' : ' · effects off'}</div>
          <Suspense fallback={<div className="muted">Loading the 3D view…</div>}>
            <View3D target={target} postFx={postFx && location.hash !== '#fx0'} onBackend={setBackend} />
          </Suspense>
        </section>
      )}
      <footer className="foot muted small">Sizes are stored in metres and shown in feet. Furniture sizes from Furnish2 (MIT).</footer>
    </div>
  )
}
