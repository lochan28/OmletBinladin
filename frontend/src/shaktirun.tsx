import { useEffect, useRef, useState } from 'react'
import { say, sfx } from './sound'

const VW = 560, VH = 300, GROUND = 250, LEVEL = 3400
const GRAV = 0.6, JUMP = -12.5, SPEED = 4

interface Thing { kind: 'cactus' | 'turtle' | 'crab' | 'coin' | 'kilvish'; x: number; y: number; vx: number; dead?: boolean; min?: number; max?: number }
interface Plat { x: number; y: number; w: number }

const platforms: Plat[] = [
  { x: 500, y: 180, w: 120 }, { x: 900, y: 150, w: 160 }, { x: 1400, y: 170, w: 120 },
  { x: 1900, y: 140, w: 200 }, { x: 2500, y: 170, w: 140 },
]

function level(): Thing[] {
  const t: Thing[] = []
  ;[650, 1200, 1700, 2300, 2800].forEach(x => t.push({ kind: 'cactus', x, y: GROUND, vx: 0 }))
  ;[800, 1550, 2150, 2650].forEach(x => t.push({ kind: 'turtle', x, y: GROUND, vx: -1, min: x - 120, max: x + 120 }))
  ;[1050, 1850, 2450, 3000].forEach(x => t.push({ kind: 'crab', x, y: GROUND, vx: 1.5, min: x - 90, max: x + 90 }))
  platforms.forEach(p => { for (let i = 0; i < 3; i++) t.push({ kind: 'coin', x: p.x + 20 + i * 35, y: p.y - 30, vx: 0 }) })
  t.push({ kind: 'kilvish', x: 3200, y: GROUND, vx: -0.8, min: 3100, max: 3280 })
  return t
}

const emoji: Record<Thing['kind'], string> = { cactus: '🌵', turtle: '🐢', crab: '🦀', coin: '🪙', kilvish: '🧛' }
const ouch = ['Sorry Shaktimaan!', 'Sorry Shaktimaan!', 'Andhera kayamat hai!']

