// All sounds are synthesized with Web Audio so we ship no audio files.
let ctx: AudioContext | null = null
let muted = false

function ac() {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function setMuted(m: boolean) { muted = m }
export function isMuted() { return muted }

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.15) {
  if (muted) return
  const c = ac()
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.value = freq
  g.gain.setValueAtTime(0, c.currentTime + start)
  g.gain.linearRampToValueAtTime(vol, c.currentTime + start + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur)
  o.connect(g).connect(c.destination)
  o.start(c.currentTime + start)
  o.stop(c.currentTime + start + dur + 0.05)
}

function noise(start: number, dur: number, vol = 0.08) {
  if (muted) return
  const c = ac()
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  const s = c.createBufferSource()
  const g = c.createGain()
  g.gain.value = vol
  s.buffer = buf
  s.connect(g).connect(c.destination)
  s.start(c.currentTime + start)
}

export const sfx = {
  startup() {
    // original dreamy arpeggio, in the spirit of 90s boot chimes
    ;[261.6, 392, 523.3, 659.3, 784, 1046.5].forEach((f, i) => tone(f, i * 0.18, 2.2 - i * 0.2, 'sine', 0.12))
    tone(130.8, 0, 3, 'triangle', 0.08)
  },
  click() { tone(1800, 0, 0.03, 'square', 0.04) },
  open() { tone(660, 0, 0.08, 'triangle'); tone(990, 0.07, 0.1, 'triangle') },
  close() { tone(990, 0, 0.07, 'triangle'); tone(560, 0.06, 0.1, 'triangle') },
  error() { tone(880, 0, 0.35, 'square', 0.08); tone(440, 0, 0.35, 'square', 0.05) },
  ding() { tone(1318, 0, 0.6, 'sine', 0.15); tone(1975, 0, 0.4, 'sine', 0.05) },
  tada() { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.09, 0.6, 'sawtooth', 0.06)) },
  shutdown() { [784, 659, 523, 392, 261].forEach((f, i) => tone(f, i * 0.22, 1, 'sine', 0.1)) },
  bsod() { tone(110, 0, 1.2, 'sawtooth', 0.12); noise(0, 0.4, 0.05) },
  dialup() {
    // handshake: dial tones, ring, screech, hiss
    ;[697, 770, 852, 941, 697, 852, 770].forEach((f, i) => { tone(f, i * 0.12, 0.1, 'sine', 0.1); tone(1209 + (i % 3) * 127, i * 0.12, 0.1, 'sine', 0.1) })
    tone(440, 1.0, 0.5, 'sine', 0.1); tone(480, 1.0, 0.5, 'sine', 0.1)
    tone(2100, 1.7, 0.6, 'sine', 0.08)
    tone(980, 2.3, 0.4, 'square', 0.05); tone(1650, 2.6, 0.4, 'square', 0.05)
    noise(2.9, 1.3, 0.06)
  },
  chitFund() { [400, 500, 600, 800, 1000].forEach((f, i) => tone(f, i * 0.07, 0.15, 'square', 0.05)) },
  party() {
    const notes = [523, 523, 659, 784, 659, 784, 1046, 784, 659, 523, 392, 523]
    notes.forEach((f, i) => { tone(f, i * 0.15, 0.13, 'square', 0.05); if (i % 2 === 0) noise(i * 0.15, 0.05, 0.1) })
  },
}

// Speak a meme line with the browser's own voice (Hindi voice if available).
export function say(text: string, lang = 'hi-IN') {
  if (muted || !('speechSynthesis' in window)) return
  const u = new SpeechSynthesisUtterance(text)
  u.lang = lang
  const v = speechSynthesis.getVoices().find(v => v.lang === lang)
  if (v) u.voice = v
  u.rate = 0.95
  speechSynthesis.cancel()
  speechSynthesis.speak(u)
}
