import { useCallback, useEffect, useRef, useState } from 'react'
import { say, sfx } from './sound'

const W = 10, H = 18
const SHAPES = [
  { c: '#00f0f0', m: [[1, 1, 1, 1]] },
  { c: '#f0f000', m: [[1, 1], [1, 1]] },
  { c: '#a000f0', m: [[0, 1, 0], [1, 1, 1]] },
  { c: '#00f000', m: [[0, 1, 1], [1, 1, 0]] },
  { c: '#f00000', m: [[1, 1, 0], [0, 1, 1]] },
  { c: '#0000f0', m: [[1, 0, 0], [1, 1, 1]] },
  { c: '#f0a000', m: [[0, 0, 1], [1, 1, 1]] },
]
const clearLines = ['Sorry Shaktimaan!', 'Andhera kayamat hai!', 'Shaktimaan aa gaya!']

type Grid = (string | null)[][]
interface Piece { m: number[][]; c: string; x: number; y: number }

const empty = (): Grid => Array.from({ length: H }, () => Array(W).fill(null))
const rand = (): Piece => { const s = SHAPES[Math.floor(Math.random() * SHAPES.length)]; return { m: s.m, c: s.c, x: 3, y: 0 } }
const rotate = (m: number[][]) => m[0].map((_, i) => m.map(r => r[i]).reverse())
const fits = (g: Grid, p: Piece) => p.m.every((r, dy) => r.every((v, dx) => {
  if (!v) return true
  const x = p.x + dx, y = p.y + dy
  return x >= 0 && x < W && y < H && (y < 0 || !g[y][x])
}))

export function Blocks() {
  const [grid, setGrid] = useState(empty)
  const [piece, setPiece] = useState(rand)
  const [score, setScore] = useState(0)
  const [over, setOver] = useState(false)
  const [hero, setHero] = useState<string | null>(null)
  const state = useRef({ grid, piece, over })
  state.current = { grid, piece, over }

  const lock = useCallback((g: Grid, p: Piece) => {
    const ng = g.map(r => [...r])
    p.m.forEach((r, dy) => r.forEach((v, dx) => { if (v && p.y + dy >= 0) ng[p.y + dy][p.x + dx] = p.c }))
    const kept = ng.filter(r => r.some(c => !c))
    const cleared = H - kept.length
    if (cleared) {
      setScore(s => s + [0, 100, 300, 500, 800][cleared])
      const line = clearLines[Math.floor(Math.random() * clearLines.length)]
      setHero(line); sfx.tada(); say(line)
      setTimeout(() => setHero(null), 1800)
    } else sfx.click()
    const filled = [...Array.from({ length: cleared }, () => Array(W).fill(null)), ...kept]
    const next = rand()
    setGrid(filled)
    if (!fits(filled, next)) { setOver(true); sfx.shutdown(); say('Picture abhi baaki hai mere dost') }
    setPiece(next)
  }, [])

  const move = useCallback((dx: number, dy: number, rot = false) => {
    const { grid: g, piece: p, over: o } = state.current
    if (o) return
    const np = { ...p, x: p.x + dx, y: p.y + dy, m: rot ? rotate(p.m) : p.m }
    if (fits(g, np)) setPiece(np)
    else if (dy) lock(g, p)
  }, [lock])

  useEffect(() => {
    const t = setInterval(() => move(0, 1), Math.max(120, 600 - score / 10))
    return () => clearInterval(t)
  }, [move, score])

  const onKey = (e: React.KeyboardEvent) => {
    const k: Record<string, () => void> = {
      ArrowLeft: () => move(-1, 0), ArrowRight: () => move(1, 0), ArrowDown: () => move(0, 1), ArrowUp: () => move(0, 0, true),
      ' ': () => { const { grid: g, piece: p } = state.current; let y = p.y; while (fits(g, { ...p, y: y + 1 })) y++; lock(g, { ...p, y }) },
    }
    if (k[e.key]) { e.preventDefault(); k[e.key]() }
  }

  const view = grid.map(r => [...r])
  piece.m.forEach((r, dy) => r.forEach((v, dx) => { if (v && piece.y + dy >= 0) view[piece.y + dy][piece.x + dx] = piece.c }))

  return (
    <div className="blocks" tabIndex={0} autoFocus onKeyDown={onKey} ref={el => el?.focus()}>
      <div className="blocks-board">
        {view.flat().map((c, i) => <div key={i} className="cell" style={c ? { background: c } : undefined} />)}
        {hero && <div className="hero-fly"><span className="emoji">🌀🦸</span><b>{hero}</b></div>}
        {over && <div className="blocks-over">GAME OVER<br /><small>Picture abhi baaki hai mere dost</small></div>}
      </div>
      <div className="blocks-side">
        <p>Score<br /><b>{score}</b></p>
        <p><small>← → move<br />↑ rotate<br />↓ drop<br />Space slam</small></p>
        <p><small>Clear a line to summon Shaktimaan.</small></p>
        {over && <button onClick={() => { setGrid(empty()); setPiece(rand()); setScore(0); setOver(false) }}>Play again</button>}
      </div>
    </div>
  )
}
