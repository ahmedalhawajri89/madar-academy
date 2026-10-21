import { useRef, useState, type ReactNode } from 'react'
import { useForm, type FieldPath } from 'react-hook-form'
import { Check, LoaderCircle, ShieldCheck } from 'lucide-react'
import { useLang } from '../../i18n/LangContext'
import { shared, type Mode } from '../../i18n/content'
import { useSectionMotion } from '../../hooks/useSectionMotion'
import { gsap, MQ, prefersReducedMotion, useGSAP } from '../../lib/gsap'
import { Button } from '../ui/Button'
import { SectionHeading } from '../ui/SectionHeading'

type Values = { name: string; phone: string; email: string; interest: string; mode: Mode; time: string; notes: string }

const STEP_FIELDS: FieldPath<Values>[][] = [['name', 'phone', 'email'], ['interest', 'mode'], ['time', 'notes']]

const inputCls =
  'mt-2 block h-13 w-full rounded-2xl border border-line bg-ivory px-4 text-base text-ink placeholder:text-ink/40 transition-colors focus:border-pine focus:bg-paper focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pine aria-[invalid=true]:border-clay'

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label} {hint && <span className="font-normal text-mute">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-clay-ink">
          {error}
        </p>
      )}
    </div>
  )
}

export function Contact() {
  const { t, sign } = useLang()
  const c = t.contact
  const ref = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [step, setStep] = useState(0)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done'>('idle')
  const mounted = useRef(false)
  useSectionMotion(ref)

  const {
    register,
    trigger,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({ mode: 'onTouched', defaultValues: { mode: 'hybrid', time: c.times[2], interest: '' } })

  // Step + success transitions, then move focus into the new step for keyboard / screen-reader users
  useGSAP(
    () => {
      if (!mounted.current) {
        mounted.current = true
        return
      }
      const panel = formRef.current?.querySelector('.step-panel') ?? ref.current!.querySelector('.success-panel')
      if (!prefersReducedMotion() && panel) {
        // opacity (not autoAlpha): a visibility:hidden panel can't receive the focus we move into it below
        gsap.fromTo(panel, { x: 32 * sign, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: 'expo.out' })
      }
      if (status === 'done') {
        if (!prefersReducedMotion()) gsap.fromTo('.success-check', { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, delay: 0.2, ease: 'power2.out' })
        ref.current!.querySelector<HTMLElement>('.success-panel h3')?.focus()
      } else {
        formRef.current?.querySelector<HTMLElement>('.step-panel input, .step-panel select, .step-panel textarea')?.focus({ preventScroll: true })
      }
    },
    { scope: ref, dependencies: [step, status] },
  )

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MQ.motion, () => {
        gsap.to('.cta-blob', { xPercent: (i) => (i ? -20 : 25), yPercent: (i) => (i ? 15 : -20), scale: 1.15, duration: 9, ease: 'sine.inOut', repeat: -1, yoyo: true })
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  const next = async () => {
    if (await trigger(STEP_FIELDS[step])) setStep((s) => s + 1)
  }

  const onSubmit = async () => {
    setStatus('sending')
    await new Promise((r) => setTimeout(r, 1300)) // demo only — wire to your API / CRM here
    setStatus('done')
  }

  const startOver = () => {
    reset()
    setStep(0)
    setStatus('idle')
  }

  const err = (k: keyof Values) => errors[k]?.message as string | undefined
  const aria = (k: keyof Values) => ({ 'aria-invalid': !!errors[k], 'aria-describedby': errors[k] ? `f-${k}-error` : undefined })

  return (
    <section id="contact" ref={ref} className="relative isolate overflow-hidden bg-ink py-24 text-paper md:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="cta-blob absolute -top-32 start-[-10%] size-[520px] rounded-full bg-pine blur-[110px]" />
        <div className="cta-blob absolute bottom-[-25%] end-[10%] size-[440px] rounded-full bg-lime/20 blur-[110px]" />
      </div>

      <div className="container-x grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <div>
          <SectionHeading eyebrow={c.eyebrow} title={c.title} sub={c.sub} tone="dark" />
          <ul data-reveal-group className="mt-9 space-y-3">
            {c.perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-paper/90">
                <span className="grid size-7 place-items-center rounded-full bg-lime text-ink">
                  <Check className="size-4" strokeWidth={3} aria-hidden />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal className="rounded-[2rem] bg-paper p-6 text-ink shadow-2xl md:p-9">
          {status === 'done' ? (
            <div className="success-panel py-10 text-center" aria-live="polite">
              <svg viewBox="0 0 80 80" className="mx-auto size-20" aria-hidden>
                <circle cx="40" cy="40" r="38" fill="#CDEF6A" />
                <path className="success-check" d="M24 41 l11 11 l21 -24" fill="none" stroke="#0E211C" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <h3 tabIndex={-1} className="mt-6 text-2xl font-bold focus:outline-none">{c.successTitle}</h3>
              <p className="mx-auto mt-2 max-w-sm text-mute">{c.successDesc}</p>
              <div className="mt-8 flex justify-center">
                <Button onClick={startOver} variant="ghost" arrow={false}>{c.again}</Button>
              </div>
            </div>
          ) : (
            <form ref={formRef} noValidate onSubmit={handleSubmit(onSubmit)}>
              {/* Progress */}
              <div className="mb-8">
                <p className="sr-only" aria-live="polite">{c.stepOf(step + 1, 3)}</p>
                <ol className="grid grid-cols-3 gap-2" aria-hidden>
                  {c.steps.map((s, i) => (
                    <li key={s}>
                      <span className="block h-1.5 overflow-hidden rounded-full bg-line">
                        <span className={`block h-full rounded-full bg-pine transition-transform duration-700 ease-[var(--ease-out-expo)] ltr:origin-left rtl:origin-right ${i <= step ? 'scale-x-100' : 'scale-x-0'}`} />
                      </span>
                      <span className={`mt-2 flex items-center gap-1.5 text-xs font-semibold ${i <= step ? 'text-ink' : 'text-mute'}`}>
                        <span className={`grid size-5 place-items-center rounded-full text-[0.65rem] ${i < step ? 'bg-pine text-paper' : i === step ? 'bg-lime text-ink' : 'bg-line text-mute'}`}>
                          {i < step ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                        </span>
                        {s}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="step-panel min-h-[300px] space-y-5">
                {step === 0 && (
                  <>
                    <Field id="f-name" label={c.name} error={err('name')}>
                      <input id="f-name" autoComplete="name" placeholder={c.namePh} className={inputCls} {...aria('name')} {...register('name', { required: c.errors.name, validate: (v) => v.trim().length >= 3 || c.errors.name })} />
                    </Field>
                    <Field id="f-phone" label={c.phone} error={err('phone')}>
                      <input id="f-phone" type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder={c.phonePh} className={`${inputCls} rtl:text-right`} {...aria('phone')} {...register('phone', { required: c.errors.phone, pattern: { value: /^\+?[0-9\s-]{8,16}$/, message: c.errors.phone } })} />
                    </Field>
                    <Field id="f-email" label={c.email} hint={c.optional} error={err('email')}>
                      <input id="f-email" type="email" autoComplete="email" dir="ltr" placeholder={c.emailPh} className={`${inputCls} rtl:text-right`} {...aria('email')} {...register('email', { pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, message: c.errors.email } })} />
                    </Field>
                  </>
                )}

                {step === 1 && (
                  <>
                    <Field id="f-interest" label={c.interest} error={err('interest')}>
                      <select id="f-interest" className={`${inputCls} appearance-none`} {...aria('interest')} {...register('interest', { required: c.errors.interest })}>
                        <option value="" disabled>{c.interestPh}</option>
                        <optgroup label={t.tracks.eyebrow}>
                          {shared.tracks.map((tr) => (
                            <option key={tr.id} value={`track:${tr.id}`}>{t.tracks.items[tr.id].title}</option>
                          ))}
                        </optgroup>
                        <optgroup label={t.courses.eyebrow}>
                          {shared.courses.map((co) => (
                            <option key={co.id} value={`course:${co.id}`}>{t.courses.items[co.id]}</option>
                          ))}
                        </optgroup>
                        <option value="consult">{c.notSure}</option>
                      </select>
                    </Field>
                    <fieldset>
                      <legend className="text-sm font-semibold">{c.mode}</legend>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {(Object.keys(c.modes) as Mode[]).map((m) => (
                          <label key={m} className="flex h-13 items-center justify-center rounded-2xl border border-line bg-ivory text-sm font-semibold transition-colors hover:border-pine has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-clay">
                            <input type="radio" value={m} className="sr-only" {...register('mode')} />
                            {c.modes[m]}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </>
                )}

                {step === 2 && (
                  <>
                    <fieldset>
                      <legend className="text-sm font-semibold">{c.time}</legend>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        {c.times.map((tm) => (
                          <label key={tm} className="flex h-13 items-center justify-center rounded-2xl border border-line bg-ivory text-sm font-semibold transition-colors hover:border-pine has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-clay">
                            <input type="radio" value={tm} className="sr-only" {...register('time')} />
                            {tm}
                          </label>
                        ))}
                      </div>
                    </fieldset>
                    <Field id="f-notes" label={c.notes} hint={c.optional}>
                      <textarea id="f-notes" rows={4} placeholder={c.notesPh} className={`${inputCls} h-auto resize-none py-3`} {...register('notes')} />
                    </Field>
                  </>
                )}
              </div>

              <div className="mt-8 flex items-center justify-between gap-3">
                {step > 0 ? (
                  <Button onClick={() => setStep((s) => s - 1)} variant="ghost" arrow={false}>{c.back}</Button>
                ) : (
                  <span />
                )}
                {step < 2 ? (
                  <Button onClick={next} variant="dark">{c.next}</Button>
                ) : (
                  <Button type="submit" variant="dark" arrow={status !== 'sending'} disabled={status === 'sending'}>
                    {status === 'sending' ? (
                      <span className="inline-flex items-center gap-2"><LoaderCircle className="size-4 animate-spin" aria-hidden />{c.sending}</span>
                    ) : (
                      c.submit
                    )}
                  </Button>
                )}
              </div>
              <p className="mt-6 flex items-center gap-2 text-xs text-mute">
                <ShieldCheck className="size-4 text-pine" aria-hidden />
                {c.privacy}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
