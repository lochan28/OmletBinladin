import { useEffect, useRef, useState } from 'react'
import { drive, fileIcon, findPath, recycleBin, type FileNode } from './fs'
import { say, sfx } from './sound'

export type AppSpec =
  | { app: 'notepad'; title?: string; content?: string }
  | { app: 'explorer'; path?: string[] }
  | { app: 'recycle' }
  | { app: 'ie'; url?: string }
  | { app: 'calc' }
  | { app: 'paint' }
  | { app: 'image'; file: Extract<FileNode, { kind: 'image' }> }
  | { app: 'msg'; title: string; text: string; icon?: string }
  | { app: 'password'; path: string[] }
  | { app: 'cricket' }
  | { app: 'run' }
  | { app: 'blocks' }
  | { app: 'shaktirun' }

export interface OS {
  open: (spec: AppSpec) => void
  close: () => void
  bsod: () => void
  party: () => void
  shake: () => void
}

export function openFile(os: OS, f: FileNode, path: string[]) {
  if (f.kind === 'folder') {
    if (f.password) return os.open({ app: 'password', path: [...path, f.name] })
    return os.open({ app: 'explorer', path: [...path, f.name] })
  }
  if (f.kind === 'text') return os.open({ app: 'notepad', title: f.name, content: f.content })
  if (f.kind === 'image') return os.open({ app: 'image', file: f })
  if (f.kind === 'link') return os.open({ app: 'ie', url: f.url })
  runExe(os, f.action)
}

export function runExe(os: OS, action: string) {
  switch (action) {
    case 'ie': return os.open({ app: 'ie' })
    case 'bsod': return os.bsod()
    case 'cricket': return os.open({ app: 'cricket' })
    case 'blocks': return os.open({ app: 'blocks' })
    case 'shaktirun': return os.open({ app: 'shaktirun' })
    case 'gta':
      sfx.error()
      return os.open({ app: 'msg', title: 'GTA3 Setup', icon: '💿', text: 'Please insert Disc 2 of 47.\n\n(Disc 1 was a pirated copy from Palika Bazaar. Disc 2 is a Kishore Kumar MP3 CD.)' })
    case 'mines':
      sfx.error()
      return os.open({ app: 'msg', title: 'Mine Sweeper', icon: '💣', text: 'Error: All mines are located in Mummy\'s chappal.\n\nDo not touch the chappal.' })
    case 'chitfund':
      sfx.chitFund()
      say('Ikkis din mein paisa double!')
      return os.open({ app: 'msg', title: 'Lakshmi Chit Fund ™', icon: '💸', text: '🎉 CONGRATULATIONS!! 🎉\n\nYour Rs 40 will become Rs 80 in just 21 days!\n\nStatus: Office closed. Owner ran away.\nPlease contact Baburao Ganpatrao Apte.' })
  }
}

/* ---------------- Notepad ---------------- */
export function Notepad({ content = '' }: { content?: string }) {
  const [text, setText] = useState(content)
  return (
    <div className="app-col">
      <div className="menubar"><u>F</u>ile <u>E</u>dit <u>S</u>earch <u>H</u>elp</div>
      <textarea className="notepad" value={text} onChange={e => setText(e.target.value)} spellCheck={false} />
    </div>
  )
}

