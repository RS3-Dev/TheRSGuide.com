import { RecommendationRow } from "@/components/player/recommendation-row"
import { progressionStages } from "@/components/player/player-progression-stages"
import type {
  EvaluatedRecommendation,
} from "@/lib/player-progression"

function PlayerProgressionGrid({
  recommendations,
  onManualCompletionChange,
}: {
  recommendations: EvaluatedRecommendation[]
  onManualCompletionChange: (path: string, completed: boolean) => void
}) {
  return (
    <div className="grid grid-cols-3 items-start gap-9 max-[1181px]:grid-cols-1 max-[1181px]:gap-12">
      {progressionStages.map((stage) => {
        const stageRecommendations = recommendations.filter(
          (recommendation) => recommendation.stage === stage.key
        )
        return (
          <section key={stage.key}>
            <header className="border-b pb-[.9rem] max-[1181px]:min-h-0">
              <h2 className="m-0 flex items-baseline justify-between gap-4 font-display text-[clamp(1.5rem,2.3vw,2.15rem)]">
                {stage.title}
                <span className="font-sans text-[.72rem] font-extrabold text-muted-foreground">
                  {
                    stageRecommendations.filter(
                      (item) => item.status === "completed"
                    ).length
                  }
                  /{stageRecommendations.length}
                </span>
              </h2>
            </header>
            <div className="flex flex-col">
              {stageRecommendations.map((recommendation) => (
                <RecommendationRow
                  key={recommendation.path}
                  recommendation={recommendation}
                  onManualCompletionChange={onManualCompletionChange}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export { PlayerProgressionGrid }
