import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { EvaluatedRecommendation } from '@/lib/player-progression'
import { getPlayerSuggestions } from '@/lib/player-suggestions'

const stageLabels = {
  early: 'Early game',
  mid: 'Mid game',
  late: 'Late game',
}

export function ProgressionAdvisor({
  username,
  recommendations,
}: {
  username: string
  recommendations: EvaluatedRecommendation[]
}) {
  const [open, setOpen] = useState(false)
  const suggestions = useMemo(() => getPlayerSuggestions(recommendations), [recommendations])
  const [primary, ...secondary] = suggestions

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="fixed right-5 bottom-5 h-12 gap-[.7rem] rounded-none bg-card pr-4 pl-[.65rem] shadow-[0_.8rem_2.25rem_color-mix(in_oklch,var(--foreground)_14%,transparent)] max-[521px]:right-4 max-[521px]:bottom-4 max-[521px]:h-11 max-[521px]:text-[.78rem]"
        >
          <span className="size-[1.55rem] shrink-0 bg-primary" aria-hidden="true" />
          <span>Click me for suggestions</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="h-[min(46rem,calc(100svh-2rem))] w-[min(44rem,calc(100vw-2rem))] max-w-none gap-0 overflow-hidden rounded-(--radius) p-0 max-[521px]:h-[calc(100svh-1.25rem)] max-[521px]:w-[calc(100vw-1.25rem)]">
        <ScrollArea
          className="h-[calc(100%-6.5rem)] max-[521px]:h-[calc(100%-5.5rem)]"
          thumbClassName="bg-[color-mix(in_oklch,var(--muted-foreground)_55%,transparent)]"
        >
          <div className="p-7 max-[521px]:px-5 max-[521px]:py-[1.4rem]">
            <DialogHeader className="max-w-[36rem] gap-[.55rem] pr-7 max-[521px]:pr-6">
              <DialogTitle className="font-display text-[clamp(1.65rem,4vw,2.25rem)] leading-[1.1] font-bold">
                {username}&apos;s next steps
              </DialogTitle>
              <DialogDescription className="leading-[1.55]">
                Suggestions based on this player&apos;s RuneMetrics data and
                manually checked unlocks.
              </DialogDescription>
            </DialogHeader>

            {primary ? (
              <>
                <section className="mt-6 border-y py-[1.35rem] pb-6">
                  <div className="flex items-baseline justify-between gap-x-6 gap-y-3 max-[521px]:flex-col max-[521px]:items-start max-[521px]:gap-[.35rem]">
                    <h3 className="m-0 font-display text-[1.22rem] leading-[1.25]">
                      {primary.recommendation.title}
                    </h3>
                    <span className="shrink-0 text-[.7rem] font-extrabold text-primary">
                      {primary.kind === 'ready' ? 'Ready now' : 'Build toward'} {'\u00b7'} {stageLabels[primary.recommendation.stage]}
                    </span>
                  </div>
                  <p className="mt-3 mb-[1.05rem] max-w-[58ch] leading-[1.55] text-muted-foreground">
                    {primary.reason}
                  </p>
                  <Button className="rounded-none" size="sm" asChild>
                    <Link to={primary.recommendation.path}>Open guide<ArrowRight data-icon="inline-end" /></Link>
                  </Button>
                </section>

                {secondary.length > 0 && (
                  <div className="flex flex-col">
                    {secondary.map((suggestion) => (
                      <Link
                        key={suggestion.recommendation.path}
                        to={suggestion.recommendation.path}
                        className="group/advisor-link grid min-w-0 grid-cols-[minmax(0,1fr)_1rem] items-center gap-4 border-b py-4 pr-[.3rem] transition-[padding,background-color] duration-150 hover:bg-accent hover:pl-2"
                      >
                        <span className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-[.18rem] max-[521px]:grid-cols-1 max-[521px]:gap-[.18rem]">
                          <strong className="text-[.88rem]">{suggestion.recommendation.title}</strong>
                          <small className="whitespace-nowrap text-[.66rem] font-extrabold text-primary">{suggestion.kind === 'ready' ? 'Ready now' : 'Build toward'} {'\u00b7'} {stageLabels[suggestion.recommendation.stage]}</small>
                          <span className="col-span-full text-xs leading-[1.4] text-muted-foreground max-[521px]:col-span-1">{suggestion.reason}</span>
                        </span>
                        <ArrowRight className="size-[.9rem] text-muted-foreground transition-[transform,color] duration-150 group-hover/advisor-link:translate-x-[.2rem] group-hover/advisor-link:text-primary" aria-hidden="true" />
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="mt-6 mb-0 max-w-[52ch] border-y py-6 leading-[1.55] text-muted-foreground">Everything in the current progression list is complete. You&apos;re ready for the next set of recommendations.</p>
            )}
          </div>
        </ScrollArea>

        <div className="absolute bottom-6 left-7 size-16 bg-primary max-[521px]:bottom-5 max-[521px]:left-5 max-[521px]:size-14" role="img" aria-label="Suggestion character placeholder" />
      </DialogContent>
    </Dialog>
  )
}
