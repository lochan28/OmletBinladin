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
const clearLines = ['Udd gaya!', 'Line clear!', 'Shabaash!']

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
  const [planeRows, setPlaneRows] = useState<number[]>([])
  const boardRef = useRef<HTMLDivElement>(null)
  const state = useRef({ grid, piece, over, busy: false })
  state.current = { grid, piece, over, busy: planeRows.length > 0 }

  const spawn = useCallback((g: Grid) => {
    const next = rand()
    if (!fits(g, next)) { setOver(true); sfx.shutdown(); say('Picture abhi baaki hai mere dost') }
    setPiece(next)
  }, [])

  const lock = useCallback((g: Grid, p: Piece) => {
    const ng = g.map(r => [...r])
    p.m.forEach((r, dy) => r.forEach((v, dx) => { if (v && p.y + dy >= 0) ng[p.y + dy][p.x + dx] = p.c }))
    const full = ng.map((r, i) => (r.every(c => c) ? i : -1)).filter(i => i >= 0)
    setGrid(ng)
    if (!full.length) { sfx.click(); return spawn(ng) }
    // plane flies along each full row, then the row vanishes
    setScore(s => s + [0, 100, 300, 500, 800][full.length])
    setPlaneRows(full); sfx.dialup(); say(clearLines[Math.floor(Math.random() * clearLines.length)])
    setPiece({ ...p, m: [[0]] })
    setTimeout(() => {
      const kept = ng.filter((_, i) => !full.includes(i))
      const filled = [...Array.from({ length: full.length }, () => Array(W).fill(null)), ...kept]
      setGrid(filled); setPlaneRows([]); sfx.tada(); spawn(filled)
    }, 1100)
  }, [spawn])

  const move = useCallback((dx: number, dy: number, rot = false) => {
    const { grid: g, piece: p, over: o, busy } = state.current
    if (o || busy) return
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
      ' ': () => { const { grid: g, piece: p, busy } = state.current; if (busy) return; let y = p.y; while (fits(g, { ...p, y: y + 1 })) y++; lock(g, { ...p, y }) },
    }
    if (k[e.key]) { e.preventDefault(); k[e.key]() }
  }

  const view = grid.map(r => [...r])
  piece.m.forEach((r, dy) => r.forEach((v, dx) => { if (v && piece.y + dy >= 0) view[piece.y + dy][piece.x + dx] = piece.c }))

  return (
    <div className="blocks" tabIndex={0} autoFocus onKeyDown={onKey} ref={el => el?.focus()}>
      <div className="blocks-board" ref={boardRef}>
        {view.flat().map((c, i) => <div key={i} className={`cell ${planeRows.includes(Math.floor(i / W)) ? "poof" : ""}`} style={c ? { background: c, animationDelay: `${(i % W) * 0.08}s` } : undefined} />)}
        {planeRows.map(r => <div key={r} className="plane" style={{ top: (boardRef.current?.getBoundingClientRect().top ?? 0) + r * 18 - 6 }}><span className="emoji">✈️</span></div>)}
        {over && <div className="blocks-over">GAME OVER<br /><small>Picture abhi baaki hai mere dost</small></div>}
      </div>
      <div className="blocks-side">
        <p>Score<br /><b>{score}</b></p>
        <p><small>← → move<br />↑ rotate<br />↓ drop<br />Space slam</small></p>
        <p><small>Clear a line and a plane takes it away.</small></p>
        {over && <button onClick={() => { setGrid(empty()); setPiece(rand()); setScore(0); setOver(false) }}>Play again</button>}
      </div>
    </div>
  )
}
