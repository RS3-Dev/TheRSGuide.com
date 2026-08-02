import { progressionStages } from "@/components/player/player-progression-stages"
import { Skeleton } from "@/components/ui/skeleton"

function PlayerPageSkeleton() {
  return (
    <div
      className="flex flex-col gap-5"
      aria-label="Loading player progression"
    >
      <header className="flex items-center justify-between gap-12 border-b pb-5 max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-5">
        <div className="min-w-0">
          <Skeleton className="h-10 w-56 max-w-full" />
        </div>
        <Skeleton className="h-11 w-full max-w-[31rem] flex-[0_1_31rem] max-[768px]:max-w-none max-[768px]:flex-basis-auto" />
      </header>
      <Skeleton className="h-3 w-80 max-w-full" />
      <div className="grid grid-cols-3 items-start gap-9 max-[1181px]:grid-cols-1 max-[1181px]:gap-12">
        {progressionStages.map((stage) => (
          <section className="flex flex-col gap-[.85rem]" key={stage.key}>
            <Skeleton className="mb-[.15rem] h-8 w-36" />
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton className="h-14 w-full" key={index} />
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}

export { PlayerPageSkeleton }
