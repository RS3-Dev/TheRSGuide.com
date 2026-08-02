import { HomeLanding, type LandingLink } from "@/components/home/home-landing"
import { LeaguesCountdown } from "@/components/home/leagues-countdown"
import { homepagePrimaryLinks, isLeaguesMode } from "@/lib/homepage-mode"

const evergreenCombatLinks: readonly LandingLink[] = [
  { label: "Melee", to: "/guides/melee" },
  { label: "Ranged", to: "/guides/range" },
  { label: "Magic", to: "/guides/magic" },
  { label: "Necromancy", to: "/guides/necromancy" },
]

function EvergreenHome() {
  const leaguesMode = isLeaguesMode(import.meta.env.VITE_HOMEPAGE_MODE)

  return (
    <HomeLanding
      title={
        <>
          The <span>RS</span> Guide
        </>
      }
      primaryLinks={homepagePrimaryLinks(import.meta.env.VITE_HOMEPAGE_MODE)}
      spotlight={leaguesMode ? <LeaguesCountdown /> : undefined}
      secondaryLabel="Combat style guides"
      secondaryLinks={evergreenCombatLinks}
    />
  )
}

export { EvergreenHome }
