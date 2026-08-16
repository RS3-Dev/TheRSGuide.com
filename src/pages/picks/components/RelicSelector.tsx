import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import '@/styles/picker.css'

import type { RelicItem } from '@/components/mdx/relic-display'
import relicData from '@/data/leagues-ii/relics.json'
import {
  RELIC_TIERS,
  REJUVENATED_RELIC_NAME,
  getRejuvenatedRelicTier,
} from '@/lib/picks-state'
import { PickProgressBar } from './PickProgressBar'
import { PickerSpinButton, type PickerSpinAction } from './PickerSpinButton'
import { PickerRelicDetailsDrawer } from './PickerRelicDetailsDrawer'
import { TierOptionMatrix, type TierOptionMatrixRow } from './TierOptionMatrix'

type RelicSelectorProps = {
  blockedRelicIds?: ReadonlySet<string>
  onChange: (relics: Record<number, string>) => void
  onBlockedRelicToggle?: (tier: number, relicId: string) => void
  onRejuvenatedRelicChange: (relicId: string) => void
  selectedRejuvenatedRelic: string
  selectedRelics: Record<number, string>
  spinAction?: PickerSpinAction
}

const RELIC_OPTION_ROWS = ['A', 'B', 'C'] as const

const KNOWN_RELICS = new Map<string, RelicItem>(
  relicData.Relics.map((relic) => [relic.name, relic]),
)

type SelectedRelicDetails = {
  relic: RelicItem
  tier: number
}

export function RelicSelector({
  blockedRelicIds,
  onChange,
  onBlockedRelicToggle,
  onRejuvenatedRelicChange,
  selectedRejuvenatedRelic,
  selectedRelics,
  spinAction,
}: RelicSelectorProps) {
  const [selectedRelicDetails, setSelectedRelicDetails] =
    useState<SelectedRelicDetails | null>(null)
  const selectedCount = Object.keys(selectedRelics).length
  const displayedRelicTiers = RELIC_TIERS
  const rejuvenatedTier = getRejuvenatedRelicTier(selectedRelics)
  const isChoosingRejuvenatedRelic = Boolean(
    rejuvenatedTier && !selectedRejuvenatedRelic,
  )

  const toggleRelic = (tier: number, relicName: string) => {
    const relic = displayedRelicTiers
      .find((entry) => entry.tier === tier)
      ?.options.find(({ id }) => id === relicName)
    const isRejuvenated = relic?.label === REJUVENATED_RELIC_NAME
    const isRejuvenatedMatch = selectedRejuvenatedRelic === relicName

    if (
      isChoosingRejuvenatedRelic &&
      rejuvenatedTier &&
      tier < rejuvenatedTier &&
      selectedRelics[tier] !== relicName
    ) {
      onRejuvenatedRelicChange(relicName)
      return
    }

    const nextSelection = { ...selectedRelics }
    if (isRejuvenatedMatch && rejuvenatedTier !== undefined) {
      delete nextSelection[rejuvenatedTier]
      onChange(nextSelection)
      onRejuvenatedRelicChange('')
      return
    }

    if (nextSelection[tier] === relicName) {
      delete nextSelection[tier]
    } else {
      nextSelection[tier] = relicName
    }
    onChange(nextSelection)
    if (isRejuvenated || !getRejuvenatedRelicTier(nextSelection)) {
      onRejuvenatedRelicChange('')
    }
  }

  const matrixTiers = displayedRelicTiers.map((tier) => ({
    isSelected: Boolean(selectedRelics[tier.tier]),
    tier: tier.tier,
  }))
  const matrixRows: TierOptionMatrixRow[] = RELIC_OPTION_ROWS.map(
    (optionLetter, optionIndex) => ({
      id: optionLetter,
      cells: displayedRelicTiers.map((tier) => {
        const option = tier.options[optionIndex]
        if (!option) return null
        const isMainSelection = selectedRelics[tier.tier] === option.id
        const isRejuvenated =
          option.label === REJUVENATED_RELIC_NAME && isMainSelection
        const isRejuvenatedMatch = selectedRejuvenatedRelic === option.id
        const isRejuvenatedCandidate = Boolean(
          isChoosingRejuvenatedRelic &&
            rejuvenatedTier &&
            tier.tier < rejuvenatedTier &&
            !isMainSelection,
        )
        const knownRelic = KNOWN_RELICS.get(option.label)
        return {
          ariaLabel: `Tier ${tier.tier}, option ${optionLetter}, ${option.label}${isRejuvenatedCandidate ? ', available as the Rejuvenated pick' : ''}${isRejuvenatedMatch ? ', paired with Rejuvenated' : ''}${option.description ? `: ${option.description}` : ''}`,
          description: option.description ?? 'Relic description coming soon',
          fallback: optionLetter,
          id: option.id,
          image: option.icon,
          isBlocked: blockedRelicIds?.has(option.id),
          isSelected: isMainSelection || isRejuvenatedMatch,
          label: option.label,
          detailsAriaLabel: knownRelic
            ? `View details for ${knownRelic.name}`
            : undefined,
          onSelect: () => toggleRelic(tier.tier, option.id),
          onBlockToggle: onBlockedRelicToggle
            ? () => onBlockedRelicToggle(tier.tier, option.id)
            : undefined,
          onViewDetails: knownRelic
            ? () =>
                setSelectedRelicDetails({ relic: knownRelic, tier: tier.tier })
            : undefined,
          readOnly: false,
          relicState:
            isRejuvenated || isRejuvenatedMatch
              ? ('rejuvenated-selected' as const)
              : isRejuvenatedCandidate
                ? ('rejuvenated-available' as const)
                : undefined,
        }
      }),
    }),
  )

  return (
    <section className="select-none">
      <div className="mb-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h2
            className={`mr-auto font-display font-semibold text-foreground ${
              spinAction ? 'text-xl sm:text-2xl' : 'text-2xl'
            }`}
          >
            1. Choose your relics
          </h2>
          {spinAction && <PickerSpinButton {...spinAction} />}
          <button
            aria-label="Reset relic picks"
            className="flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/50 text-primary transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
            disabled={selectedCount === 0}
            onClick={() => {
              onChange({})
              onRejuvenatedRelicChange('')
            }}
            title="Reset relic picks"
            type="button"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
        <PickProgressBar
          className="mt-3"
          label={`${selectedCount} of ${displayedRelicTiers.length} tiers selected`}
          max={displayedRelicTiers.length}
          value={selectedCount}
        />
      </div>

      <TierOptionMatrix
        ariaLabel="Relic options by tier"
        className="relic-grid-scroll"
        rows={matrixRows}
        tiers={matrixTiers}
        variant="relic"
      />

      <div aria-live="polite" className="mt-3 min-h-10 sm:min-h-5">
        {isChoosingRejuvenatedRelic && (
          <p className="text-sm font-semibold text-[var(--rejuvenated)]">
            Choose one glowing relic from Tier 1–5 to pair with Rejuvenated.
          </p>
        )}
      </div>

      <PickerRelicDetailsDrawer
        relic={selectedRelicDetails?.relic ?? null}
        tier={selectedRelicDetails?.tier}
        onOpenChange={(open) => {
          if (!open) setSelectedRelicDetails(null)
        }}
      />
    </section>
  )
}
