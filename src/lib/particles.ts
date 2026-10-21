import { gsap } from './gsap'
import type { ShapeFn } from './heroShapes'

type Options = {
  count: number
  /** Colors in draw order; weights decide how many particles get each one. */
  colors: string[]
  weights: number[]
  reduced: boolean
}

const SAMPLE = 200 // offscreen sampling resolution
const MAX_DELAY = 0.35 // per-particle stagger, as a share of the morph
const POINTER_RADIUS = 90

/**
 * Canvas particle field that morphs between shapes.
 * One GSAP tween drives a shared `progress`; each particle derives its own eased,
 * staggered, swirling path from it — cheaper than thousands of tweens.
 */
export class ParticleField {
  private ctx: CanvasRenderingContext2D
  private dpr = Math.min(window.devicePixelRatio || 1, 2)
  private w = 0
  private h = 0
  private n: number
  private x: Float32Array
  private y: Float32Array
  private fx: Float32Array
  private fy: Float32Array
  private tx: Float32Array
  private ty: Float32Array
  private ox: Float32Array
  private oy: Float32Array
  private delay: Float32Array
  private swirl: Float32Array
  private size: Float32Array
  private phase: Float32Array
  private angle: Float32Array
  private groups: number[] // end index of each color group
  private cache = new Map<number, Float32Array>()
  private ease = gsap.parseEase('expo.inOut')
  private morph = { p: 1 }
  private tween: gsap.core.Tween | null = null
  private pointer = { x: 0, y: 0, active: false }
  private scatter = 0
  private current = -1
  private running = false
  private canvas: HTMLCanvasElement
  private shapes: ShapeFn[]
  private opts: Options
  frames = 0

  constructor(canvas: HTMLCanvasElement, shapes: ShapeFn[], opts: Options) {
    this.canvas = canvas
    this.shapes = shapes
    this.opts = opts
    this.ctx = canvas.getContext('2d')!
    const n = (this.n = opts.count)
    const f = () => new Float32Array(n)
    this.x = f(); this.y = f(); this.fx = f(); this.fy = f(); this.tx = f(); this.ty = f()
    this.ox = f(); this.oy = f(); this.delay = f(); this.swirl = f(); this.size = f(); this.phase = f(); this.angle = f()

    // Contiguous color ranges so each color is drawn in one batch
    const total = opts.weights.reduce((a, b) => a + b, 0)
    let acc = 0
    this.groups = opts.weights.map((wt) => (acc += Math.round((wt / total) * n)))
    this.groups[this.groups.length - 1] = n

    for (let i = 0; i < n; i++) {
      this.delay[i] = Math.random() * MAX_DELAY
      this.swirl[i] = (Math.random() - 0.5) * 90
      this.size[i] = 1.5 + Math.random() * 1.8
      this.phase[i] = Math.random() * Math.PI * 2
      this.angle[i] = Math.random() * Math.PI * 2
    }
    this.resize()
  }

  /** Sample a shape once into normalized (0–1) coordinates, n points. */
  private points(index: number) {
    const hit = this.cache.get(index)
    if (hit) return hit
    const off = document.createElement('canvas')
    off.width = off.height = SAMPLE
    const c = off.getContext('2d', { willReadFrequently: true })!
    c.fillStyle = c.strokeStyle = '#000'
    c.scale(SAMPLE / 100, SAMPLE / 100)
    this.shapes[index](c)
    const px = c.getImageData(0, 0, SAMPLE, SAMPLE).data
    const candidates: number[] = []
    for (let yy = 0; yy < SAMPLE; yy++)
      for (let xx = 0; xx < SAMPLE; xx++) if (px[(yy * SAMPLE + xx) * 4 + 3] > 128) candidates.push(xx, yy)
    const count = candidates.length / 2
    const out = new Float32Array(this.n * 2)
    for (let i = 0; i < this.n; i++) {
      const k = Math.floor(Math.random() * count) * 2
      // jitter inside the source pixel so repeats don't stack exactly
      out[i * 2] = (candidates[k] + Math.random()) / SAMPLE
      out[i * 2 + 1] = (candidates[k + 1] + Math.random()) / SAMPLE
    }
    this.cache.set(index, out)
    return out
  }

  private setTargets(index: number) {
    const pts = this.points(index)
    const side = Math.min(this.w, this.h) * 0.8
    const left = (this.w - side) / 2
    const top = (this.h - side) / 2
    for (let i = 0; i < this.n; i++) {
      this.tx[i] = left + pts[i * 2] * side
      this.ty[i] = top + pts[i * 2 + 1] * side
    }
  }

