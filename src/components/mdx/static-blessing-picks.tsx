'use client'

import { useState } from 'react'

import type { BlessingItem } from '@/components/mdx/blessing-display'
import blessingData from '@/data/leagues-ii/blessings.json'
import {
  BLESSING_TIERS,
  SELECTABLE_BLESSING_TIERS,
  getBlessingForTier,
  isBlessingId,
  type BlessingSelections,
  type BlessingTier,
} from '@/lib/picks-state'
import { PickerBlessingDetailsDrawer } from '@/pages/picks/components/PickerBlessingDetailsDrawer'
import { LEAGUE_OPTIONS } from '../../../shared/league-options'
import {
  StaticPickGrid,
  type StaticPickGridItem,
} from './static-pick-grid'

type StaticBlessingPicksProps = {
  ariaLabel?: string
  picks: Partial<Record<number, string>>
}

const BLESSING_PATHS = LEAGUE_OPTIONS.blessings
const KNOWN_BLESSINGS = new Map(
  blessingData.Blessings.map((blessing) => [
    `${blessing.tier}:${blessing.path.toLowerCase()}`,
    blessing,
  ]),
)

function isGodTier(tier: BlessingTier): tier is 4 | 8 {
  return tier === 4 || tier === 8
}

function resolveBlessingSelections(
  picks: Partial<Record<number, string>>,
): BlessingSelections {
  const selections: BlessingSelections = {}

  SELECTABLE_BLESSING_TIERS.forEach((tier) => {
    const target = picks[tier]?.trim().toLowerCase()
    if (!target) return

    const path = BLESSING_PATHS.find(
      (entry) =>
        entry.id.toLowerCase() === target ||
        entry.path.toLowerCase() === target ||
        entry.label.toLowerCase() === target,
    )
    if (path && isBlessingId(path.id)) selections[tier] = path.id
  })

  return selections
}

function StaticBlessingPicks({
  ariaLabel = 'Recommended blessing path',
  picks,
}: StaticBlessingPicksProps) {
  const [selectedBlessingDetails, setSelectedBlessingDetails] =
    useState<BlessingItem | null>(null)
  const selectedBlessings = resolveBlessingSelections(picks)
  const gridItems: StaticPickGridItem[] = BLESSING_TIERS.flatMap((tier) => {
    const resolvedBlessing = getBlessingForTier(selectedBlessings, tier)
    const path = BLESSING_PATHS.find(
      (entry) => entry.id === resolvedBlessing,
    )
    if (!path) return []

    const knownBlessing = KNOWN_BLESSINGS.get(
      `${tier}:${path.path.toLowerCase()}`,
    )
    const label =
      knownBlessing?.name ??
      (isGodTier(tier) ? `${path.path} God Blessing` : path.label)

    return [{
      ariaLabel: `${isGodTier(tier) ? 'God Tier' : 'Tier'} ${tier}, ${label}, selected`,
      backgroundColor: path.darkColor,
      fallback: path.shortLabel,
      id: `${tier}-${path.id}`,
      image: knownBlessing?.image,
      label,
      onViewDetails: knownBlessing
        ? () => setSelectedBlessingDetails(knownBlessing)
        : undefined,
    }]
  })

  return (
    <section aria-label={ariaLabel} className="select-none">
      <StaticPickGrid ariaLabel={`${ariaLabel} picks`} items={gridItems} />

      <PickerBlessingDetailsDrawer
        blessing={selectedBlessingDetails}
        onOpenChange={(open) => {
          if (!open) setSelectedBlessingDetails(null)
        }}
      />
    </section>
  )
}

export { StaticBlessingPicks }
export type { StaticBlessingPicksProps }