/* ---------------- Explorer ---------------- */
export function Explorer({ os, start = ['C:'] }: { os: OS; start?: string[] }) {
  const [path, setPath] = useState(start)
  const node = findPath(path)
  const items = node?.kind === 'folder' ? node.children : []
  const go = (f: FileNode) => {
    sfx.click()
    if (f.kind === 'folder' && !f.password) setPath([...path, f.name])
    else openFile(os, f, path)
  }
  return (
    <div className="app-col">
      <div className="menubar"><u>F</u>ile <u>E</u>dit <u>V</u>iew <u>G</u>o F<u>a</u>vorites <u>H</u>elp</div>
      <div className="toolbar">
        <button disabled={path.length < 2} onClick={() => setPath(path.slice(0, -1))}>⬆ Up</button>
        <div className="field-row" style={{ flex: 1 }}>
          <label>Address</label>
          <input readOnly value={path.join('\\') + '\\'} style={{ flex: 1 }} />
        </div>
      </div>
      <div className="explorer-body">
        <div className="explorer-side">
          <b style={{ fontSize: 16 }}>{path[path.length - 1]}</b>
          <hr />
          <small>Select an item to view its description.</small>
        </div>
        <div className="icon-grid">
          {items.map(f => (
            <button key={f.name} className="file-icon" onDoubleClick={() => go(f)} onKeyDown={e => e.key === 'Enter' && go(f)}>
              <span className="emoji">{fileIcon(f)}</span>
              <span>{f.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="status-bar"><p className="status-bar-field">{items.length} object(s)</p><p className="status-bar-field">My Computer</p></div>
    </div>
  )
}

export function RecycleBin({ os }: { os: OS }) {
  const [items, setItems] = useState(recycleBin)
  return (
    <div className="app-col">
      <div className="toolbar">
        <button onClick={() => {
          setItems([]); sfx.shutdown(); say('Utha le re baba! Utha le!')
          os.open({ app: 'msg', title: 'Recycle Bin', icon: '🗑️', text: 'Utha le re baba... utha le!\n\nRecycle Bin has been emptied. Mere ko nahi, in files ko utha le.' })
        }}>Empty Recycle Bin</button>
      </div>
      <div className="icon-grid white">
        {items.map(f => (
          <button key={f.name} className="file-icon" onDoubleClick={() => openFile(os, f, ['C:'])}>
            <span className="emoji">{fileIcon(f)}</span><span>{f.name}</span>
          </button>
        ))}
        {!items.length && <i style={{ padding: 8 }}>Khaali. Bilkul khaali. Like Rahul's bank account.</i>}
      </div>
    </div>
  )
}

/* ---------------- Password (CID egg) ---------------- */
export function PasswordPrompt({ os, path }: { os: OS; path: string[] }) {
  const [pw, setPw] = useState('')
  const [tries, setTries] = useState(0)
  const node = findPath(path)
  const submit = () => {
    if (node?.kind === 'folder' && pw.toLowerCase() === node.password) {
      sfx.tada(); os.close(); os.open({ app: 'explorer', path })
      return
    }
    const t = tries + 1
    setTries(t); setPw(''); sfx.error()
    if (t >= 3) {
      os.shake(); say('Daya, darwaza tod do!')
      os.close()
      os.open({ app: 'msg', title: 'ACP Pradyuman', icon: '🕵️', text: '"Daya... darwaza tod do!"\n\n*CRASH*\n\nFolder door has been broken by Daya.\nHint for next time: who did Rahul write a letter to?' })
      os.open({ app: 'explorer', path })
    }
  }
  return (
    <div style={{ padding: 12, width: 300 }}>
      <p>🔒 This folder is password protected by Rahul.<br />Hint: <i>her name</i> 💕</p>
      <div className="field-row">
        <label>Password:</label>
        <input type="password" autoFocus value={pw} onChange={e => setPw(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()} />
      </div>
      {tries > 0 && <p style={{ color: 'red' }}>Kuch toh gadbad hai... ({3 - tries} tries left)</p>}
      <div style={{ textAlign: 'right', marginTop: 8 }}><button onClick={submit}>OK</button></div>
    </div>
  )
}

/* ---------------- Message box ---------------- */
export function MsgBox({ os, text, icon = 'ℹ️' }: { os: OS; text: string; icon?: string }) {
  return (
    <div style={{ padding: 12, maxWidth: 380 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <span style={{ fontSize: 32 }}>{icon}</span>
        <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{text}</p>
      </div>
      <div style={{ textAlign: 'center', marginTop: 12 }}><button autoFocus onClick={os.close}>OK</button></div>
    </div>
  )
}

/* ---------------- Image viewer ---------------- */
const scenes: Record<string, string> = {
  cricket: 'linear-gradient(#7ec8ff 0 55%, #3fa34d 55%)',
  mountains: 'linear-gradient(160deg, #cfe8ff 0 40%, #fff 40% 48%, #6b8f71 48%)',
  selfie: 'radial-gradient(circle at 50% 40%, #e0ac69 0 22%, transparent 23%), linear-gradient(#f4d35e, #ee964b)',
  ship: 'linear-gradient(#1b2a49 0 60%, #0b6e99 60%)',
}
const sceneEmoji: Record<string, string> = { cricket: '🏏🧢🏟️', mountains: '🏔️🚂👨‍👩‍👦', selfie: '😎', ship: '🚢🧊💔' }

export function ImageViewer({ file }: { file: Extract<FileNode, { kind: 'image' }> }) {
  return (
    <div style={{ padding: 8, width: 360 }}>
      <div className="photo" style={{ background: scenes[file.scene] }}>
        <span>{sceneEmoji[file.scene]}</span>
        <em>{file.name.includes('99') ? '99 06 12' : '98 10 03'}</em>
      </div>
      <p style={{ fontStyle: 'italic' }}>{file.caption}</p>
    </div>
  )
}

/* ---------------- Calculator ---------------- */
export function Calculator({ os }: { os: OS }) {
  const [disp, setDisp] = useState('0')
  const press = (k: string) => {
    sfx.click()
    if (k === 'C') return setDisp('0')
    if (k === '=') {
      let r: number
      try { r = Function(`"use strict";return (${disp.replace(/×/g, '*').replace(/÷/g, '/')})`)() } catch { sfx.error(); return setDisp('Kuch toh gadbad hai') }
      setDisp(String(r))
      if (r === 2000) { os.shake(); sfx.bsod(); say('Y2K aa gaya! Bhaago!'); os.open({ app: 'msg', title: 'Y2K DETECTED', icon: '☢️', text: 'Y2K DETECTED!!\n\n2000 = 1900. All your money is now zero.\nRUN. Take the Maggi.' }) }
      if (r === 420) { sfx.error(); os.open({ app: 'msg', title: 'Police Alert', icon: '🚨', text: 'Char sau bees detected!\nLakshmi Chit Fund wale ho kya?' }) }
      if (r === 786 || r === 143) { sfx.tada(); say('Mogambo khush hua!'); os.open({ app: 'msg', title: 'Mogambo', icon: '😈', text: 'Mogambo khush hua!' }) }
      return
    }
    setDisp(disp === '0' || isNaN(Number(disp[0])) && disp.length > 3 ? k : disp + k)
  }
  const keys = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '-', '0', 'C', '=', '+']
  return (
    <div style={{ padding: 8, width: 220 }}>
      <input className="calc-display" readOnly value={disp} />
      <div className="calc-grid">{keys.map(k => <button key={k} onClick={() => press(k)}>{k}</button>)}</div>
      <small>Try 1999+1. Or 420. 😏</small>
    </div>
  )
}

/* ---------------- Paint ---------------- */
export function Paint() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [color, setColor] = useState('#000000')
  const drawing = useRef(false)
  useEffect(() => {
    const c = ref.current!.getContext('2d')!
    c.fillStyle = '#fff'; c.fillRect(0, 0, 460, 300)
    c.fillStyle = '#000'; c.font = '14px "Comic Sans MS", cursive'
    c.fillText('self portrait (very handsome) - Rahul', 10, 290)
    c.beginPath(); c.arc(230, 130, 60, 0, Math.PI * 2); c.stroke()
    c.fillText('😎', 205, 140)
  }, [])
  const draw = (e: React.PointerEvent) => {
    if (!drawing.current) return
    const r = ref.current!.getBoundingClientRect()
    const c = ref.current!.getContext('2d')!
    c.fillStyle = color
    c.fillRect(e.clientX - r.left - 2, e.clientY - r.top - 2, 4, 4)
  }
  const colors = ['#000000', '#808080', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffffff', '#ff8800']
  return (
    <div className="app-col">
      <div className="menubar"><u>F</u>ile <u>E</u>dit <u>V</u>iew <u>I</u>mage <u>C</u>olors <u>H</u>elp</div>
      <div style={{ background: '#808080', padding: 4 }}>
        <canvas ref={ref} width={460} height={300} style={{ cursor: 'crosshair', touchAction: 'none' }}
          onPointerDown={e => { drawing.current = true; draw(e) }} onPointerMove={draw}
          onPointerUp={() => (drawing.current = false)} onPointerLeave={() => (drawing.current = false)} />
      </div>
      <div className="palette">{colors.map(c => <button key={c} style={{ background: c }} className={c === color ? 'sel' : ''} onClick={() => setColor(c)} />)}</div>
    </div>
  )
}

/* ---------------- Cricket 99 (original mini-game) ---------------- */
export function Cricket() {
  const [pos, setPos] = useState(0)
  const [score, setScore] = useState(0)
  const [balls, setBalls] = useState(6)
  const [msg, setMsg] = useState('Press SWING when the ball is in the green zone!')
  const dir = useRef(1)
  useEffect(() => {
    if (balls <= 0) return
    const t = setInterval(() => {
      setPos(p => { let n = p + dir.current * 4; if (n >= 100 || n <= 0) dir.current *= -1; return Math.max(0, Math.min(100, n)) })
    }, 30)
    return () => clearInterval(t)
  }, [balls])
  const swing = () => {
    if (balls <= 0) return
    const d = Math.abs(pos - 50)
    const runs = d < 4 ? 6 : d < 10 ? 4 : d < 20 ? 1 : 0
    setScore(s => s + runs); setBalls(b => b - 1)
    if (runs === 6) { sfx.tada(); setMsg('SIXER! "Ek dum jhakaas!" 🏏') }
    else if (runs === 4) { sfx.ding(); setMsg('FOUR! Shandaar shot!') }
    else if (runs) { sfx.click(); setMsg('Single. Dadi says "thoda dhyaan se beta".') }
    else { sfx.error(); setMsg('OUT! Bowled! Light chali gayi... 🕯️') }
  }
  return (
    <div style={{ padding: 12, width: 320, textAlign: 'center' }}>
      <h4 style={{ margin: 0 }}>🏏 CRICKET 99 — Gully Edition</h4>
      <p>Score: <b>{score}</b> | Balls left: {balls}</p>
      <div className="cricket-bar"><div className="zone" /><div className="ball" style={{ left: `${pos}%` }}>⚾</div></div>
      <p style={{ minHeight: 32 }}>{balls > 0 ? msg : `Innings over! ${score} runs. ${score >= 24 ? 'Selected for India! 🇮🇳' : 'Papa: "padhai kar lo beta"'}`}</p>
      {balls > 0 ? <button onClick={swing} autoFocus>SWING!</button> : <button onClick={() => { setScore(0); setBalls(6) }}>Play again</button>}
    </div>
  )
}

/* ---------------- Run dialog ---------------- */
export function RunDialog({ os }: { os: OS }) {
  const [cmd, setCmd] = useState('')
  const run = () => {
    const c = cmd.trim().toLowerCase()
    os.close()
    if (c === 'binod') { say('Binod'); return os.open({ app: 'msg', title: 'Binod', icon: '🗣️', text: 'Binod\nBinod\nBinod\nBinod\n\n(This message is from the future. How did you know?)' }) }
    if (c === 'format c:') return os.bsod()
    if (c === 'iexplore' || c.startsWith('www')) return os.open({ app: 'ie', url: c.startsWith('www') ? c : undefined })
    if (c === 'notepad') return os.open({ app: 'notepad' })
    if (c === 'calc') return os.open({ app: 'calc' })
    if (c === 'mspaint') return os.open({ app: 'paint' })
    if (c === 'shaktimaan') { say('Sorry Shaktimaan'); return os.open({ app: 'msg', title: 'Shaktimaan', icon: '🌀', text: 'Sorry Shaktimaan.\n\nAndhera kayamat hai. Please do not spin around and jump off the roof.' }) }
    if (c === 'sachin') { sfx.tada(); return os.open({ app: 'msg', title: 'God', icon: '🙏', text: 'Saaaachin! Saaaachin!\nThis computer bows to you.' }) }
    sfx.error()
    os.open({ app: 'msg', title: c || 'Run', icon: '❌', text: `Cannot find '${c}'.\nKuch toh gadbad hai, Daya.\n\nTry: binod, shaktimaan, sachin, format c:` })
  }
  return (
    <div style={{ padding: 12, width: 340 }}>
      <p>Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</p>
      <div className="field-row"><label>Open:</label><input autoFocus style={{ flex: 1 }} value={cmd} onChange={e => setCmd(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()} /></div>
      <div style={{ textAlign: 'right', marginTop: 8, display: 'flex', gap: 6, justifyContent: 'flex-end' }}><button onClick={run}>OK</button><button onClick={os.close}>Cancel</button></div>
    </div>
  )
}

export { drive }
