import { useEffect, useState } from 'react'
import type { OS } from './apps'
import { say, sfx } from './sound'

const HOME = 'www.khojo.com'
let connected = false

const emails = [
  { from: 'chain_mail@khojo.com', subj: 'FWD: FWD: FWD: Sachin will get out!!', body: 'Forward this to 10 people or Sachin gets out for 0 in next match.\nRamesh from Kanpur did not forward. Next day his Maggi was overcooked.\nDO NOT BREAK THE CHAIN.' },
  { from: 'baburao@lakshmichitfund.com', subj: '21 din mein paisa DOUBLE', body: 'Namaskar, Lakshmi Chit Fund se bol raha hu.\nInvest Rs 40 today. Get Rs 80 in 21 days.\nOffice address: we will tell you after you pay.\n\n- Baburao Ganpatrao Apte' },
  { from: 'cool_dude_99@khojo.com', subj: 'Y2K is coming. Hide.', body: 'bhai at 12:00 tonight every computer explodes\nunplug everything. even the fridge. even the doorbell.\nsee you in 2000 (if we survive)' },
  { from: 'principal@dpsbhilai.edu', subj: 'Regarding report card', body: 'Dear Mr. Kumar,\nYour son\'s Physics marks are 97. He was absent for the exam.\nPlease meet me Monday.\n' },
  { from: 'pinky_1999@khojo.com', subj: 're: letter', body: 'who wrote this letter. pintu says he did.\nalso i still have your physics notes. they are very bad.' },
]

function Khojo({ go }: { go: (u: string) => void }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<string[] | null>(null)
  const search = () => {
    const s = q.toLowerCase()
    if (s.includes('binod')) say('Binod')
    setResults([
      `Results for "${q}" — 3 found in 47.8 seconds (fast!)`,
      s.includes('y2k') ? 'Y2K: Will your toaster explode? Experts say: maybe' : `${q} — Free download! (virus included, no extra charge)`,
      'Rahul\'s Cricket Kingdom — best site on the internet (by Rahul)',
      `Did you mean: "${q} kaise kare"?`,
    ])
  }
  return (
    <div className="site khojo">
      <marquee>★ Welcome to KHOJO! — India's No.1 search engine since last Tuesday ★ Now with 28.8k speed!! ★</marquee>
      <h1 className="khojo-logo"><span style={{ color: '#d00' }}>K</span><span style={{ color: '#f80' }}>h</span><span style={{ color: '#080' }}>o</span><span style={{ color: '#00c' }}>j</span><span style={{ color: '#d00' }}>o</span><span>!</span></h1>
      <div style={{ textAlign: 'center' }}>
        <input value={q} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && search()} style={{ width: 260 }} />{' '}
        <button onClick={search}>Khojo!</button> <button onClick={() => { setQ('binod'); say('Binod') }}>I'm Feeling Binod</button>
      </div>
      {results && <ul>{results.map((r, i) => <li key={i}>{i === 2 ? <a href="#" onClick={e => { e.preventDefault(); go('www.geocities.com/rahul_cricket_kingdom') }}>{r}</a> : r}</li>)}</ul>}
      <table className="portal"><tbody><tr>
        <td><b>Channels</b><br /><a href="#" onClick={e => { e.preventDefault(); go('www.geocities.com/rahul_cricket_kingdom') }}>Cricket</a><br /><a href="#" onClick={e => { e.preventDefault(); go('www.jhakaasmail.com') }}>Jhakaas Mail</a><br /><a href="#" onClick={e => { e.preventDefault(); go('www.doordarshan.gov') }}>Doordarshan</a></td>
        <td><b>Today's News — 31 Dec 1999</b><br />• Y2K: Govt advises citizens to "stay calm and unplug fridge"<br />• Nokia launches phone that survives being dropped from Qutub Minar<br />• Local boy edits report card in Paint, caught due to Comic Sans</td>
        <td><b>Weather</b><br />Bhilai: 22°C<br />Chance of apocalypse: 47%</td>
      </tr></tbody></table>
      <p className="center"><small>Best viewed in Internet Explorer 4.0 at 800×600. You are visitor #000{Math.floor(Math.random() * 900 + 100)}</small></p>
    </div>
  )
}

