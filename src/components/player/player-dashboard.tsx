import { PlayerBreadcrumbs } from "@/components/player/player-breadcrumbs"
import { PlayerEmptyState } from "@/components/player/player-empty-state"
import { PlayerPageSkeleton } from "@/components/player/player-page-skeleton"
import { PlayerProfile } from "@/components/player/player-profile"
import { PlayerProgressionGrid } from "@/components/player/player-progression-grid"
import { usePlayerDashboard } from "@/components/player/use-player-dashboard"
import { usePageMetadata } from "@/lib/page-metadata"

function PlayerDashboard() {
  const {
    requestedUsername,
    visiblePlayerData,
    loading,
    error,
    recommendations,
    setManualCompletion,
  } = usePlayerDashboard()

  usePageMetadata({
    path: "/extras/player",
    title: visiblePlayerData
      ? `${visiblePlayerData.username} Progression | The RS Guide`
      : "Player Progression | The RS Guide",
    description: visiblePlayerData
      ? `Compare ${visiblePlayerData.username}'s RuneScape profile with early, mid, and late game progression recommendations.`
      : "Compare a RuneScape profile with early, mid, and late game progression recommendations.",
    image: "/og/extras-player.png",
    imageAlt: "RuneScape player progression preview",
  })

  return (
    <main className="min-h-[calc(100svh-4rem)] px-16 pt-9 pb-20 max-[768px]:px-5 max-[768px]:pt-6 max-[768px]:pb-16">
      <div className="mx-auto w-full max-w-[104rem]">
        <PlayerBreadcrumbs />

        {!requestedUsername && !visiblePlayerData && <PlayerEmptyState />}

        {loading && !visiblePlayerData && <PlayerPageSkeleton />}

        {error && !loading && !visiblePlayerData && (
          <PlayerEmptyState error={error} initialValue={requestedUsername} />
        )}

        {visiblePlayerData && (
          <>
            <PlayerProfile username={visiblePlayerData.username} />
            <p className="mt-4 mb-7 max-w-3xl text-[.78rem] leading-[1.5] text-muted-foreground">
              Quest completion comes from RuneMetrics. Check off other unlocks
              yourself.
            </p>
            <PlayerProgressionGrid
              recommendations={recommendations}
              onManualCompletionChange={setManualCompletion}
            />
          </>
        )}
      </div>
    </main>
  )
}

export { PlayerDashboard }
