import { useEffect, useState } from 'react'
import { countdownUnits, resolveLeaguesCountdown } from '@/lib/leagues-countdown'

const countdownParts = [
  ['days', 'Days'],
  ['hours', 'Hours'],
  ['minutes', 'Minutes'],
  ['seconds', 'Seconds'],
] as const

export function LeaguesCountdown() {
  const [now, setNow] = useState(() => Date.now())
  const countdown = resolveLeaguesCountdown(
    now,
    import.meta.env.VITE_LEAGUES_START_DATE,
    import.meta.env.VITE_LEAGUES_END_DATE,
  )

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [])

  if (!countdown) return null

  const units = countdownUnits(countdown.targetTimestamp - now)
  const phaseLabel = countdown.phase === 'starts' ? 'Leagues II begins in' : 'Leagues II ends in'

  return (
    <section
      className="w-[min(100%,42rem)]"
      data-countdown-phase={countdown.phase}
      aria-label={`${phaseLabel} ${Object.values(units).join(' ')}`}
    >
      <div className="grid grid-cols-4">
        {countdownParts.map(([key, label]) => (
          <span
            className="flex min-w-0 flex-col gap-[.15rem]"
            key={key}
          >
            <strong className="font-display text-[clamp(1.7rem,5vw,2.45rem)] leading-none tabular-nums max-[521px]:text-[1.55rem]">
              {String(units[key]).padStart(2, '0')}
            </strong>
            <small className="text-[.65rem] font-bold tracking-[.08em] text-muted-foreground uppercase max-[521px]:text-[.58rem] max-[521px]:tracking-[.05em]">
              {label}
            </small>
          </span>
        ))}
      </div>
    </section>
  )
}