  resize() {
    const w = this.canvas.clientWidth
    const h = this.canvas.clientHeight
    if (!w || !h || (w === this.w && h === this.h)) return
    this.w = w
    this.h = h
    this.canvas.width = Math.round(w * this.dpr)
    this.canvas.height = Math.round(h * this.dpr)
    if (this.current >= 0) {
      this.tween?.kill()
      this.setTargets(this.current)
      this.x.set(this.tx); this.y.set(this.ty); this.fx.set(this.tx); this.fy.set(this.ty)
      this.morph.p = 1
    }
    if (!this.running) this.draw(performance.now() / 1000)
  }

  /** Start from particles strewn across the whole canvas. */
  strew() {
    for (let i = 0; i < this.n; i++) {
      this.x[i] = Math.random() * this.w
      this.y[i] = Math.random() * this.h
    }
    this.fx.set(this.x); this.fy.set(this.y); this.tx.set(this.x); this.ty.set(this.y)
  }

  morphTo(index: number, duration = 1.6) {
    this.current = index
    this.fx.set(this.x)
    this.fy.set(this.y)
    this.setTargets(index)
    this.tween?.kill()
    if (this.opts.reduced) {
      this.x.set(this.tx); this.y.set(this.ty)
      this.morph.p = 1
      this.draw(0)
      return
    }
    this.morph.p = 0
    this.tween = gsap.to(this.morph, { p: 1, duration, ease: 'none' })
  }

  setPointer(clientX: number, clientY: number) {
    const r = this.canvas.getBoundingClientRect()
    this.pointer.x = clientX - r.left
    this.pointer.y = clientY - r.top
    this.pointer.active = true
  }

  clearPointer() {
    this.pointer.active = false
  }

  setScatter(v: number) {
    this.scatter = v
  }

  private tick = (time: number) => this.draw(time)

  start() {
    if (this.running || this.opts.reduced) return
    this.running = true
    gsap.ticker.add(this.tick)
  }

  stop() {
    if (!this.running) return
    this.running = false
    gsap.ticker.remove(this.tick)
  }

  destroy() {
    this.stop()
    this.tween?.kill()
  }

  private draw(time: number) {
    this.frames++
    const { ctx, n, pointer, scatter } = this
    const p = this.morph.p
    const span = 1 - MAX_DELAY
    const r2 = POINTER_RADIUS * POINTER_RADIUS
    const cx = this.w / 2
    const cy = this.h / 2
    const reach = Math.max(this.w, this.h) * 0.6

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    ctx.clearRect(0, 0, this.w, this.h)
    ctx.globalAlpha = 1 - scatter * 0.85

    let g = 0
    ctx.fillStyle = this.opts.colors[0]
    for (let i = 0; i < n; i++) {
      if (i >= this.groups[g]) ctx.fillStyle = this.opts.colors[++g]

      // Morph: staggered, eased, with a perpendicular swirl that peaks mid-flight
      let bx = this.tx[i]
      let by = this.ty[i]
      if (p < 1) {
        const t = Math.min(1, Math.max(0, (p - this.delay[i]) / span))
        const e = this.ease(t)
        const dx = this.tx[i] - this.fx[i]
        const dy = this.ty[i] - this.fy[i]
        const len = Math.hypot(dx, dy) || 1
        const s = Math.sin(Math.PI * e) * this.swirl[i]
        bx = this.fx[i] + dx * e - (dy / len) * s
        by = this.fy[i] + dy * e + (dx / len) * s
      }
      this.x[i] = bx
      this.y[i] = by

      // Idle shimmer
      bx += Math.sin(time * 1.4 + this.phase[i]) * 0.7
      by += Math.cos(time * 1.1 + this.phase[i]) * 0.7

      // Pointer repulsion with spring return
      let px = 0
      let py = 0
      if (pointer.active) {
        const dx = bx - pointer.x
        const dy = by - pointer.y
        const d2 = dx * dx + dy * dy
        if (d2 < r2 && d2 > 0.01) {
          const d = Math.sqrt(d2)
          const force = (1 - d / POINTER_RADIUS) * POINTER_RADIUS * 0.55
          px = (dx / d) * force
          py = (dy / d) * force
        }
      }
      this.ox[i] += (px - this.ox[i]) * 0.12
      this.oy[i] += (py - this.oy[i]) * 0.12

      // Scroll scatter: drift outward from the center
      let sx = 0
      let sy = 0
      if (scatter > 0) {
        const k = scatter * scatter * reach * (0.4 + (this.phase[i] / (Math.PI * 2)) * 0.6)
        sx = (bx - cx) * scatter * 0.6 + Math.cos(this.angle[i]) * k
        sy = (by - cy) * scatter * 0.6 + Math.sin(this.angle[i]) * k
      }

      const sz = this.size[i]
      ctx.fillRect(bx + this.ox[i] + sx - sz / 2, by + this.oy[i] + sy - sz / 2, sz, sz)
    }
  }
}
