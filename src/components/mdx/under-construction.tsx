import { useId, useState, type ReactNode } from 'react'
import { Construction, Eye } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { proseFlowClassName } from '@/components/mdx/prose'
import { cn } from '@/lib/utils'

interface UnderConstructionProps {
  children?: ReactNode
}

export function UnderConstruction({ children }: UnderConstructionProps) {
  const [isRevealed, setIsRevealed] = useState(false)
  const contentId = useId()

  return (
    <section>
      <div className="flex min-h-64 flex-col items-center justify-center gap-5 border border-border bg-card/50 px-6 py-12 text-center">
        <Construction aria-hidden="true" className="size-9 text-primary" strokeWidth={1.5} />
        <div>
          <h1 className="m-0 font-display text-2xl font-semibold text-foreground sm:text-3xl">
            Page is under construction
          </h1>
          <Button
            aria-controls={contentId}
            aria-expanded={isRevealed}
            className="mt-5"
            onClick={() => setIsRevealed((revealed) => !revealed)}
            type="button"
            variant="outline"
          >
            <Eye aria-hidden="true" />
            {isRevealed ? 'Hide progress' : 'Click to see the progress'}
          </Button>
        </div>
      </div>

      {isRevealed && (
        <div id={contentId} className={cn(proseFlowClassName, 'mt-10')}>
          {children}
        </div>
      )}
    </section>
  )
}
