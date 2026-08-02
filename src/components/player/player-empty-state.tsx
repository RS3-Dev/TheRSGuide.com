import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { PlayerSearchForm } from "@/components/player/player-search-form"
import { cn } from "@/lib/utils"

function PlayerEmptyState({
  error,
  initialValue,
}: {
  error?: string
  initialValue?: string
}) {
  return (
    <Empty className="mx-auto min-h-[calc(100svh-14rem)] w-[min(100%,48rem)] items-stretch justify-center rounded-none p-0 text-left">
      <EmptyHeader className="max-w-none items-stretch">
        <EmptyTitle>
          <h1
            className={cn(
              "mt-[.3rem] mb-[.8rem] font-display text-[clamp(2.25rem,5vw,4.75rem)] leading-none",
              error && "text-[clamp(2rem,4vw,3.6rem)]"
            )}
          >
            {error
              ? "We couldn’t load that profile."
              : "Find your next unlock."}
          </h1>
        </EmptyTitle>
        <EmptyDescription className="max-w-[44rem] text-[1.02rem] leading-[1.65]">
          {error
            ? `${error}. Check the spelling and make sure the RuneMetrics profile is public.`
            : "Enter a RuneScape username to compare its levels and completed quests against every early, mid, and late game recommendation in the guide."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="max-w-none items-stretch">
        <PlayerSearchForm initialValue={initialValue} />
      </EmptyContent>
    </Empty>
  )
}

export { PlayerEmptyState }
