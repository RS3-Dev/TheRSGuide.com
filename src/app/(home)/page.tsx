import Link from "next/link";

export default function HomePage() {
  return (
    <main className="homepage relative min-h-screen overflow-hidden bg-[var(--bg-base)]">
      {/* Atmospheric background layers */}
      <div className="homepage-gradient absolute inset-0" />
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03]" />

      {/* Subtle vignette */}
      <div className="homepage-vignette absolute inset-0" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">

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
            A guide to RuneScape
          </p>

          {/* Combat styles - simple inline links */}
          <div className="flex flex-wrap justify-center gap-6 mt-20 text-[var(--text-muted)]">
            <Link href="/getting-started/melee" className="hover:text-[var(--gold)] transition-colors">
              Melee
            </Link>
            <span className="text-[var(--border-subtle)]">/</span>
            <Link href="/getting-started/ranged" className="hover:text-[var(--gold)] transition-colors">
              Ranged
            </Link>
            <span className="text-[var(--border-subtle)]">/</span>
            <Link href="/getting-started/magic" className="hover:text-[var(--gold)] transition-colors">
              Magic
            </Link>
            <span className="text-[var(--border-subtle)]">/</span>
            <Link href="/getting-started/necromancy" className="hover:text-[var(--gold)] transition-colors">
              Necromancy
            </Link>
          </div>

          {/* Main navigation */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              href="/setup"
              className="px-6 py-3 bg-[var(--gold)] text-[var(--bg-base)] font-medium hover:opacity-90 transition-opacity"
            >
              Setup Guide
            </Link>
            <Link
              href="/getting-started"
              className="px-6 py-3 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
            >
              Getting Started
            </Link>
            <Link
              href="/guides"
              className="px-6 py-3 border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
            >
              Guides
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-[var(--border-subtle)] px-6 py-6">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-sm text-[var(--text-muted)]">
             Built by Griffin, Josh, Pup & Ryan (The RS Guy)
            </p>
            <p className="text-xs text-[var(--text-muted)] opacity-70">
              © 2025
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