function Geocities() {
  const [signed, setSigned] = useState(['Pintu: nice site bhai (i am cool_dude_99)', 'Mummy: Rahul come and eat food', 'Anonymous: who is pinky 👀'])
  const [name, setName] = useState('')
  return (
    <div className="site geo">
      <h1 className="rainbow">🏏 RAHUL'S CRICKET KINGDOM 🏏</h1>
      <p className="blink">🚧 UNDER CONSTRUCTION 🚧</p>
      <marquee scrollamount={10}>SACHIN IS GOD ★ SACHIN IS GOD ★ SACHIN IS GOD ★ forward this site to 10 people ★</marquee>
      <p>Welcome to my homepage!!! This site is about cricket, Shaktimaan, and NOT about Pinky.</p>
      <h3>My Top 5 Things</h3>
      <ol><li>Sachin</li><li>Shaktimaan (sorry Shaktimaan)</li><li>Maggi (2 minute. it is never 2 minute)</li><li>CID on Friday night</li><li>Hera Pheri songs (on cassette)</li></ol>
      <h3>✍️ Guestbook</h3>
      <ul>{signed.map((s, i) => <li key={i}>{s}</li>)}</ul>
      <div className="field-row"><input placeholder="Your message" value={name} onChange={e => setName(e.target.value)} /><button onClick={() => { if (name) { setSigned([...signed, `You: ${name}`]); setName(''); sfx.ding() } }}>Sign!</button></div>
      <p className="center">Visitors: <span className="counter">000014</span> (11 are me)</p>
      <p className="center"><small>This site is part of the <a href="#">Desi Cricket WebRing</a> ← Prev | Next →</small></p>
    </div>
  )
}

function Mail() {
  const [sel, setSel] = useState(0)
  return (
    <div className="site mail">
      <div className="mail-head">📬 Jhakaas Mail — Inbox (5 unread) — rahul_rocks_1999@khojo.com</div>
      <table className="mail-list"><tbody>
        {emails.map((m, i) => <tr key={i} className={i === sel ? 'sel' : ''} onClick={() => { setSel(i); sfx.click() }}><td>{m.from}</td><td><b>{m.subj}</b></td></tr>)}
      </tbody></table>
      <pre className="mail-body">{emails[sel].body}</pre>
    </div>
  )
}

function Rukawat() {
  useEffect(() => { sfx.bsod(); say('Rukaavat ke liye khed hai') }, [])
  return (
    <div className="site rukawat">
      <div className="testcard">{['#fff', '#ff0', '#0ff', '#0f0', '#f0f', '#f00', '#00f'].map(c => <div key={c} style={{ background: c }} />)}</div>
      <h1>रुकावट के लिए खेद है</h1>
      <p>Rukawat ke liye khed hai. The page cannot be displayed.<br />(Antenna ko thoda left ghumao)</p>
    </div>
  )
}

const sites: Record<string, (go: (u: string) => void) => React.ReactElement> = {
  [HOME]: go => <Khojo go={go} />,
  'www.geocities.com/rahul_cricket_kingdom': () => <Geocities />,
  'www.jhakaasmail.com': () => <Mail />,
}

export function InternetExplorer({ url = HOME }: { os: OS; url?: string }) {
  const [hist, setHist] = useState([url])
  const [idx, setIdx] = useState(0)
  const [addr, setAddr] = useState(url)
  const [dialing, setDialing] = useState(!connected)
  const cur = hist[idx]
  useEffect(() => {
    if (connected) return
    sfx.dialup()
    const t = setTimeout(() => { connected = true; setDialing(false) }, 4200)
    return () => clearTimeout(t)
  }, [])
  const go = (u: string) => {
    u = u.replace(/^https?:\/\//, '').replace(/\/$/, '')
    const h = [...hist.slice(0, idx + 1), u]
    setHist(h); setIdx(h.length - 1); setAddr(u); sfx.click()
  }
  const page = sites[cur]
  return (
    <div className="app-col">
      <div className="menubar"><u>F</u>ile <u>E</u>dit <u>V</u>iew F<u>a</u>vorites <u>T</u>ools <u>H</u>elp</div>
      <div className="toolbar">
        <button disabled={idx === 0} onClick={() => { setIdx(idx - 1); setAddr(hist[idx - 1]) }}>◀ Back</button>
        <button disabled={idx >= hist.length - 1} onClick={() => { setIdx(idx + 1); setAddr(hist[idx + 1]) }}>Forward ▶</button>
        <button onClick={() => go(HOME)}>🏠 Home</button>
        <button onClick={() => go('www.jhakaasmail.com')}>📬 Mail</button>
      </div>
      <div className="toolbar">
        <label>Address</label>
        <input style={{ flex: 1 }} value={addr} onChange={e => setAddr(e.target.value)} onKeyDown={e => e.key === 'Enter' && go(addr)} />
        <button onClick={() => go(addr)}>Go</button>
      </div>
      <div className="ie-page">
        {dialing ? <div className="dialing"><p>📞 Dialing VSNL... <br />Connecting at 28.8 Kbps...<br /><br /><small>(Please do not pick up the phone, Mummy)</small></p></div>
          : page ? page(go) : <Rukawat />}
      </div>
      <div className="status-bar"><p className="status-bar-field">{dialing ? 'Connecting...' : 'Done'}</p><p className="status-bar-field">🌐 Internet zone</p></div>
    </div>
  )
}
