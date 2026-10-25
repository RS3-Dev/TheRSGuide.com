interface Metric {
  label: string
  rating: number
}

interface CombatStyleAnalysisProps {
  metrics: Metric[]
}

export function CombatStyleAnalysis({ metrics }: CombatStyleAnalysisProps) {
  return (
    <dl
      aria-label="Combat style analysis"
      className="not-prose my-4 grid gap-2 rounded-md border border-border bg-card/50 p-3 text-sm leading-5"
    >
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="grid grid-cols-[minmax(7.5rem,1fr)_minmax(0,2fr)] items-center gap-3"
        >
          <dt className="text-muted-foreground">{metric.label}</dt>
          <dd className="m-0 flex items-center gap-3">
            <div aria-hidden="true" className="flex min-w-0 flex-1 gap-0.5">
              {Array.from({ length: 10 }, (_, index) => (
                <span
                  key={index}
                  className={`h-1.5 min-w-0 flex-1 rounded-[1px] ${
                    index < metric.rating ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <span className="w-10 shrink-0 text-right font-medium tabular-nums">
              {metric.rating}<span className="font-normal text-muted-foreground">/10</span>
            </span>
          </dd>
        </div>
      ))}
    </dl>
  )
}
