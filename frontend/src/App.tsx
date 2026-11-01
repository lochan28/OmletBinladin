import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Calculator, Cricket, Explorer, ImageViewer, MsgBox, Notepad, Paint, PasswordPrompt, RecycleBin, RunDialog,
  runExe, type AppSpec, type OS,
} from './apps'
import { InternetExplorer } from './ie'
import { Blocks } from './blocks'
import { isMuted, say, setMuted, sfx } from './sound'

interface Win { id: number; spec: AppSpec; title: string; icon: string; x: number; y: number; z: number; min: boolean; max: boolean }

const meta: Record<AppSpec['app'], { title: string; icon: string }> = {
  notepad: { title: 'Notepad', icon: '📝' }, explorer: { title: 'Exploring', icon: '📁' }, recycle: { title: 'Recycle Bin', icon: '🗑️' },
  ie: { title: 'Microsoft Internet Explorer', icon: '🌐' }, calc: { title: 'Calculator', icon: '🧮' }, paint: { title: 'untitled - Paint', icon: '🎨' },
  image: { title: 'Image Preview', icon: '🖼️' }, msg: { title: 'Message', icon: 'ℹ️' }, password: { title: 'Enter Password', icon: '🔒' },
  cricket: { title: 'Cricket 99', icon: '🏏' }, run: { title: 'Run', icon: '🏃' }, blocks: { title: 'Shaktimaan Blocks', icon: '🧱' },
}

const clippyLines = [
  'It looks like you\'re trying to escape 1999. Would you like help?',
  'Kuch toh gadbad hai. Have you checked System32?',
  'Tip: Rahul\'s password is the name of someone he likes. 💕',
  'It looks like you\'re writing a letter. Should I forward it to Pinky\'s Papa?',
  'Did you know? Running "binod" in Start → Run does something.',
  'Try typing 1999+1 in Calculator. I dare you.',
  'Ye Baburao ka style hai! (I don\'t know what that means, I\'m a paperclip)',
  'Psst... ↑ ↑ ↓ ↓ ← → ← → B A',
]

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

function title(spec: AppSpec) {
  if (spec.app === 'notepad' && spec.title) return `${spec.title} - Notepad`
  if (spec.app === 'explorer') return spec.path?.join('\\') ?? 'My Computer'
  if (spec.app === 'image') return `${spec.file.name} - Image Preview`
  if (spec.app === 'msg') return spec.title
  return meta[spec.app].title
}

