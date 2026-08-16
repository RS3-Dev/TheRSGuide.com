import { RotateCcw } from 'lucide-react'
import { useState } from 'react'

import type { BlessingItem } from '@/components/mdx/blessing-display'
import blessingData from '@/data/leagues-ii/blessings.json'
import {
  BLESSING_TIERS,
  canDeriveGodBlessing,
  getBlessingForTier,
  getResolvedBlessingCount,
  type BlessingId,
  type BlessingSelections,
  type BlessingTier,
  type SelectableBlessingTier,
} from '@/lib/picks-state'
import { LEAGUE_OPTIONS } from '../../../../shared/league-options'
import { PickProgressBar } from './PickProgressBar'
import { PickerSpinButton, type PickerSpinAction } from './PickerSpinButton'
import { PickerBlessingDetailsDrawer } from './PickerBlessingDetailsDrawer'
import { TierOptionMatrix, type TierOptionMatrixRow } from './TierOptionMatrix'

const BLESSING_PATHS = LEAGUE_OPTIONS.blessings
const KNOWN_BLESSINGS = new Map(
  blessingData.Blessings.map((blessing) => [
    `${blessing.tier}:${blessing.path.toLowerCase()}`,
    blessing,
  ]),
)

type BlessingSelectorProps = {
  blockedBlessingKeys?: ReadonlySet<string>
  onChange: (blessings: BlessingSelections) => void
  onBlockedBlessingToggle?: (
    tier: SelectableBlessingTier,
    blessingId: BlessingId,
  ) => void
  selectedBlessings: BlessingSelections
  spinAction?: PickerSpinAction
}

function isGodTier(tier: BlessingTier): tier is 4 | 8 {
  return tier === 4 || tier === 8
}

export function BlessingSelector({
  blockedBlessingKeys,
  onChange,
  onBlockedBlessingToggle,
  selectedBlessings,
  spinAction,
}: BlessingSelectorProps) {
  const [selectedBlessingDetails, setSelectedBlessingDetails] =
    useState<BlessingItem | null>(null)
  const resolvedCount = getResolvedBlessingCount(selectedBlessings)
  const selectedCount = Object.keys(selectedBlessings).length

  function toggleBlessing(
    tier: SelectableBlessingTier,
    blessingId: BlessingId,
  ) {
    const nextSelections = { ...selectedBlessings }
    if (nextSelections[tier] === blessingId) {
      delete nextSelections[tier]
    } else {
      nextSelections[tier] = blessingId
    }
    onChange(nextSelections)
  }

  const matrixTiers = BLESSING_TIERS.map((tier) => ({
    isSpecial: isGodTier(tier),
    tier,
  }))
  const matrixRows: TierOptionMatrixRow[] = BLESSING_PATHS.map((path) => ({
    id: path.id,
    cells: BLESSING_TIERS.map((tier) => {
      const godTier = isGodTier(tier)
      const knownBlessing = KNOWN_BLESSINGS.get(
        `${tier}:${path.path.toLowerCase()}`,
      )
      const resolvedBlessing = getBlessingForTier(selectedBlessings, tier)
      const isSelected = resolvedBlessing === path.id
      const backgroundColor = isSelected ? path.color : path.darkColor
      const optionKey = `${tier}-${path.id}`

      if (godTier) {
        const precedingTiers = tier === 4 ? 'Tiers 1–3' : 'Tiers 5–7'
        const label = knownBlessing?.name ?? `${path.path} God Blessing`
        const isUnavailable = Boolean(
          blockedBlessingKeys &&
            !canDeriveGodBlessing(
              path.id as BlessingId,
              tier,
              (precedingTier, blessingId) =>
                !blockedBlessingKeys.has(`${precedingTier}-${blessingId}`),
            ),
        )
        return {
          ariaLabel: `Tier ${tier}, ${label}${isSelected ? ', unlocked' : ''}`,
          backgroundColor,
          description: isUnavailable
            ? `${label} cannot be derived from the unblocked choices in ${precedingTiers}.`
            : isSelected
              ? (knownBlessing?.tagline ?? `Derived from ${precedingTiers}.`)
              : `Choose all Blessings in ${precedingTiers} to reveal the derived God Tier.`,
          fallback: path.shortLabel,
          id: `${tier}-${path.id}`,
          image: knownBlessing?.image,
          isBlocked: isUnavailable,
          isSelected,
          label: `Tier ${tier} · ${label}`,
          onViewDetails: knownBlessing
            ? () => setSelectedBlessingDetails(knownBlessing)
            : undefined,
          readOnly: true,
          statusLabel: label,
        }
      }

      const label = knownBlessing?.name ?? path.label
      const description =
        knownBlessing?.tagline ?? `${path.path} path blessing not yet revealed.`

      return {
        ariaLabel: `Tier ${tier}, ${label}: ${description}`,
        backgroundColor,
        description,
        fallback: path.shortLabel,
        id: `${tier}-${path.id}`,
        image: knownBlessing?.image,
        isBlocked: blockedBlessingKeys?.has(optionKey),
        isSelected,
        label: `Tier ${tier} · ${label}`,
        onViewDetails: knownBlessing
          ? () => setSelectedBlessingDetails(knownBlessing)
          : undefined,
        onSelect: () =>
          toggleBlessing(tier as SelectableBlessingTier, path.id as BlessingId),
        onBlockToggle: onBlockedBlessingToggle
          ? () =>
              onBlockedBlessingToggle(
                tier as SelectableBlessingTier,
                path.id as BlessingId,
              )
          : undefined,
        statusLabel: label,
      }
    }),
  }))

  return (
    <section className="select-none">
      <div className="mb-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h2
            className={`mr-auto font-display font-semibold text-foreground ${
              spinAction ? 'text-xl sm:text-2xl' : 'text-2xl'
            }`}
          >
            2. Choose your blessings
          </h2>
          {spinAction && <PickerSpinButton {...spinAction} />}
          <button
            aria-label="Reset blessing tree"
            className="flex size-10 shrink-0 items-center justify-center rounded-md border border-primary/50 text-primary transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:hover:bg-transparent"
            disabled={selectedCount === 0}
            onClick={() => onChange({})}
            title="Reset blessing tree"
            type="button"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
        <PickProgressBar
          className="mt-3"
          label={`${resolvedCount} of 8 blessing tiers resolved`}
          max={8}
          value={resolvedCount}
        />
      </div>

      <TierOptionMatrix
        ariaLabel="Blessing options by tier"
        className="blessing-tree-scroll"
        rows={matrixRows}
        tiers={matrixTiers}
        variant="blessing"
      />

      <p className="border-x border-b bg-card/50 px-4 py-3 text-xs leading-5 text-muted-foreground">
        God Tier rule: 2+ Chaos → Chaos · 2+ Balance or one of each → Balance ·
        2+ Order → Order
      </p>

      <PickerBlessingDetailsDrawer
        blessing={selectedBlessingDetails}
        onOpenChange={(open) => {
          if (!open) setSelectedBlessingDetails(null)
        }}
      />
    </section>
  )
}
