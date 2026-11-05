import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import * as P from '@pascal-app/core'
import { ROOM_TYPES, TYPE_ORDER, newRoom } from '../rooms/types.js'
import { readLot, readRoom, sceneJson, syncScene } from '../scene/sync.js'
import { lotState, newLot } from '../lot/lot.js'
import LotBoard from './LotBoard.jsx'
import { ftToM, sizeFt } from '../units.js'
import RoomEditor from './RoomEditor.jsx'
import RulesTable from './RulesTable.jsx'
import SpecTests from './SpecTests.jsx'
import { LANGS, setLang, t, tlist, tx, useLang } from '../i18n.js'
import TraceBoard from './TraceBoard.jsx'
import { newTrace, traceFrame } from '../trace/trace.js'
import { copyToRooms, knownSizes } from '../trace/fit.js'
import { SAMPLE, sampleUrl } from '../trace/sample.js'
import { fileToPicture, loadPicture, pictureSize, savePicture } from '../trace/picture.js'

const View3D = lazy(() => import('./View3D.jsx'))
const TABS = [['rooms', 'tab.rooms'], ['trace', 'tab.trace'], ['lot', 'tab.lot'], ['rules', 'tab.rules'], ['tests', 'tab.tests'], ['3d', 'tab.3d']]
const tabFromHash = () => (TABS.some(([id]) => `#${id}` === location.hash) ? location.hash.slice(1) : 'rooms')
// ?fx=0 (or #fx0) turns off Pascal's post-effects in the 3D view.
const postFx = new URLSearchParams(location.search).get('fx') !== '0'

