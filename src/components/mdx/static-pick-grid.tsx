import type { CSSProperties } from 'react'

import { cn } from '@/lib/utils'

type StaticPickGridItem = {
  ariaLabel: string
  backgroundColor?: string
  fallback: string
  id: string
  image?: string
  label: string
  onViewDetails?: () => void
  selectionColor?: string
}

type StaticPickGridProps = {
  ariaLabel: string
  items: StaticPickGridItem[]
}

function StaticPickGrid({ ariaLabel, items }: StaticPickGridProps) {
  return (
    <div
      aria-label={ariaLabel}
      className="mt-4 grid max-w-2xl grid-cols-2 border-t border-l border-border bg-[#0a0908] sm:grid-cols-4"
      role="list"
    >
      {items.map((item) => {
        const style = {
          backgroundColor: item.backgroundColor,
          '--static-pick-color': item.selectionColor ?? '#cc9a63',
        } as CSSProperties
        const content = (
          <>
            <span className="flex h-20 w-full items-center justify-center">
              {item.image ? (
                <img
                  alt=""
                  aria-hidden
                  className="h-20 w-auto max-w-full object-contain transition-transform duration-150 group-hover:scale-105"
                  draggable={false}
                  height={100}
                  src={item.image}
                  width={100}
                />
              ) : (
                <span className="text-2xl font-black leading-none text-[var(--static-pick-color)]">
                  {item.fallback}
                </span>
              )}
            </span>
            <span className="flex min-h-7 items-center justify-center text-center text-[9px] font-black uppercase leading-[1.1] tracking-[0.08em] text-[#efe4d2]/80">
              <span className="line-clamp-2">{item.label}</span>
            </span>
          </>
        )

        return (
          <div
            className="relative flex min-h-28 border-r border-b border-border outline-2 -outline-offset-2 outline-[var(--static-pick-color)]"
            key={item.id}
            role="listitem"
            style={style}
          >
            {item.onViewDetails ? (
              <button
                aria-label={`${item.ariaLabel}. View details.`}
                className={cn(
                  'group flex w-full flex-col items-center justify-end gap-1 px-2 pt-2 pb-2',
                  'transition-[filter,background-color] duration-150 hover:brightness-125',
                  'focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset',
                )}
                onClick={item.onViewDetails}
                type="button"
              >
                {content}
              </button>
            ) : (
              <div
                aria-label={item.ariaLabel}
                className="group flex w-full flex-col items-center justify-end gap-1 px-2 pt-2 pb-2"
              >
                {content}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export { StaticPickGrid }
export type { StaticPickGridItem, StaticPickGridProps }
