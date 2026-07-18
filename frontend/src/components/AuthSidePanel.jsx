import { useEffect, useState } from 'react'
import { CodeAssistantIllustration, TeamCollabIllustration } from './illustrations.jsx'

const AUTO_ADVANCE_MS = 4000

const CAROUSEL_SLIDES = [
  {
    type: 'image',
    src: 'https://lh3.googleusercontent.com/aida/AP1WRLtu9It7phsiUv8p3ijDpMSXUqXVRywMRlDPkSKVi-sc8qI0zHSjEtthuWQuxdRjSrzl7SImbzMuPKZi0nWH839O1H2rGHNoCzwSueytskuIuQXSoLv1MavqVqIFQ-wUYPmkQl3V8Tuph8br5M1zyiXbx71ceuIDAqI4GIVukp0YCyiKHa3JyAndgtqWwS7G4YACdx2eH7HlqvVc5dUaEMS2pXpEIHKk84MLC9kBzlviS2fpsaZmFtAvRxPh',
    alt: 'Collaborative Editor',
  },
  {
    type: 'illustration',
    Component: CodeAssistantIllustration,
    alt: 'AI-powered code editor and assistant illustration',
  },
  {
    type: 'illustration',
    Component: TeamCollabIllustration,
    alt: 'Diverse developers collaborating in a shared digital workspace',
  },
]

export default function AuthSidePanel() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % CAROUSEL_SLIDES.length)
    }, AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative hidden items-center justify-center overflow-hidden border-r border-outline-variant bg-surface p-10 lg:flex lg:w-1/2">
      <div className="w-full max-w-sm rounded-2xl bg-surface-container-lowest p-6 shadow-xl">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-surface-container-low">
          {CAROUSEL_SLIDES.map((slide, i) => (
            <div
              key={slide.alt}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === active ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {slide.type === 'image' ? (
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="h-full w-full object-cover"
                />
              ) : (
                <slide.Component />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-2 text-center">
          <h2 className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface">
            The future of collaborative coding.
          </h2>
          <p className="mx-auto max-w-md font-body-md text-body-md text-secondary">
            Build, debug, and ship together with AI-powered tools designed
            for modern teams.
          </p>
        </div>

        <div className="mt-6 flex justify-center gap-1.5">
          {CAROUSEL_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === active
                  ? 'w-8 bg-primary'
                  : 'w-1.5 bg-outline-variant hover:bg-primary/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