function Boot({ onDone }: { onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([])
  const [splash, setSplash] = useState(false)
  const done = useRef(onDone)
  done.current = onDone
  useEffect(() => {
    setLines([])
    const all = [
      'Award Modular BIOS v4.51PG, An Energy Star Ally',
      'Copyright (C) 1984-98, Award Software, Inc.',
      '',
      'PENTIUM-MMX CPU at 166MHz',
      'Memory Test : 32768K OK  (Uncle: "itna RAM kya karega?")',
      '',
      'Detecting IDE Primary Master ... RAHUL_HDD 2.1GB',
      'Detecting Floppy ... Hera Pheri songs (Side A)',
      '',
      'WARNING: Windows was not shut down properly.',
      'Last shutdown: 31-12-1999 23:59:58  (that was 27 years ago)',
      'Running ScanDisk... found 1 diary, 1 love letter, 0 courage.',
      '',
      'Starting Windows 98...',
    ]
    const ts = all.map((l, i) => setTimeout(() => setLines(x => [...x, l]), i * 220))
    ts.push(setTimeout(() => { setSplash(true); sfx.startup() }, all.length * 220 + 400))
    ts.push(setTimeout(() => done.current(), all.length * 220 + 3800))
    return () => ts.forEach(clearTimeout)
  }, [])
  if (splash) return (
    <div className="splash" onClick={onDone}>
      <div className="splash-logo"><span className="flag">🪟</span><div><small>Microsoft®</small><h1>Windows<sup>98</sup></h1></div></div>
      <div className="splash-bar" />
    </div>
  )
  return <pre className="bios" onClick={onDone}>{lines.join('\n')}<span className="cursor">_</span></pre>
}

function Bsod({ onKey }: { onKey: () => void }) {
  useEffect(() => {
    const h = () => onKey()
    const t = setTimeout(() => window.addEventListener('keydown', h), 600)
    return () => { clearTimeout(t); window.removeEventListener('keydown', h) }
  }, [onKey])
  return (
    <div className="bsod" onClick={onKey}>
      <p><span className="bsod-title"> Windows </span></p>
      <p>A fatal exception 0E has occurred at 0028:C0011E36 in VXD VMM(01) + 00010E36.<br />
        The current application will be terminated.</p>
      <p>* ACP Pradyuman says: "Kuch toh gadbad hai, Daya."<br />
        * Daya has been dispatched to break the door of System32.<br />
        * Rahul's report card has been permanently deleted. Mummy has been notified.</p>
      <p style={{ textAlign: 'center' }}>Press any key to continue _</p>
    </div>
  )
}

export default function App() {
  const [phase, setPhase] = useState<'boot' | 'desk' | 'bsod' | 'off'>('boot')
  const [wins, setWins] = useState<Win[]>([])
  const [active, setActive] = useState<number | null>(null)
  const [start, setStart] = useState(false)
  const [clippy, setClippy] = useState<number | null>(null)
  const [clock, setClock] = useState(new Date())
  const [party, setParty] = useState(false)
  const [shake, setShake] = useState(false)
  const [muted, setMute] = useState(isMuted())
  const [sel, setSel] = useState<string | null>(null)
  const nextId = useRef(1)
  const topZ = useRef(10)
  const activeRef = useRef<number | null>(null)
  activeRef.current = active

  const open = useCallback((spec: AppSpec) => {
    const id = nextId.current++
    const z = ++topZ.current
    const n = id % 8
    setWins(w => [...w, { id, spec, title: title(spec), icon: spec.app === 'msg' ? (spec.icon ?? 'ℹ️') : meta[spec.app].icon, x: 80 + n * 26, y: 40 + n * 22, z, min: false, max: false }])
    setActive(id); setStart(false)
    if (spec.app !== 'msg') sfx.open()
  }, [])
  const closeWin = useCallback((id: number) => { setWins(w => w.filter(x => x.id !== id)); sfx.close() }, [])
  const focus = (id: number) => { setWins(w => w.map(x => x.id === id ? { ...x, z: ++topZ.current, min: false } : x)); setActive(id) }

  const makeOS = (id: number): OS => ({
    open,
    close: () => closeWin(id),
    bsod: () => { setPhase('bsod'); sfx.bsod() },
    party: () => setParty(true),
    shake: () => { setShake(true); setTimeout(() => setShake(false), 600) },
  })

  useEffect(() => { const t = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(t) }, [])

  // Clippy shows up after a while, and keeps coming back
  useEffect(() => {
    if (phase !== 'desk') return
    const t = setInterval(() => setClippy(c => (c === null ? Math.floor(Math.random() * clippyLines.length) : c)), 25000)
    const first = setTimeout(() => setClippy(0), 9000)
    return () => { clearInterval(t); clearTimeout(first) }
  }, [phase])

  // Konami code → 1999 dance party
  useEffect(() => {
    let buf: string[] = []
    const h = (e: KeyboardEvent) => {
      buf = [...buf, e.key].slice(-KONAMI.length)
      if (buf.join() === KONAMI.join()) { setParty(true); sfx.party(); say('Ye Baburao ka style hai!') }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])
  useEffect(() => { if (party) { const t = setTimeout(() => setParty(false), 8000); return () => clearTimeout(t) } }, [party])

  const drag = (e: React.PointerEvent, w: Win) => {
    if (w.max) return
    focus(w.id)
    const sx = e.clientX - w.x, sy = e.clientY - w.y
    const move = (ev: PointerEvent) => setWins(ws => ws.map(x => x.id === w.id ? { ...x, x: ev.clientX - sx, y: Math.max(0, ev.clientY - sy) } : x))
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
  }

  const shutdown = () => { setStart(false); setWins([]); sfx.shutdown(); setPhase('off') }

  if (phase === 'boot') return <Boot onDone={() => setPhase('desk')} />
  if (phase === 'bsod') return <Bsod onKey={() => { setWins([]); setPhase('boot') }} />
  if (phase === 'off') return (
    <div className="off" onClick={() => { say('Picture abhi baaki hai mere dost'); setPhase('boot') }}>
      <p>It's now safe to turn off<br />your computer.</p>
      <small>(click to turn on again... picture abhi baaki hai mere dost)</small>
    </div>
  )

  const icons: { label: string; icon: string; run: () => void }[] = [
    { label: 'My Computer', icon: '🖥️', run: () => open({ app: 'explorer', path: ['C:'] }) },
    { label: 'My Documents', icon: '📁', run: () => open({ app: 'explorer', path: ['C:', 'My Documents'] }) },
    { label: 'Internet Explorer', icon: '🌐', run: () => open({ app: 'ie' }) },
    { label: 'Recycle Bin', icon: '🗑️', run: () => open({ app: 'recycle' }) },
    { label: 'Games', icon: '🎮', run: () => open({ app: 'explorer', path: ['C:', 'Games'] }) },
    { label: 'DO_NOT_OPEN.txt', icon: '📄', run: () => open({ app: 'notepad', title: 'DO_NOT_OPEN.txt', content: 'ok you opened it.\n\nnow Mummy knows.\n\n(she always knows)' }) },
    { label: 'Hawala', icon: '💸', run: () => runExe(makeOS(0), 'chitfund') },
  ]

  return (
    <div className={`desktop ${party ? 'party' : ''} ${shake ? 'shake' : ''}`} onPointerDown={() => { setStart(false) }}>
      <div className="desk-icons">
        {icons.map(i => (
          <button key={i.label} className={`desk-icon ${sel === i.label ? 'sel' : ''}`}
            onClick={e => { e.stopPropagation(); setSel(i.label) }} onDoubleClick={i.run} onKeyDown={e => e.key === 'Enter' && i.run()}>
            <span className="emoji">{i.icon}</span><span className="lbl">{i.label}</span>
          </button>
        ))}
      </div>

      {wins.map(w => (
        <div key={w.id} className={`window ${w.max ? 'max' : ''}`} style={{ left: w.x, top: w.y, zIndex: w.z, display: w.min ? 'none' : undefined }}
          onPointerDown={e => { e.stopPropagation(); if (activeRef.current !== w.id) focus(w.id) }}>
          <div className={`title-bar ${active === w.id ? '' : 'inactive'}`} onPointerDown={e => drag(e, w)}
            onDoubleClick={() => setWins(ws => ws.map(x => x.id === w.id ? { ...x, max: !x.max } : x))}>
            <div className="title-bar-text">{w.icon} {w.title}</div>
            <div className="title-bar-controls" onPointerDown={e => e.stopPropagation()}>
              {w.spec.app !== 'msg' && <>
                <button aria-label="Minimize" onClick={() => setWins(ws => ws.map(x => x.id === w.id ? { ...x, min: true } : x))} />
                <button aria-label={w.max ? 'Restore' : 'Maximize'} onClick={() => setWins(ws => ws.map(x => x.id === w.id ? { ...x, max: !x.max } : x))} />
              </>}
              <button aria-label="Close" onClick={() => closeWin(w.id)} />
            </div>
          </div>
          <div className="window-body">{renderApp(w.spec, makeOS(w.id))}</div>
        </div>
      ))}

      {clippy !== null && (
        <div className="clippy" onPointerDown={e => e.stopPropagation()}>
          <div className="bubble">
            {clippyLines[clippy]}
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              <button onClick={() => { sfx.click(); setClippy((clippy + 1) % clippyLines.length) }}>Tell me more</button>
              <button onClick={() => setClippy(null)}>Go away</button>
            </div>
          </div>
          <div className="clip" onClick={() => setClippy((clippy + 1) % clippyLines.length)}>📎<span className="eyes">👀</span></div>
        </div>
      )}

      {start && (
        <div className="start-menu window" onPointerDown={e => e.stopPropagation()}>
          <div className="start-side"><b>Windows</b>98</div>
          <ul>
            <li onClick={() => open({ app: 'ie' })}>🌐 Internet Explorer</li>
            <li onClick={() => open({ app: 'explorer', path: ['C:', 'My Documents'] })}>📁 Documents</li>
            <li onClick={() => open({ app: 'notepad' })}>📝 Notepad</li>
            <li onClick={() => open({ app: 'paint' })}>🎨 Paint</li>
            <li onClick={() => open({ app: 'calc' })}>🧮 Calculator</li>
            <li onClick={() => open({ app: 'cricket' })}>🏏 Cricket 99</li>
            <li onClick={() => open({ app: 'blocks' })}>🧱 Shaktimaan Blocks</li>
            <li onClick={() => open({ app: 'msg', title: 'Help', icon: '❓', text: 'Windows Help is unavailable.\n\nPlease ask the nearest 12-year-old.' })}>❓ Help</li>
            <li onClick={() => open({ app: 'run' })}>🏃 Run...</li>
            <hr />
            <li onClick={shutdown}>⏻ Shut Down...</li>
          </ul>
        </div>
      )}

      <div className="taskbar" onPointerDown={e => e.stopPropagation()}>
        <button className={`start-btn ${start ? 'active' : ''}`} onClick={() => { sfx.click(); setStart(!start) }}><b>🪟 Start</b></button>
        <div className="tasks">
          {wins.map(w => (
            <button key={w.id} className={active === w.id && !w.min ? 'active' : ''}
              onClick={() => (active === w.id && !w.min ? setWins(ws => ws.map(x => x.id === w.id ? { ...x, min: true } : x)) : focus(w.id))}>
              {w.icon} {w.title}
            </button>
          ))}
        </div>
        <div className="tray">
          <span style={{ cursor: 'pointer' }} title="Volume" onClick={() => { setMuted(!muted); setMute(!muted) }}>{muted ? '🔇' : '🔊'}</span>
          <span title={`${clock.toLocaleDateString()} — but this PC thinks it's still 1999`}>
            {clock.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  )
}

function renderApp(spec: AppSpec, os: OS) {
  switch (spec.app) {
    case 'notepad': return <Notepad content={spec.content} />
    case 'explorer': return <Explorer os={os} start={spec.path} />
    case 'recycle': return <RecycleBin os={os} />
    case 'ie': return <InternetExplorer os={os} url={spec.url} />
    case 'calc': return <Calculator os={os} />
    case 'paint': return <Paint />
    case 'image': return <ImageViewer file={spec.file} />
    case 'msg': return <MsgBox os={os} text={spec.text} icon={spec.icon} />
    case 'password': return <PasswordPrompt os={os} path={spec.path} />
    case 'cricket': return <Cricket />
    case 'run': return <RunDialog os={os} />
    case 'blocks': return <Blocks />
  }
}
