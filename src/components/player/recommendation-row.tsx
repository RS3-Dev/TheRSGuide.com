import { Link } from "react-router"
import {
  ArrowRight,
  Check,
  CircleDashed,
  LockKeyhole,
} from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import type {
  EvaluatedRecommendation,
  ProgressionStatus,
} from "@/lib/player-progression"

const statusLabels: Record<ProgressionStatus, string> = {
  completed: "Completed",
  ready: "Requirements met",
  locked: "Requirements not met",
}

function StatusIcon({ status }: { status: ProgressionStatus }) {
  if (status === "completed") return <Check aria-hidden="true" />
  if (status === "ready") return <CircleDashed aria-hidden="true" />
  return <LockKeyhole aria-hidden="true" />
}

function RecommendationRow({
  recommendation,
  onManualCompletionChange,
}: {
  recommendation: EvaluatedRecommendation
  onManualCompletionChange: (path: string, completed: boolean) => void
}) {
  const isManuallyTrackable = !recommendation.completionQuest
  const detail =
    recommendation.status === "completed"
      ? isManuallyTrackable
        ? "Confirmed by you"
        : "Confirmed by RuneMetrics"
      : recommendation.status === "locked"
        ? `Needs ${recommendation.missing.slice(0, 2).join(" Â· ")}${
            recommendation.missing.length > 2
              ? ` Â· +${recommendation.missing.length - 2} more`
              : ""
          }`
        : recommendation.manualChecks.length
          ? `In-game check: ${recommendation.manualChecks[0]}${
              recommendation.manualChecks.length > 1
                ? ` Â· +${recommendation.manualChecks.length - 1} more`
                : ""
            }`
          : recommendation.requirementCount
            ? `${recommendation.requirementCount} tracked requirement${
                recommendation.requirementCount === 1 ? "" : "s"
              }`
            : "No additional tracked requirements"

  return (
    <article
      className="group/row grid min-w-0 grid-cols-[1.65rem_minmax(0,1fr)] items-start gap-[.65rem] border-b py-[.85rem] pr-2 pl-[.35rem] transition-colors duration-150 hover:bg-accent"
      data-status={recommendation.status}
    >
      {isManuallyTrackable ? (
        <span className="flex min-h-[1.4rem] items-center">
          <Checkbox
            className="size-[1.4rem] rounded-none"
            checked={recommendation.status === "completed"}
            onCheckedChange={(checked) =>
              onManualCompletionChange(recommendation.path, checked === true)
            }
            aria-label={`Mark ${recommendation.title} ${
              recommendation.status === "completed" ? "incomplete" : "complete"
            }`}
          />
        </span>
      ) : (
        <span className="mt-[.05rem] grid size-[1.4rem] place-items-center border border-current group-data-[status=completed]/row:text-progress-complete group-data-[status=ready]/row:text-progress-ready group-data-[status=locked]/row:text-progress-locked [&>svg]:size-[.8rem]">
          <StatusIcon status={recommendation.status} />
        </span>
      )}
      <Link
        className="grid min-w-0 grid-cols-[minmax(0,1fr)_1rem] items-start gap-[.6rem]"
        to={recommendation.path}
      >
        <span className="flex min-w-0 flex-col gap-1 text-[.77rem] leading-[1.4] text-muted-foreground [&>small]:mt-[.1rem] [&>small]:text-[.68rem] [&>small]:text-foreground">
          <span className="flex flex-wrap items-baseline justify-between gap-x-[.6rem] gap-y-[.3rem] text-foreground">
            <strong className="text-[.88rem]">{recommendation.title}</strong>
            <span className="text-[.63rem] font-extrabold tracking-[.055em] text-muted-foreground uppercase group-data-[status=completed]/row:text-progress-complete group-data-[status=ready]/row:text-progress-ready">
              {statusLabels[recommendation.status]}
            </span>
          </span>
          <small>{detail}</small>
        </span>
        <ArrowRight
          className="mt-[.2rem] size-[.9rem] text-muted-foreground transition-[transform,color] duration-150 group-hover/row:translate-x-[.2rem] group-hover/row:text-primary"
          aria-hidden="true"
        />
      </Link>
    </article>
  )
}

export { RecommendationRow }
