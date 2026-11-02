# Madar Academy — Landing Page

A responsive, Arabic-first (RTL) landing page for a training center, with full English (LTR) support. Built with **React** and **GSAP**.

**Live demo:** [madaracademy.vercel.app](https://madaracademy.vercel.app/)

> All content is placeholder data (name, courses, trainers, photos, WhatsApp number). It lives in one file: [`src/i18n/content.ts`](src/i18n/content.ts).

## Tech stack

- **Vite + React 19 + TypeScript**
- **Tailwind CSS v4** — colors and fonts are defined as tokens in [`src/index.css`](src/index.css)
- **GSAP 3** with `@gsap/react` — ScrollTrigger, SplitText, Flip, DrawSVG, ScrambleText
- **Lenis** (smooth scrolling), **lucide-react** (icons), **react-hook-form** (forms)

## Highlights

- **Particle hero** — about 2,600 canvas particles morph between course-field shapes in sync with the rotating headline word, avoid the cursor, and scatter on scroll ([`src/lib/particles.ts`](src/lib/particles.ts))
- Pinned horizontal career tracks, Flip-filtered courses, a scroll-drawn journey path, counters, an accessible carousel, and a 3-step enrollment form
- Every animation respects `prefers-reduced-motion`
- Layout direction mirrors automatically between Arabic and English

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Project structure

```
src/
  components/
    sections/   page sections (Hero, Courses, Contact, ...)
    cinema/     motion pieces: preloader, cursor, chapter HUD, wordmark
    ui/         shared UI pieces (Button, icons, headings)
  i18n/         Arabic and English content + language context
  lib/          GSAP setup, particle engine, scroll helpers
```

## Deploying to Vercel

Works with no extra configuration: framework **Vite**, build command `npm run build`, output directory `dist`.

## Before going live

- Replace the placeholder content and images in `src/i18n/content.ts`
- Connect the enrollment form (`src/components/sections/Contact.tsx`) and the newsletter to an API or CRM
- Set the real WhatsApp number (`shared.whatsapp`)
