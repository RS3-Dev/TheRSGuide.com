import { HomeLanding } from "@/components/home/home-landing"
import { LeaguesCountdown } from "@/components/home/leagues-countdown"
import { homepagePrimaryLinks, isLeaguesMode } from "@/lib/homepage-mode"

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
    />
  )
}

export { EvergreenHome }
