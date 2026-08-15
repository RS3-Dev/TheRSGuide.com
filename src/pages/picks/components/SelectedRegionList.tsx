import type { RegionSelection } from '@/lib/picks-state'
import { cn } from '@/lib/utils'
import { REQUIRED_REGION_COUNT } from '../../../../shared/share-contract'

type SelectedRegionListProps = {
  compact?: boolean
  regions: RegionSelection[]
  slots?: number
}

function getContrastTextColor(backgroundColor: string) {
  const hex = backgroundColor.replace('#', '')
  const red = Number.parseInt(hex.slice(0, 2), 16) || 0
  const green = Number.parseInt(hex.slice(2, 4), 16) || 0
  const blue = Number.parseInt(hex.slice(4, 6), 16) || 0
  return (red * 299 + green * 587 + blue * 114) / 1000 > 145
    ? '#1a1a1a'
    : '#F4F0E6'
}

export function SelectedRegionList({
  compact = false,
  regions,
  slots = REQUIRED_REGION_COUNT,
}: SelectedRegionListProps) {
  return (
    <aside>
      <ol className="flex h-full flex-col">
        {Array.from({ length: slots }, (_, index) => {
          const region = regions[index]
          const regionColor = region?.color

          return (
            <li
              className={cn(
                'flex min-h-24 flex-1 items-center gap-4 border border-b-0 border-border bg-card/50 px-5 py-4 transition-colors duration-200 last:border-b lg:border-r-0 lg:border-b lg:last:border-b',
                compact && 'min-h-16 px-4 py-3',
              )}
              key={`region-pick-${index}`}
              style={{
                backgroundColor: regionColor,
                color: region && regionColor
                  ? getContrastTextColor(regionColor)
                  : undefined,
              }}
            >
              <span className="text-3xl font-black leading-none opacity-35">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="min-w-0 text-sm font-semibold leading-snug">
                {region?.name ?? 'Select from map'}
              </p>
            </li>
          )
        })}
      </ol>
    </aside>
  )
}

