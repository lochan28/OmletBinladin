import { useEffect, useRef, useState } from 'react'
import { note, say, sfx } from './sound'

const VW = 560, VH = 300, GROUND = 250, B = 30
const GRAV = 0.6, JUMP = -12.5, WALK = 4, RUN = 6.5

type EnemyKind = 'cactus' | 'turtle' | 'crab' | 'kilvish'
interface Enemy { kind: EnemyKind; x: number; vx: number; min: number; max: number; dead?: boolean; hp?: number; hurt?: number }
interface Block { x: number; y: number; gives: 'coin' | 'chakra'; used?: boolean; bump?: number }
interface Plat { x: number; y: number; w: number }
interface Mover extends Plat { min: number; max: number; vx: number; dx: number }
interface Item { kind: 'coin' | 'chakra'; x: number; y: number; vx: number; vy: number; taken?: boolean; float?: boolean }
interface Popup { x: number; y: number; text: string; t: number }
interface Level {
  name: string; length: number; dark: boolean
  gaps: [number, number][]; plats: Plat[]; movers: Mover[]; blocks: Block[]
  enemies: Enemy[]; coins: [number, number][]; checkpoint: number
}

const walker = (kind: EnemyKind, x: number, range: number, speed: number): Enemy => ({ kind, x, vx: speed, min: x - range, max: x + range })

function makeLevel(n: number): Level {
  if (n === 1) return {
    name: '1-1 Gangadhar ka Gaon', length: 3600, dark: false, checkpoint: 1800,
    gaps: [[1100, 90], [2050, 110], [2900, 120]],
    plats: [{ x: 520, y: 170, w: 120 }, { x: 1500, y: 160, w: 140 }, { x: 2600, y: 150, w: 120 }],
    movers: [{ x: 2040, y: 190, w: 90, min: 1990, max: 2160, vx: 1.2, dx: 0 }, { x: 2890, y: 180, w: 90, min: 2860, max: 3030, vx: 1.5, dx: 0 }],
    blocks: [{ x: 330, y: 160, gives: 'coin' }, { x: 360, y: 160, gives: 'chakra' }, { x: 390, y: 160, gives: 'coin' },
      { x: 1300, y: 150, gives: 'coin' }, { x: 1750, y: 160, gives: 'coin' }, { x: 1780, y: 160, gives: 'coin' }, { x: 2400, y: 160, gives: 'chakra' }],
    enemies: [{ kind: 'cactus', x: 700, vx: 0, min: 0, max: 0 }, walker('turtle', 900, 100, -1), walker('crab', 1400, 80, 1.5),
      { kind: 'cactus', x: 1650, vx: 0, min: 0, max: 0 }, walker('turtle', 2300, 90, -1), walker('crab', 2500, 70, 1.8),
      { kind: 'cactus', x: 3200, vx: 0, min: 0, max: 0 }, walker('turtle', 3350, 90, -1.2)],
    coins: [[540, 140], [575, 140], [610, 140], [1520, 130], [1560, 130], [1600, 130], [2620, 120], [2660, 120], [2700, 120]],
  }
  return {
    name: '1-2 Kilvish ka Kila', length: 3000, dark: true, checkpoint: 1500,
    gaps: [[600, 100], [1200, 140], [1900, 140]],
    plats: [{ x: 900, y: 160, w: 120 }, { x: 1600, y: 150, w: 120 }],
    movers: [{ x: 590, y: 190, w: 90, min: 560, max: 720, vx: 1.4, dx: 0 }, { x: 1200, y: 170, w: 80, min: 1180, max: 1350, vx: 1.8, dx: 0 },
      { x: 1890, y: 180, w: 80, min: 1870, max: 2050, vx: 2, dx: 0 }],
    blocks: [{ x: 400, y: 160, gives: 'chakra' }, { x: 1050, y: 150, gives: 'coin' }, { x: 2200, y: 160, gives: 'chakra' }],
    enemies: [walker('crab', 450, 80, 1.8), walker('turtle', 1000, 70, -1.3), { kind: 'cactus', x: 1450, vx: 0, min: 0, max: 0 },
      walker('crab', 1750, 60, 2), { ...walker('kilvish', 2700, 140, -1.6), hp: 3 }],
    coins: [[920, 130], [960, 130], [1000, 130], [1620, 120], [1660, 120]],
  }
}