export default function App({ store, pluginReady }) {
  const [ready, setReady] = useState(false)
  const [rooms, setRooms] = useState([])
  const [rules, setRules] = useState({})
  const [lot, setLot] = useState(() => newLot())
  const [clusters, setClusters] = useState([])
  const [trace, setTrace] = useState(() => newTrace())
  const [pictureUrl, setPictureUrl] = useState(null)
  const [pictureNote, setPictureNote] = useState(null)
  const [aim, setAim] = useState('room')
  const [selId, setSelId] = useState(null)
  const [tab, setTab] = useState(tabFromHash())
  const lang = useLang()
  const [saveState, setSaveState] = useState('loading')
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
        if (data?.trace) { setTrace(data.trace); await showPicture(data.trace.image) }
        else { const start = [newRoom('living', 'Family TV room'), newRoom('office', 'Home office')]; setRooms(start); setSelId(start[0].id); setSaveState('new') }
        setReady(true)
      } catch (e) { console.error(e); setError(String(e?.message || e)); setSaveState('error') }
    })()
    return () => { alive = false }
  }, [store, pluginReady])

  // Pascal owns the walls: every change rebuilds the scene, then the project (scene + rooms + rules) is saved.
  const st = useMemo(() => lotState(rooms, lot, rules), [rooms, lot, rules])
  useEffect(() => {
    if (!ready) return
    try { syncScene(rooms, rules, { lot, state: st }, { trace, guideUrl: pictureUrl }) } catch (e) { console.error(e); setError(t('err.scene', { msg: e?.message || e })) }
    clearTimeout(saveTimer.current)
    setSaveState('saving')
    saveTimer.current = setTimeout(async () => {
      try { await store.save({ scene: sceneJson(), rooms, rules, lot, clusters, trace }); setSaveState('saved') }
      catch (e) { console.error(e); setError(t('err.save', { msg: e?.message || e })); setSaveState('error') }
    }, 600)
  }, [ready, rooms, rules, lot, clusters, trace, pictureUrl, st, store])

  const room = rooms.find((r) => r.id === selId)
  const geo = useMemo(() => (room ? readRoom(nodes, room.id) : null), [nodes, room])
  const fps = useMemo(() => readLot(nodes), [nodes])
  const traceAim = useMemo(() => { const f = traceFrame(trace, ftToM(5)); return f ? [f.ox + f.wM / 2, f.oz + f.hM / 2, Math.hypot(f.wM, f.hM)] : null }, [trace])
  const target = useMemo(() => {
    if (aim === 'trace' && traceAim) return traceAim
    const z = room && Object.values(nodes).find((n) => n.type === 'zone' && n.metadata?.roomId === room.id)
    if (!z) return null
    const xs = z.polygon.map((p) => p[0]), zs = z.polygon.map((p) => p[1])
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2, Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs))]
  }, [nodes, room, aim, traceAim])

  // The plan picture (DN6 A): the sample is built in; an upload lives only in this browser.
  async function showPicture(image) {
    setPictureNote(null)
    if (!image) { setPictureUrl(null); return }
    if (image.kind === 'sample') { setPictureUrl(sampleUrl()); return }
    const blob = await loadPicture()
    if (blob) setPictureUrl(URL.createObjectURL(blob))
    else { setPictureUrl(null); setPictureNote('tr.noPicture') }
  }
  const pickSample = () => {
    const sameSize = trace.image?.w === SAMPLE.w && trace.image?.h === SAMPLE.h
    setTrace({ ...trace, image: { kind: 'sample', name: SAMPLE.name, w: SAMPLE.w, h: SAMPLE.h }, scale: sameSize ? trace.scale : null })
    setPictureUrl(sampleUrl()); setPictureNote(null)
  }
  const upload = async (file) => {
    try {
      const blob = await fileToPicture(file), url = URL.createObjectURL(blob), size = await pictureSize(url)
      const kept = await savePicture(blob)
      const sameSize = trace.image?.w === size.w && trace.image?.h === size.h
      setTrace({ ...trace, image: { kind: 'local', name: file.name, w: size.w, h: size.h }, scale: sameSize ? trace.scale : null })
      setPictureUrl(url); setPictureNote(kept ? null : 'tr.notKept')
    } catch (e) { console.error(e); setPictureNote('tr.badFile') }
  }

  const changeRoom = (r) => setRooms(rooms.map((x) => (x.id === r.id ? r : x)))
  const addRoom = (type) => { const r = newRoom(type); setRooms([...rooms, r]); setSelId(r.id); location.hash = 'rooms' }
  const deleteRoom = (id) => { const rest = rooms.filter((r) => r.id !== id); setRooms(rest); setClusters(clusters.map((c) => ({ ...c, roomIds: c.roomIds.filter((x) => x !== id) })).filter((c) => c.roomIds.length > 1)); setSelId(rest[0]?.id ?? null) }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">{t('app.brand')} <span className="muted">· {t('app.sub')}</span></div>
        <div className="top-right">
          <div className="save" data-testid="save-state">{t('app.savedIn', { store: t(`store.${store.name}`), state: t(`save.${saveState}`) })}</div>
          <div className="lang" role="group" aria-label={t('app.lang')}>{LANGS.map(([id, label]) => <button key={id} lang={id === 'zh' ? 'zh-Hans' : 'en'} className={`chip ${lang === id ? 'on' : ''}`} aria-pressed={lang === id} data-testid={`lang-${id}`} onClick={() => setLang(id)}>{label}</button>)}</div>
        </div>
      </header>
      <nav className="tabs" aria-label={t('app.sections')}>{TABS.map(([id, key]) => <a key={id} href={`#${id}`} className={tab === id ? 'on' : ''} aria-current={tab === id ? 'page' : undefined}>{t(key)}</a>)}</nav>
      {error && <div className="error" role="alert">{error}</div>}
      {!ready && !error && <div className="panel muted">{t('app.loading')}</div>}

      {ready && tab === 'rooms' && (
        <main className="rooms">
          <aside className="room-list">
            {rooms.map((r) => {
              const m = st[r.id].min, s = st[r.id].size
              const status = r.size ? st[r.id].check?.status : 'min'
              return (
                <button key={r.id} className={`room-card ${r.id === selId ? 'on' : ''}`} onClick={() => setSelId(r.id)}>
                  <b>{tx(r.name)}</b>
                  <span>{sizeFt(s.w, s.d)}</span>
                  <span className={`tag ${status === 'too-small' ? 'warn' : status === 'fits' ? 'pass' : ''}`}>{status === 'too-small' ? t('card.tooSmall') : status === 'fits' ? t('card.fits') : t('card.min')}</span>{r.place && <span className="tag">{t('card.onLot')}</span>}
                  <span className="muted small">{t('card.minSize', { size: sizeFt(m.w, m.d) })}</span>
                </button>
              )
            })}
            <div className="add-room">
              <div className="muted small">{t('app.addRoom')}</div>
              <div className="chips">{TYPE_ORDER.map((ty) => <button key={ty} className="chip" onClick={() => addRoom(ty)}>+ {tx(ROOM_TYPES[ty].label)}</button>)}</div>
            </div>
          </aside>
          {room ? <RoomEditor key={room.id} room={room} rules={rules} geo={geo} ctx={st[room.id]?.ctx} lotNote={lotNote(room, st, rooms)} known={knownSizes(trace, room.type)} onChange={changeRoom} onDelete={() => deleteRoom(room.id)} /> : <div className="panel muted">{t('app.addToStart')}</div>}
        </main>
      )}
      {ready && tab === 'trace' && <TraceBoard trace={trace} rules={rules} nodes={nodes} pictureUrl={pictureUrl} pictureNote={pictureNote} onTrace={setTrace} onSample={pickSample} onUpload={upload} onCopyRooms={() => { const add = copyToRooms(trace); if (add.length) setRooms([...rooms, ...add]); return add.length }} />}
      {ready && tab === 'lot' && <LotBoard rooms={rooms} lot={lot} clusters={clusters} rules={rules} st={st} fps={fps} onRooms={setRooms} onLot={setLot} onClusters={setClusters} onOpenRoom={(id) => { setSelId(id); location.hash = 'rooms' }} />}
      {ready && tab === 'rules' && <RulesTable overrides={rules} onChange={setRules} />}
      {tab === 'tests' && <SpecTests />}
      {ready && tab === '3d' && (
        <section className="panel">
          {traceAim && <div className="chips">{['room', 'trace'].map((a) => <button key={a} className={`chip ${aim === a ? 'on' : ''}`} onClick={() => setAim(a)}>{t(`3d.aim.${a}`)}</button>)}</div>}
          <div className="muted small">{t('3d.line', { room: aim === 'trace' && traceAim ? t('3d.aim.trace') : room ? tx(room.name) : t('3d.noRoom'), gpu: backend ? t(`gpu.${backend}`) : '…' })}{postFx ? '' : t('3d.fxOff')}</div>
          <Suspense fallback={<div className="muted">{t('3d.loading')}</div>}>
            <View3D target={target} postFx={postFx && location.hash !== '#fx0'} onBackend={setBackend} />
          </Suspense>
        </section>
      )}
      <footer className="foot muted small">{t('app.footer')}</footer>
    </div>
  )
}

// What the lot board means for this room's walkway (shown in Rooms).
function lotNote(room, st, rooms) {
  const s = st[room.id]
  if (!room.place || room.type !== 'living') return null
  if (s.shared) return t('lotNote.shared', { names: tlist(s.sharedWith.map((w) => rooms.find((r) => r.id === w.id)?.name)) })
  return t('lotNote.alone')
}
