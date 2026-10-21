import { useLang } from './i18n/LangContext'
import { useLenis } from './hooks/useLenis'
import { Navbar } from './components/sections/Navbar'
import { Hero } from './components/sections/Hero'
import { Partners } from './components/sections/Partners'
import { WhyUs } from './components/sections/WhyUs'
import { Tracks } from './components/sections/Tracks'
import { Courses } from './components/sections/Courses'
import { Journey } from './components/sections/Journey'
import { Stats } from './components/sections/Stats'
import { Trainers } from './components/sections/Trainers'
import { Testimonials } from './components/sections/Testimonials'
import { Upcoming } from './components/sections/Upcoming'
import { Pricing } from './components/sections/Pricing'
import { FAQ } from './components/sections/FAQ'
import { Contact } from './components/sections/Contact'
import { Footer } from './components/sections/Footer'
import { Floating } from './components/sections/Floating'

export default function App() {
  const { lang, t } = useLang()
  useLenis()

  return (
    // Re-mount on language change so every animation is rebuilt for the new direction.
    <div key={lang} className="grain">
      <a href="#main" className="sr-only z-[70] rounded-full bg-lime px-5 py-3 font-semibold text-ink focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
        {t.skip}
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <Partners />
        <WhyUs />
        <Tracks />
        <Courses />
        <Journey />
        <Stats />
        <Trainers />
        <Testimonials />
        <Upcoming />
        <Pricing />
        <FAQ />
        <Contact />
      </main>
      <Footer />
      <Floating />
    </div>
  )
}
