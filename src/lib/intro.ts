/**
 * Opening-title handshake: scenes that should wait for the intro (hero, navbar…)
 * register with onIntro(); the preloader calls finishIntro() when the curtain lifts.
 */
let done = false
const queue: (() => void)[] = []

export const isIntroDone = () => done

export function onIntro(cb: () => void) {
  if (done) {
    cb()
    return () => {}
  }
  queue.push(cb)
  return () => {
    const i = queue.indexOf(cb)
    if (i >= 0) queue.splice(i, 1)
  }
}

export function finishIntro() {
  if (done) return
  done = true
  queue.splice(0).forEach((cb) => cb())
}