const EMOJI: Record<EnemyKind, string> = { cactus: '🌵', turtle: '🐢', crab: '🦀', kilvish: '🧛' }
const OUCH = ['Sorry Shaktimaan!', 'Sorry Shaktimaan!', 'Andhera kayamat hai!']
// original 8-bar loop (C major), [freq, beats]
const TUNE: [number, number][] = [[523, 1], [659, 1], [784, 1], [659, 1], [698, 1], [880, 1], [784, 2], [659, 1], [587, 1], [523, 1], [587, 1], [659, 2], [392, 2],
  [523, 1], [659, 1], [784, 1], [1046, 1], [880, 1], [784, 1], [698, 1], [659, 1], [587, 1], [659, 1], [523, 2], [0, 2]]
const DARK_TUNE: [number, number][] = [[220, 1], [262, 1], [247, 1], [208, 1], [220, 2], [0, 1], [196, 1], [220, 1], [262, 1], [311, 1], [294, 2], [0, 2]]

export function ShaktiRun() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [hud, setHud] = useState({ lives: 3, coins: 0, score: 0, time: 300, level: '', msg: 'Shaktimaan is arriving...' })
  const [run, setRun] = useState(0)

  useEffect(() => {
    const ctx = canvas.current!.getContext('2d')!
    const el = canvas.current!
    const keys: Record<string, boolean> = {}
    let levelNo = 1, L = makeLevel(1)
    let items: Item[] = [], popups: Popup[] = []
    let lives = 3, coins = 0, score = 0, time = 300, cam = 0, done = false, raf = 0, checkpoint = 40
    const p = { x: 40, y: -120, vx: 0, vy: 0, spin: 0, ground: false, inv: 0, entering: true, big: false, jumpHeld: false, on: null as Mover | null }
    let msg = 'Shaktimaan is arriving...'
    const sync = (m?: string) => { if (m) msg = m; setHud({ lives, coins, score, time, level: L.name, msg }) }
    const addScore = (n: number, x: number, y: number) => { score += n; popups.push({ x, y, text: `+${n}`, t: 40 }) }
    const height = () => (p.big ? 44 : 32)
    const overGap = (x: number) => L.gaps.some(([gx, gw]) => x > gx + 6 && x < gx + gw - 6)

    // background music
    let ti = 0, wait = 0
    const music = setInterval(() => {
      if (done || p.entering) return
      if (wait-- > 0) return
      const tune = L.dark ? DARK_TUNE : TUNE
      const [f, beats] = tune[ti++ % tune.length]
      if (f) note(f, 0.14 * beats, 'square', 0.025)
      if (f && ti % 2) note(f / 2, 0.1, 'triangle', 0.03)
      wait = beats - 1
    }, 160)

    const enter = (first: boolean) => {
      p.x = checkpoint; p.y = -120; p.vy = 0; p.vx = 0; p.entering = true; p.spin = 0; p.on = null
      if (first) { sfx.startup(); say('Shaktimaan! Shaktimaan!') }
    }
    enter(true)
    sync()

    const loseLife = (reason: string) => {
      lives--; p.big = false; sfx.error(); say(OUCH[Math.floor(Math.random() * OUCH.length)])
      if (lives <= 0) { done = true; sfx.shutdown(); return sync('GAME OVER — Gangadhar office late pahuncha. Andhera kayamat hai. Press R') }
      time = 300; sync(`${reason} Sorry Shaktimaan! 💔`); enter(false)
    }
    const hurt = () => {
      if (p.inv > 0 || done || p.entering) return
      if (p.big) { p.big = false; p.inv = 90; sfx.error(); say('Sorry Shaktimaan'); return sync('Chakra lost! One more hit and you are out.') }
      p.inv = 90; p.vy = -8; p.x = Math.max(0, p.x - 60)
      loseLife('Ouch!')
    }

    const nextLevel = () => {
      levelNo++; L = makeLevel(levelNo); items = []; popups = []; checkpoint = 40; time = 300
      sfx.tada(); say('Thank you Shaktimaan! Lekin Geeta Vishwas doosre kile mein hai!'); enter(false); sync('"Thank you Shaktimaan! But Geeta Vishwas is in another kila!" 🏰')
    }

    const timer = setInterval(() => {
      if (done || p.entering) return
      time--; if (time <= 0) loseLife('Time up!'); else if (time % 5 === 0) sync()
    }, 1000)

    const down = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault()
      keys[e.key] = true
      if (done && e.key.toLowerCase() === 'r') setRun(r => r + 1)
    }
    const up = (e: KeyboardEvent) => { keys[e.key] = false }
    el.addEventListener('keydown', down); el.addEventListener('keyup', up)

    const tick = () => {
      for (const m of L.movers) { m.dx = m.vx; m.x += m.vx; if (m.x < m.min || m.x > m.max) m.vx *= -1 }

      if (p.entering) {
        p.vy += GRAV * 0.5; p.y += p.vy; p.spin += 0.5
        if (p.y >= GROUND) { p.y = GROUND; p.vy = 0; p.spin = 0; p.entering = false; p.ground = true; sfx.tada(); sync(levelNo === 1 && checkpoint === 40 ? 'SUPER SHAKTIMAAN 98 — ← → move · Shift run · Space jump. Princess? No. Geeta Vishwas.' : undefined) }
      } else if (!done) {
        // horizontal
        const max = keys.Shift ? RUN : WALK
        const target = (keys.ArrowRight ? max : 0) - (keys.ArrowLeft ? max : 0)
        p.vx += (target - p.vx) * (p.ground ? 0.25 : 0.1)
        if (p.on) p.x += p.on.dx
        p.x = Math.max(0, Math.min(L.length, p.x + p.vx))
        for (const b of L.blocks) {
          if (p.y > b.y && p.y - height() < b.y + B && p.x + 12 > b.x && p.x - 12 < b.x + B) p.x = p.vx > 0 ? b.x - 12 : b.x + B + 12
        }
        // jump (variable height)
        const jump = keys[' '] || keys.ArrowUp
        if (jump && p.ground && !p.jumpHeld) { p.vy = JUMP - Math.abs(p.vx) * 0.25; p.ground = false; sfx.open() }
        if (!jump && p.vy < -4) p.vy *= 0.6
        p.jumpHeld = !!jump
        // vertical
        const prevY = p.y
        p.vy += GRAV; p.y += p.vy; p.ground = false; p.on = null
        if (p.y >= GROUND && !overGap(p.x) && prevY <= GROUND + 2) { p.y = GROUND; p.vy = 0; p.ground = true }
        const landOn = (pl: Plat) => p.vy >= 0 && p.x + 12 > pl.x && p.x - 12 < pl.x + pl.w && p.y >= pl.y && prevY <= pl.y + 1
        for (const pl of L.plats) if (landOn(pl)) { p.y = pl.y; p.vy = 0; p.ground = true }
        for (const m of L.movers) if (landOn(m)) { p.y = m.y; p.vy = 0; p.ground = true; p.on = m }
        for (const b of L.blocks) {
          if (p.x + 12 <= b.x || p.x - 12 >= b.x + B) continue
          if (p.vy >= 0 && p.y >= b.y && prevY <= b.y + 1) { p.y = b.y; p.vy = 0; p.ground = true }
          else if (p.vy < 0 && p.y - height() < b.y + B && prevY - height() >= b.y + B - 1) {
            p.y = b.y + B + height(); p.vy = 1; b.bump = 8
            if (!b.used) {
              b.used = true
              if (b.gives === 'coin') { coins++; sfx.ding(); addScore(200, b.x + B / 2, b.y - 10); items.push({ kind: 'coin', x: b.x + B / 2, y: b.y, vx: 0, vy: -7, float: true }) }
              else { sfx.chitFund(); items.push({ kind: 'chakra', x: b.x + B / 2, y: b.y - 2, vx: 1.5, vy: -4 }); sync('A Shakti Chakra appeared! 🌀') }
            } else sfx.click()
          }
        }
        p.spin = p.ground ? 0 : p.spin + 0.35
        if (p.inv > 0) p.inv--
        if (p.y > VH + 60) { p.inv = 0; loseLife('Fell in a pit!') }
        if (p.x >= L.checkpoint && checkpoint < L.checkpoint) { checkpoint = L.checkpoint; sync('Checkpoint! 🚩') }

        // items
        for (const it of items) {
          if (it.taken) continue
          it.vy += GRAV * 0.6; it.y += it.vy; it.x += it.vx
          if (it.float) { if (it.vy > 2) it.taken = true; continue }
          if (it.y >= GROUND && !overGap(it.x)) { it.y = GROUND; it.vy = 0 }
          if (it.y > VH + 40) it.taken = true
          if (Math.abs(it.x - p.x) < 22 && Math.abs(it.y - (p.y - 15)) < 30) {
            it.taken = true; p.big = true; sfx.tada(); say('Shaktimaan!'); addScore(1000, p.x, p.y - 50); sync('Shakti Chakra! Shaktimaan grows! 💪')
          }
        }
        // loose coins
        L.coins = L.coins.filter(([cx, cy]) => {
          if (Math.abs(cx - p.x) < 20 && Math.abs(cy - (p.y - 15)) < 28) { coins++; sfx.ding(); addScore(100, cx, cy); return false }
          return true
        })

        // enemies
        for (const t of L.enemies) {
          if (t.dead) continue
          if (t.hurt) t.hurt--
          if (t.vx) { t.x += t.vx; if (t.x < t.min || t.x > t.max) t.vx *= -1 }
          const dx = Math.abs(p.x - t.x), dy = p.y - GROUND
          if (dx < 24 && dy > -(t.kind === 'kilvish' ? 40 : 30)) {
            const stomp = p.vy > 0 && p.y < GROUND - 6 && t.kind !== 'cactus'
            if (stomp && !t.hurt) {
              p.vy = -10; sfx.tada()
              if (t.kind === 'kilvish') {
                t.hp!--; t.hurt = 60; addScore(2000, t.x, GROUND - 50)
                if (t.hp! <= 0) {
                  t.dead = true; done = true; sfx.party(); say('Kilvish haar gaya! Shaktimaan ki jai!')
                  addScore(time * 10, p.x, p.y - 60)
                  sync(`🏆 Geeta Vishwas: "Shaktimaan, tum aa gaye! Ab main news report kar sakti hoon." Score ${score}. Press R`)
                } else { say('Andhera kayamat hai!'); sync(`Kilvish: "Andhera kayamat hai!" (${t.hp} hits left)`) }
              } else {
                t.dead = true; say('Sorry Shaktimaan'); addScore(t.kind === 'turtle' ? 300 : 400, t.x, GROUND - 40)
                sync(`${t.kind === 'turtle' ? 'Turtle' : 'Crab'} stomped! "Sorry Shaktimaan!"`)
              }
            } else if (!stomp) hurt()
          }
        }
        // level 1 flag
        if (levelNo === 1 && p.x >= L.length - 40) { addScore(time * 10, p.x, p.y - 60); nextLevel() }
      }
      for (const pu of popups) { pu.t--; pu.y -= 0.8 }
      popups = popups.filter(pu => pu.t > 0)
      for (const b of L.blocks) if (b.bump) b.bump--
      cam = Math.max(0, Math.min(L.length - VW + 60, p.x - VW / 3))

      // ---------- draw ----------
      const dark = L.dark
      ctx.fillStyle = dark ? '#1a0d2e' : '#6bb8ff'; ctx.fillRect(0, 0, VW, VH)
      ctx.textAlign = 'center'; ctx.textBaseline = 'bottom'; ctx.font = '28px serif'
      ctx.fillText(dark ? '🌑' : '🌞', 500, 50)
      for (let i = 0; i < 8; i++) {
        const x = ((i * 420 - cam * 0.4) % (VW + 200) + VW + 200) % (VW + 200) - 100
        ctx.fillText(dark ? (i % 2 ? '🦇' : '⭐') : '☁️', x, 60 + (i % 3) * 25)
      }
      ctx.save(); ctx.translate(-cam, 0)
      // ground with gaps
      let gx = 0
      for (const [s, w] of [...L.gaps, [L.length + VW, 0] as [number, number]]) {
        ctx.fillStyle = dark ? '#555' : '#c87533'; ctx.fillRect(gx, GROUND, s - gx, VH - GROUND)
        ctx.fillStyle = dark ? '#777' : '#3fa34d'; ctx.fillRect(gx, GROUND, s - gx, 8)
        gx = s + w
      }
      if (dark) for (let x = 200; x < L.length; x += 400) ctx.fillText('🔥', x, GROUND - 60)
      const brick = (x: number, y: number, w: number) => {
        ctx.fillStyle = dark ? '#6a5a7a' : '#b5651d'; ctx.fillRect(x, y, w, 14); ctx.strokeStyle = '#000'; ctx.strokeRect(x, y, w, 14)
      }
      L.plats.forEach(pl => brick(pl.x, pl.y, pl.w))
      L.movers.forEach(m => { brick(m.x, m.y, m.w); ctx.fillStyle = '#ff0'; ctx.fillRect(m.x + 4, m.y + 5, m.w - 8, 3) })
      for (const b of L.blocks) {
        const by = b.y - (b.bump ?? 0)
        ctx.fillStyle = b.used ? '#8b6b4a' : '#f0a020'; ctx.fillRect(b.x, by, B, B)
        ctx.strokeStyle = '#000'; ctx.strokeRect(b.x, by, B, B)
        if (!b.used) { ctx.fillStyle = '#7a2e00'; ctx.font = 'bold 18px serif'; ctx.textBaseline = 'middle'; ctx.fillText('ॐ', b.x + B / 2, by + B / 2 + 1); ctx.textBaseline = 'bottom' }
      }
      ctx.font = '22px serif'
      L.coins.forEach(([cx, cy]) => ctx.fillText('🪙', cx, cy + 12))
      items.forEach(it => { if (!it.taken) ctx.fillText(it.kind === 'coin' ? '🪙' : '🌀', it.x, it.y) })
      if (levelNo === 1) { ctx.font = '28px serif'; ctx.fillText('🚩', L.length, GROUND); ctx.font = '12px sans-serif'; ctx.fillStyle = '#000'; ctx.fillText('Kilvish ka Kila →', L.length, GROUND - 34) }
      for (const t of L.enemies) {
        if (t.dead) continue
        if (t.hurt && Math.floor(t.hurt / 4) % 2) continue
        ctx.save(); ctx.translate(t.x, GROUND)
        if (t.vx > 0 && t.kind !== 'kilvish') ctx.scale(-1, 1)
        ctx.font = t.kind === 'kilvish' ? '44px serif' : '28px serif'; ctx.fillText(EMOJI[t.kind], 0, 0)
        if (t.kind === 'kilvish') { ctx.font = '11px sans-serif'; ctx.fillStyle = '#f44'; ctx.fillText(`Tamraj Kilvish ${'♥'.repeat(t.hp!)}`, 0, -48) }
        ctx.restore()
      }
      if (!(p.inv > 0 && Math.floor(p.inv / 5) % 2)) {
        const s = p.big ? 1.4 : 1
        ctx.save(); ctx.translate(p.x, p.y - 16 * s); ctx.rotate(p.spin); ctx.scale(s, s)
        ctx.font = '32px serif'; ctx.textBaseline = 'middle'; ctx.fillText('🦸', 0, 0)
        if (p.spin) { ctx.font = '20px serif'; ctx.fillText('🌀', 0, 0) }
        ctx.restore()
      }
      ctx.font = 'bold 12px "Courier New"'; ctx.fillStyle = dark ? '#ff0' : '#fff'
      for (const pu of popups) ctx.fillText(pu.text, pu.x, pu.y)
      ctx.restore()
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    el.focus()
    return () => {
      cancelAnimationFrame(raf); clearInterval(music); clearInterval(timer)
      el.removeEventListener('keydown', down); el.removeEventListener('keyup', up)
    }
  }, [run])

  return (
    <div style={{ padding: 6 }}>
      <div className="field-row" style={{ justifyContent: 'space-between', fontSize: 12, fontFamily: '"Courier New", monospace' }}>
        <span>{'❤️'.repeat(Math.max(0, hud.lives))}</span>
        <span>SCORE {String(hud.score).padStart(6, '0')}</span>
        <span>🪙×{hud.coins}</span>
        <span>{hud.level}</span>
        <span>TIME {hud.time}</span>
      </div>
      <canvas ref={canvas} width={VW} height={VH} tabIndex={0} style={{ display: 'block', marginTop: 4, outline: 'none', border: '2px inset #808080' }}
        onClick={e => e.currentTarget.focus()} />
      <div style={{ fontSize: 12, marginTop: 4, minHeight: 16 }}>{hud.msg}</div>
    </div>
  )
}
