import { useEffect } from 'react'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { playerPaths } from '@/lib/player-paths'
import { usePageMetadata } from '@/lib/page-metadata'
import '@/styles/getting-started.css'

type PlayerPath = (typeof playerPaths)[number]

function PlayerPathImage({ player, className }: { player: PlayerPath; className: string }) {
  return (
    <img
      src={player.image}
      alt=""
      width={800}
      height={650}
      style={{ objectPosition: player.imagePosition }}
      className={`w-full object-cover ${className}`}
    />
  )
}

function PlayerPathSelector() {
  return (
    <>
      <header className="mb-10 text-center lg:mb-12">
        <h1 className="font-brand text-3xl font-bold text-primary sm:text-4xl">Getting Started</h1>
        <p className="mt-3 text-muted-foreground">Choose the path that fits you.</p>
      </header>
      <nav aria-label="Choose your player type" className="grid gap-4 md:grid-cols-3 lg:gap-6">
        {playerPaths.map((player) => (
          <Link key={player.id} to={`/start/${player.id}`} className="player-path flex flex-col border bg-card outline-offset-4 focus-visible:outline-2 focus-visible:outline-ring">
            <div className="overflow-hidden">
              <PlayerPathImage player={player} className="player-path-image aspect-[2/1] md:aspect-square" />
            </div>
            <h2 className="player-path-label grid h-14 place-items-center px-3 text-center font-brand text-lg font-bold md:h-24 lg:h-28 lg:text-xl">
              {player.title}
            </h2>
          </Link>
        ))}
      </nav>
    </>
  )
}

function PlayerPathGuides({ player }: { player: PlayerPath }) {
  return (
    <>
      <Link to="/start" className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-muted-foreground outline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Getting Started
      </Link>
      <div className="grid gap-8 md:grid-cols-3 md:gap-4 lg:gap-6">
        <PlayerPathImage player={player} className="player-path-photo aspect-[2/1] self-start border md:aspect-[3/4]" />
        <div className="md:col-span-2 md:pl-6 lg:pl-10">
          <h1 className="font-brand text-3xl font-bold text-primary sm:text-4xl">{player.title}</h1>
          <p className="mt-3 mb-8 max-w-xl leading-relaxed text-muted-foreground">{player.description}</p>
          <nav aria-label={`${player.title} guides`}>
            <ol className="divide-y border-y">
              {player.guides.map((guide, index) => (
                <li key={guide.path}>
                  <Link to={guide.path} className="player-guide group flex items-center gap-4 py-5 outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring">
                    <span className="w-5 shrink-0 font-display text-lg font-bold text-primary" aria-hidden="true">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold group-hover:text-primary group-focus-visible:text-primary">{guide.label}</h2>
                      <p className="mt-0.5 text-[.95rem] text-muted-foreground">{guide.description}</p>
                    </div>
                    <ChevronRight className="player-guide-arrow size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </>
  )
}

function GettingStartedPage({ playerType }: { playerType?: string }) {
  const player = playerPaths.find((path) => path.id === playerType)

  usePageMetadata({
    path: player ? `/start/${player.id}` : '/start',
    title: `${player ? `${player.title} Guides` : 'Getting Started'} | The RS Guide`,
    description: player?.description ?? 'New to RuneScape, returning to Gielinor, or coming from OSRS? Find your starting point.',
    image: '/og/home.png',
    imageAlt: 'The RS Guide',
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [playerType])

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pt-10 pb-16 sm:pt-14 lg:pt-20">
      {player ? <PlayerPathGuides player={player} /> : <PlayerPathSelector />}
    </main>
  )
}

export { GettingStartedPage }
