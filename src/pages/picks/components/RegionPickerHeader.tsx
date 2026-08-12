import { RotateCcw } from 'lucide-react'

import { OPTIONAL_REGION_PICK_COUNT } from '@/lib/picks-state'
import { PickProgressBar } from './PickProgressBar'
import { PickerSpinButton, type PickerSpinAction } from './PickerSpinButton'

type RegionPickerHeaderProps = {
  canReset: boolean
  onReset: () => void
  selectedCount: number
  spinAction?: PickerSpinAction
}

export function RegionPickerHeader({
  canReset,
  onReset,
  selectedCount,
  spinAction,
}: RegionPickerHeaderProps) {
  return (
    <div className="mb-1">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <h2
          className={`mr-auto font-display font-semibold text-foreground ${
            spinAction ? 'text-xl sm:text-2xl' : 'text-2xl'
          }`}
        >
          3. Choose your regions
        </h2>
        {spinAction && <PickerSpinButton {...spinAction} />}
        <button
          aria-label="Reset region picks"
          className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-primary/50 text-primary transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
          disabled={!canReset}
          onClick={onReset}
          title="Reset region picks"
          type="button"
        >
          <RotateCcw className="size-3.5" />
        </button>
      </div>
      <PickProgressBar
        className="mt-3"
        label={`${selectedCount} of ${OPTIONAL_REGION_PICK_COUNT} optional regions selected`}
        max={OPTIONAL_REGION_PICK_COUNT}
        value={selectedCount}
      />
    </div>
  )
}