export function ShaktiRun() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [hud, setHud] = useState({ lives: 3, coins: 0, msg: 'Shaktimaan is arriving...' })
  const [run, setRun] = useState(0)

  useEffect(() => {
    const ctx = canvas.current!.getContext('2d')!
    const keys: Record<string, boolean> = {}
    const things = level()
    const p = { x: 40, y: -120, vy: 0, spin: 0, ground: false, inv: 0, entering: true }
    let lives = 3, coins = 0, cam = 0, done = false, raf = 0
    const setMsg = (msg: string) => setHud({ lives, coins, msg })

    sfx.startup(); say('Shaktimaan! Shaktimaan!')
    const down = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' '].includes(e.key)) e.preventDefault()
      keys[e.key] = true
    }
    const up = (e: KeyboardEvent) => { keys[e.key] = false }
    const el = canvas.current!
    el.addEventListener('keydown', down); el.addEventListener('keyup', up)

    const hurt = () => {
      if (p.inv > 0 || done) return
      lives--; p.inv = 90; p.vy = -8; p.x = Math.max(0, p.x - 60)
      sfx.error(); say(ouch[Math.floor(Math.random() * ouch.length)])
      if (lives <= 0) { done = true; sfx.shutdown(); setMsg('GAME OVER — Andhera kayamat hai. Press R to restart') }
      else setMsg('Sorry Shaktimaan! 💔')
    }

    const tick = () => {
      // entrance: spin down from the sky
      if (p.entering) {
        p.vy += GRAV * 0.5; p.y += p.vy; p.spin += 0.5
        if (p.y >= GROUND) { p.y = GROUND; p.vy = 0; p.spin = 0; p.entering = false; p.ground = true; sfx.tada(); setMsg('← → move, Space/↑ to spin-jump. Reach the flag!') }
      } else if (!done) {
        if (keys.ArrowLeft) p.x -= SPEED
        if (keys.ArrowRight) p.x += SPEED
        if ((keys[' '] || keys.ArrowUp) && p.ground) { p.vy = JUMP; p.ground = false; sfx.open() }
        p.vy += GRAV; p.y += p.vy
        p.x = Math.max(0, Math.min(LEVEL, p.x))
        p.ground = false
        if (p.y >= GROUND) { p.y = GROUND; p.vy = 0; p.ground = true }
        for (const pl of platforms) {
          if (p.vy >= 0 && p.x + 12 > pl.x && p.x - 12 < pl.x + pl.w && p.y >= pl.y && p.y - p.vy <= pl.y) { p.y = pl.y; p.vy = 0; p.ground = true }
        }
        p.spin = p.ground ? 0 : p.spin + 0.35
        if (p.inv > 0) p.inv--

        for (const t of things) {
          if (t.dead) continue
          if (t.vx && t.min !== undefined) { t.x += t.vx; if (t.x < t.min || t.x > t.max!) t.vx *= -1 }
          const dx = Math.abs(p.x - t.x), dy = p.y - t.y
          if (t.kind === 'coin') {
            if (dx < 20 && Math.abs(p.y - 15 - t.y) < 25) { t.dead = true; coins++; sfx.ding(); setMsg(`Gangadhar coin! (${coins})`) }
            continue
          }
          if (dx < 22 && dy > -30 && dy < 30) {
            const stomp = p.vy > 0 && dy < -5 && t.kind !== 'cactus'
            if (stomp) {
              t.dead = true
              p.vy = -9; sfx.tada()
              if (t.kind === 'kilvish') { say('Andhera kayamat hai! Kilvish haar gaya!'); setMsg('Tamraj Kilvish defeated! 🌞') }
              else { say('Sorry Shaktimaan'); setMsg(`${t.kind === 'turtle' ? 'Turtle' : 'Crab'} stomped! "Sorry Shaktimaan!"`) }
            } else hurt()
          }
        }
        if (p.y > VH + 50) hurt()
        if (p.x >= LEVEL - 40) {
          done = true; sfx.party(); say('Shaktimaan ki jai!')
          setMsg(`🏆 Shaktimaan ki jai! ${coins} Gangadhar coins. Press R to play again`)
        }
      }
      cam = Math.max(0, Math.min(LEVEL - VW + 60, p.x - VW / 3))

      // draw
      ctx.fillStyle = '#6bb8ff'; ctx.fillRect(0, 0, VW, VH)
      ctx.font = '28px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'
      ctx.fillText('🌞', 500, 50)
      for (let i = 0; i < 8; i++) ctx.fillText('☁️', ((i * 420 - cam * 0.4) % (VW + 200) + VW + 200) % (VW + 200) - 100, 60 + (i % 3) * 25)
      ctx.fillStyle = '#c87533'; ctx.fillRect(0, GROUND, VW, VH - GROUND)
      ctx.fillStyle = '#3fa34d'; ctx.fillRect(0, GROUND, VW, 8)
      ctx.save(); ctx.translate(-cam, 0)
      for (const pl of platforms) { ctx.fillStyle = '#b5651d'; ctx.fillRect(pl.x, pl.y, pl.w, 14); ctx.strokeStyle = '#000'; ctx.strokeRect(pl.x, pl.y, pl.w, 14) }
      ctx.fillText('🚩', LEVEL, GROUND); ctx.font = '12px sans-serif'; ctx.fillStyle = '#000'; ctx.fillText('Shaktimaan ki jai', LEVEL, GROUND - 34)
      ctx.font = '28px serif'
      for (const t of things) {
        if (t.dead) continue
        ctx.save(); ctx.translate(t.x, t.y)
        if (t.vx > 0 && t.kind !== 'kilvish') ctx.scale(-1, 1)
        ctx.fillText(emoji[t.kind], 0, 0)
        if (t.kind === 'kilvish') { ctx.font = '11px sans-serif'; ctx.fillText('Kilvish', 0, -30) }
        ctx.restore()
      }
      if (!(p.inv > 0 && Math.floor(p.inv / 5) % 2)) {
        ctx.save(); ctx.translate(p.x, p.y - 16); ctx.rotate(p.spin)
        ctx.font = '32px serif'; ctx.textBaseline = 'middle'; ctx.fillText('🦸', 0, 0)
        if (p.spin) { ctx.font = '20px serif'; ctx.fillText('🌀', 0, 0) }
        ctx.restore()
      }
      ctx.restore()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const restart = (e: KeyboardEvent) => { if (done && e.key.toLowerCase() === 'r') setRun(r => r + 1) }
    el.addEventListener('keydown', restart)
    el.focus()
    return () => { cancelAnimationFrame(raf); el.removeEventListener('keydown', down); el.removeEventListener('keyup', up); el.removeEventListener('keydown', restart) }
  }, [run])

  return (
    <div style={{ padding: 6 }}>
      <div className="field-row" style={{ justifyContent: 'space-between', fontSize: 12 }}>
        <span>{'❤️'.repeat(Math.max(0, hud.lives))} | 🪙 {hud.coins}</span><span>{hud.msg}</span>
      </div>
      <canvas ref={canvas} width={VW} height={VH} tabIndex={0} style={{ display: 'block', marginTop: 4, outline: 'none', border: '2px inset #808080' }}
        onClick={e => e.currentTarget.focus()} />
    </div>
  )
}
