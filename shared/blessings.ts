export const BLESSING_IDS = ['a', 'b', 'c'] as const
export type BlessingId = (typeof BLESSING_IDS)[number]

export const BLESSING_TIERS = [1, 2, 3, 4, 5, 6, 7, 8] as const
export const SELECTABLE_BLESSING_TIERS = [1, 2, 3, 5, 6, 7] as const
export const GOD_BLESSING_TIERS = [4, 8] as const
export const BLESSING_SELECTION_COUNT = SELECTABLE_BLESSING_TIERS.length

export type BlessingTier = (typeof BLESSING_TIERS)[number]
export type SelectableBlessingTier = (typeof SELECTABLE_BLESSING_TIERS)[number]
export type GodBlessingTier = (typeof GOD_BLESSING_TIERS)[number]
export type BlessingSelections = Partial<
  Record<SelectableBlessingTier, BlessingId>
>

const PRECEDING_TIER_BY_GOD_TIER = {
  4: [1, 2, 3],
  8: [5, 6, 7],
} as const satisfies Record<
  GodBlessingTier,
  readonly SelectableBlessingTier[]
>

export function isBlessingId(value: unknown): value is BlessingId {
  return (
    typeof value === 'string' &&
    BLESSING_IDS.includes(value as BlessingId)
  )
}

export function deriveGodBlessing(
  selections: BlessingSelections,
  tier: GodBlessingTier,
): BlessingId | '' {
  const paths = PRECEDING_TIER_BY_GOD_TIER[tier].map(
    (precedingTier) => selections[precedingTier],
  )
  if (paths.some((path) => !path)) return ''

  const counts = {
    a: paths.filter((path) => path === 'a').length,
    b: paths.filter((path) => path === 'b').length,
    c: paths.filter((path) => path === 'c').length,
  }

  if (counts.c >= 2) return 'c'
  if (counts.b >= 2 || (counts.a === 1 && counts.b === 1 && counts.c === 1)) {
    return 'b'
  }
  return 'a'
}

export function canDeriveGodBlessing(
  target: BlessingId,
  tier: GodBlessingTier,
  isAvailable: (
    tier: SelectableBlessingTier,
    blessing: BlessingId,
  ) => boolean,
) {
  const precedingTiers = PRECEDING_TIER_BY_GOD_TIER[tier]

  function visit(
    index: number,
    selections: BlessingSelections,
  ): boolean {
    if (index === precedingTiers.length) {
      return deriveGodBlessing(selections, tier) === target
    }

    const precedingTier = precedingTiers[index]!
    return BLESSING_IDS.some(
      (blessing) =>
        isAvailable(precedingTier, blessing) &&
        visit(index + 1, {
          ...selections,
          [precedingTier]: blessing,
        }),
    )
  }

  return visit(0, {})
}

export function getBlessingForTier(
  selections: BlessingSelections,
  tier: BlessingTier,
): BlessingId | '' {
  if (tier === 4 || tier === 8) return deriveGodBlessing(selections, tier)
  return selections[tier] ?? ''
}

export function getResolvedBlessingCount(selections: BlessingSelections) {
  return BLESSING_TIERS.filter((tier) =>
    Boolean(getBlessingForTier(selections, tier)),
  ).length
}

export function isBlessingTreeComplete(selections: BlessingSelections) {
  return SELECTABLE_BLESSING_TIERS.every((tier) =>
    Boolean(selections[tier]),
  )
}

export function blessingSelectionsToArray(
  selections: BlessingSelections,
): BlessingId[] {
  return SELECTABLE_BLESSING_TIERS.flatMap((tier) => {
    const blessing = selections[tier]
    return blessing ? [blessing] : []
  })
}

export function blessingSelectionsFromArray(
  blessings: readonly unknown[],
): BlessingSelections {
  const selections: BlessingSelections = {}
  SELECTABLE_BLESSING_TIERS.forEach((tier, index) => {
    const blessing = blessings[index]
    if (isBlessingId(blessing)) selections[tier] = blessing
  })
  return selections
}

export function createLegacyBlessingSelections(
  blessing: BlessingId,
): BlessingSelections {
  return Object.fromEntries(
    SELECTABLE_BLESSING_TIERS.map((tier) => [tier, blessing]),
  ) as BlessingSelections
}


