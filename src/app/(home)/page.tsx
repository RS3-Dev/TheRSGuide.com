import Link from "next/link";

export default function HomePage() {
  return (
    <main className="homepage relative h-[calc(100dvh-56px)] md:h-[calc(100dvh-64px)] overflow-hidden bg-[var(--bg-base)]">
      {/* Atmospheric background layers */}
      <div className="homepage-gradient absolute inset-0" />
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03]" />

      {/* Subtle vignette */}
      <div className="homepage-vignette absolute inset-0" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-20">
          {/* Main title */}
          <h1 className="text-center">
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-[var(--text-primary)]">
              The <span className="text-[var(--gold)]">RS</span> Guide
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-center text-lg md:text-xl text-[var(--text-secondary)] max-w-lg leading-relaxed mt-6">
            A comprehensive guide to RuneScape progression
          </p>

          {/* Main navigation */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-12 sm:mt-20 w-full sm:w-auto px-4 sm:px-0">
            <Link
              href="/guides"
              className="px-6 py-3 bg-[var(--gold)] text-[var(--bg-base)] font-medium hover:opacity-90 transition-opacity text-center"
            >
              Guides
            </Link>
            <Link
              href="/getting-started"
              className="px-6 py-3 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors text-center"
            >
              Getting Started
            </Link>
            <Link
              href="/setup"
              className="px-6 py-3 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors text-center"
            >
              Setup Guide
            </Link>
          </div>

          {/* Combat styles - simple inline links */}
          <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 sm:gap-x-6 mt-6 sm:mt-8 text-[var(--text-muted)] text-sm sm:text-base">
            <Link
              href="/guides/melee"
              className="hover:text-[var(--gold)] transition-colors"
            >
              Melee
            </Link>
            <span className="text-[var(--border-subtle)]">/</span>
            <Link
              href="/guides/range"
              className="hover:text-[var(--gold)] transition-colors"
            >
              Ranged
            </Link>
            <span className="text-[var(--border-subtle)]">/</span>
            <Link
              href="/guides/magic"
              className="hover:text-[var(--gold)] transition-colors"
            >
              Magic
            </Link>
            <span className="text-[var(--border-subtle)]">/</span>
            <Link
              href="/guides/necromancy"
              className="hover:text-[var(--gold)] transition-colors"
            >
              Necromancy
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
