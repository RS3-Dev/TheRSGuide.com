'use client'

import { useState } from 'react'

import type { RelicItem } from '@/components/mdx/relic-display'
import relicData from '@/data/leagues-ii/relics.json'
import {
  RELIC_TIERS,
  REJUVENATED_RELIC_NAME,
  getRejuvenatedRelicTier,
  normalizeRejuvenatedRelic,
} from '@/lib/picks-state'
import { PickerRelicDetailsDrawer } from '@/pages/picks/components/PickerRelicDetailsDrawer'
import {
  StaticPickGrid,
  type StaticPickGridItem,
} from './static-pick-grid'

type StaticRelicPicksProps = {
  ariaLabel?: string
  picks: Partial<Record<number, string>>
  rejuvenatedRelic?: string
}

type SelectedRelicDetails = {
  relic: RelicItem
  tier: number
}

const REJUVENATED_COLOR = '#167c9c'
const KNOWN_RELICS = new Map<string, RelicItem>(
  relicData.Relics.map((relic) => [relic.name, relic]),
)

function normalizedValue(value: string | undefined) {
  return value?.trim().toLowerCase() ?? ''
}

function findRelicOption(tier: number, pick: string | undefined) {
  const target = normalizedValue(pick)
  if (!target) return undefined

  return RELIC_TIERS
    .find((entry) => entry.tier === tier)
    ?.options.find(
      (option) =>
        normalizedValue(option.id) === target ||
        normalizedValue(option.label) === target,
    )
}

function resolveRelicSelections(picks: Partial<Record<number, string>>) {
  return Object.fromEntries(
    RELIC_TIERS.flatMap((tier) => {
      const option = findRelicOption(tier.tier, picks[tier.tier])
      return option ? [[tier.tier, option.id]] : []
    }),
  ) as Record<number, string>
}

function resolveRejuvenatedRelic(
  pick: string | undefined,
  selectedRelics: Record<number, string>,
) {
  const target = normalizedValue(pick)
  if (!target) return ''

  const option = RELIC_TIERS
    .flatMap((tier) => tier.options)
    .find(
      (entry) =>
        normalizedValue(entry.id) === target ||
        normalizedValue(entry.label) === target,
    )

  return normalizeRejuvenatedRelic(option?.id ?? '', selectedRelics)
}

function StaticRelicPicks({
  ariaLabel = 'Recommended relic path',
  picks,
  rejuvenatedRelic,
}: StaticRelicPicksProps) {
  const [selectedRelicDetails, setSelectedRelicDetails] =
    useState<SelectedRelicDetails | null>(null)
  const selectedRelics = resolveRelicSelections(picks)
  const selectedRejuvenatedRelic = resolveRejuvenatedRelic(
    rejuvenatedRelic,
    selectedRelics,
  )
  const rejuvenatedTier = getRejuvenatedRelicTier(selectedRelics)
  const gridItems: StaticPickGridItem[] = RELIC_TIERS.flatMap((tier) => {
    const option = tier.options.find(
      (entry) => entry.id === selectedRelics[tier.tier],
    )
    if (!option) return []

    const knownRelic = KNOWN_RELICS.get(option.label)
    const isRejuvenated = option.label === REJUVENATED_RELIC_NAME

    return [
      {
        ariaLabel: `Tier ${tier.tier}, ${option.label}, selected`,
        backgroundColor: '#141210',
        fallback: option.id.slice(-1).toUpperCase(),
        id: option.id,
        image: option.icon,
        label: option.label,
        onViewDetails: knownRelic
          ? () =>
              setSelectedRelicDetails({
                relic: knownRelic,
                tier: tier.tier,
              })
          : undefined,
        selectionColor: isRejuvenated ? REJUVENATED_COLOR : undefined,
      },
    ]
  })

  const rejuvenatedOption = RELIC_TIERS.flatMap((tier) =>
    tier.options.map((option) => ({ option, tier: tier.tier })),
  ).find(({ option }) => option.id === selectedRejuvenatedRelic)
  if (rejuvenatedOption) {
    const knownRelic = KNOWN_RELICS.get(rejuvenatedOption.option.label)
    gridItems.push({
      ariaLabel: `${rejuvenatedOption.option.label}, selected as the Rejuvenated bonus relic`,
      backgroundColor: REJUVENATED_COLOR,
      fallback: rejuvenatedOption.option.id.slice(-1).toUpperCase(),
      id: `rejuvenated-${rejuvenatedOption.option.id}`,
      image: rejuvenatedOption.option.icon,
      label: `Bonus: ${rejuvenatedOption.option.label}`,
      onViewDetails: knownRelic
        ? () =>
            setSelectedRelicDetails({
              relic: knownRelic,
              tier: rejuvenatedOption.tier,
            })
        : undefined,
      selectionColor: REJUVENATED_COLOR,
    })
  }

  return (
    <section aria-label={ariaLabel} className="select-none">
      <StaticPickGrid ariaLabel={`${ariaLabel} picks`} items={gridItems} />

      {rejuvenatedTier && !selectedRejuvenatedRelic && (
        <p className="mt-3 text-sm text-muted-foreground">
          This path includes Rejuvenated but does not specify its paired relic.
        </p>
      )}

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

export { StaticRelicPicks }
export type { StaticRelicPicksProps }
