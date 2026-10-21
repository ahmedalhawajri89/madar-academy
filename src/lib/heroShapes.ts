/**
 * Shapes the hero particles assemble into. Each one draws inside a 100×100 box
 * (the caller scales the context); strokes and fills both work — particles are
 * sampled from every opaque pixel.
 */
export type ShapeFn = (ctx: CanvasRenderingContext2D) => void

const stroke = (ctx: CanvasRenderingContext2D, d: string, width = 6) => {
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke(new Path2D(d))
}

/** Madar logo: tilted orbit, planet and satellite */
const logo: ShapeFn = (ctx) => {
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.ellipse(50, 50, 44, 18, (-28 * Math.PI) / 180, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(50, 50, 15, 0, Math.PI * 2)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(85, 30, 6.5, 0, Math.PI * 2)
  ctx.fill()
}

/** Development: </> */
const dev: ShapeFn = (ctx) => stroke(ctx, 'M33 28 L11 50 L33 72 M67 28 L89 50 L67 72 M57 18 L43 82', 8)

/** Design: fountain-pen nib */
const design: ShapeFn = (ctx) => {
  stroke(ctx, 'M50 10 L76 46 L63 80 H37 L24 46 Z M50 10 V50 M34 90 H66', 6)
  ctx.beginPath()
  ctx.arc(50, 56, 6, 0, Math.PI * 2)
  ctx.fill()
}

/** Data: bar chart with a rising trend line */
const data: ShapeFn = (ctx) => {
  stroke(ctx, 'M10 88 H90', 5)
  stroke(ctx, 'M24 82 V64 M41 82 V52 M58 82 V58 M75 82 V40', 10)
  stroke(ctx, 'M16 44 L36 28 L54 36 L84 12 M71 12 H84 V25', 5)
}

/** Marketing: megaphone with sound waves */
const marketing: ShapeFn = (ctx) => {
  stroke(ctx, 'M14 40 H32 L66 18 V82 L32 60 H14 Z M28 60 L34 84 H44 L40 60', 6)
  stroke(ctx, 'M78 38 Q86 50 78 62 M86 26 Q100 50 86 74', 5)
}

/** Languages: Arabic «ع» and Latin «A» side by side */
const lang: ShapeFn = (ctx) => {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.font = '800 62px Alexandria, "IBM Plex Sans Arabic", sans-serif'
  ctx.fillText('ع', 30, 50)
  ctx.fillText('A', 72, 54)
  stroke(ctx, 'M10 90 H90', 4)
}

/** Index 0 is the intro logo; 1…5 follow the hero's rotating words. */
export const HERO_SHAPES: ShapeFn[] = [logo, dev, design, data, marketing, lang]
