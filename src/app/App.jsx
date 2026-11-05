import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as P from '@pascal-app/core'
import { ROOM_TYPES, TYPE_ORDER, newRoom } from '../rooms/types.js'
import { readLot, readRoom, sceneJson, syncScene } from '../scene/sync.js'
import { lotState, newLot } from '../lot/lot.js'
import LotBoard from './LotBoard.jsx'
import { sizeFt } from '../units.js'
import RoomEditor from './RoomEditor.jsx'
import RulesTable from './RulesTable.jsx'
import SpecTests from './SpecTests.jsx'

const View3D = lazy(() => import('./View3D.jsx'))
const TABS = [['rooms', 'Rooms'], ['lot', 'Lot board'], ['rules', 'Rules table'], ['tests', 'Spec tests'], ['3d', '3D view']]
const tabFromHash = () => (TABS.some(([id]) => `#${id}` === location.hash) ? location.hash.slice(1) : 'rooms')
// ?fx=0 (or #fx0) turns off Pascal's post-effects in the 3D view.
const postFx = new URLSearchParams(location.search).get('fx') !== '0'

export default function App({ store, pluginReady }) {
  const [ready, setReady] = useState(false)
  const [rooms, setRooms] = useState([])
  const [rules, setRules] = useState({})
  const [lot, setLot] = useState(() => newLot())
  const [clusters, setClusters] = useState([])
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
        if (data?.rooms?.length) { setRooms(data.rooms); setRules(data.rules || {}); setLot(data.lot || newLot(data.rules)); setClusters(data.clusters || []); setSelId(data.rooms[0].id); setSaveState('loaded') }
        else { const start = [newRoom('living', 'Family TV room'), newRoom('office', 'Home office')]; setRooms(start); setSelId(start[0].id); setSaveState('new project') }
        setReady(true)
      } catch (e) { console.error(e); setError(String(e?.message || e)); setSaveState('error') }
    })()
    return () => { alive = false }
  }, [store, pluginReady])

  // Pascal owns the walls: every change rebuilds the scene, then the project (scene + rooms + rules) is saved.
  const st = useMemo(() => lotState(rooms, lot, rules), [rooms, lot, rules])
  useEffect(() => {
    if (!ready) return
    try { syncScene(rooms, rules, { lot, state: st }) } catch (e) { console.error(e); setError('Could not build the 3D scene: ' + (e?.message || e)) }
    clearTimeout(saveTimer.current)
    setSaveState('saving…')
    saveTimer.current = setTimeout(async () => {
      try { await store.save({ scene: sceneJson(), rooms, rules, lot, clusters }); setSaveState('saved') }
      catch (e) { console.error(e); setError('Could not save: ' + (e?.message || e)); setSaveState('error') }
    }, 600)
  }, [ready, rooms, rules, lot, clusters, st, store])

  const room = rooms.find((r) => r.id === selId)
  const geo = useMemo(() => (room ? readRoom(nodes, room.id) : null), [nodes, room])
  const fps = useMemo(() => readLot(nodes), [nodes])
  const target = useMemo(() => {
    const z = room && Object.values(nodes).find((n) => n.type === 'zone' && n.metadata?.roomId === room.id)
    if (!z) return null
    const xs = z.polygon.map((p) => p[0]), zs = z.polygon.map((p) => p[1])
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2, Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs))]
  }, [nodes, room])

  const changeRoom = (r) => setRooms(rooms.map((x) => (x.id === r.id ? r : x)))
  const addRoom = (type) => { const r = newRoom(type); setRooms([...rooms, r]); setSelId(r.id); location.hash = 'rooms' }
  const deleteRoom = (id) => { const rest = rooms.filter((r) => r.id !== id); setRooms(rest); setClusters(clusters.map((c) => ({ ...c, roomIds: c.roomIds.filter((x) => x !== id) })).filter((c) => c.roomIds.length > 1)); setSelId(rest[0]?.id ?? null) }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">House Designer <span className="muted">· Rooms and lot</span></div>
        <div className="save" data-testid="save-state">Saved in {store.name}: {saveState}</div>
      </header>
      <nav className="tabs" aria-label="Sections">{TABS.map(([id, label]) => <a key={id} href={`#${id}`} className={tab === id ? 'on' : ''} aria-current={tab === id ? 'page' : undefined}>{label}</a>)}</nav>
      {error && <div className="error" role="alert">{error}</div>}
      {!ready && !error && <div className="panel muted">Loading your project…</div>}

      {ready && tab === 'rooms' && (
        <main className="rooms">
          <aside className="room-list">
            {rooms.map((r) => {
              const m = st[r.id].min, s = st[r.id].size
              const status = r.size ? st[r.id].check?.status : 'min'
              return (
                <button key={r.id} className={`room-card ${r.id === selId ? 'on' : ''}`} onClick={() => setSelId(r.id)}>
                  <b>{r.name}</b>
                  <span>{sizeFt(s.w, s.d)}</span>
                  <span className={`tag ${status === 'too-small' ? 'warn' : status === 'fits' ? 'pass' : ''}`}>{status === 'too-small' ? 'Too small' : status === 'fits' ? 'Fits' : 'Minimum'}</span>{r.place && <span className="tag">on the lot</span>}
                  <span className="muted small">min {sizeFt(m.w, m.d)}</span>
                </button>
              )
            })}
            <div className="add-room">
              <div className="muted small">Add a room</div>
              <div className="chips">{TYPE_ORDER.map((t) => <button key={t} className="chip" onClick={() => addRoom(t)}>+ {ROOM_TYPES[t].label}</button>)}</div>
            </div>
          </aside>
          {room ? <RoomEditor key={room.id} room={room} rules={rules} geo={geo} ctx={st[room.id]?.ctx} lotNote={lotNote(room, st, rooms)} onChange={changeRoom} onDelete={() => deleteRoom(room.id)} /> : <div className="panel muted">Add a room to start.</div>}
        </main>
      )}
      {ready && tab === 'lot' && <LotBoard rooms={rooms} lot={lot} clusters={clusters} rules={rules} st={st} fps={fps} onRooms={setRooms} onLot={setLot} onClusters={setClusters} onOpenRoom={(id) => { setSelId(id); location.hash = 'rooms' }} />}
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

// What the lot board means for this room's walkway (shown in Rooms).
function lotNote(room, st, rooms) {
  const s = st[room.id]
  if (!room.place || room.type !== 'living') return null
  if (s.shared) return `On the lot its open side touches ${s.sharedWith.map((w) => rooms.find((r) => r.id === w.id)?.name).join(', ')}, so the walkway is shared and the minimum drops.`
  return 'On the lot no open room touches an open side, so it keeps its full walkway. (The lot board decides this, not the "Open to the next room" answer.)'
}
