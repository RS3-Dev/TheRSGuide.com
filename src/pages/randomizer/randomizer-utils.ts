import {
  GUARANTEED_REGION_IDS,
  OPTIONAL_REGION_PICK_COUNT,
  RELIC_TIERS,
  REJUVENATED_RELIC_NAME,
  SELECTABLE_BLESSING_TIERS,
  getRejuvenatedRelicTier,
  type BlessingId,
  type BlessingSelections,
  type SelectableBlessingTier,
} from '@/lib/picks-state'
import { LEAGUE_OPTIONS } from '../../../shared/league-options'

export type RandomizedRelicSelection = {
  rejuvenatedRelic: string
  relics: Record<number, string>
}

export type RandomIndex = (length: number) => number

const UINT32_RANGE = 0x1_0000_0000
const NO_BLOCKED_OPTIONS = new Set<string>()

export const getBlessingBlockKey = (
  tier: SelectableBlessingTier,
  blessingId: string,
) => `${tier}-${blessingId}`

export function createUniformRandomIndex(
  readUint32: () => number,
): RandomIndex {
  return (length) => {
    if (!Number.isSafeInteger(length) || length < 1 || length > UINT32_RANGE) {
      throw new Error(`Invalid random choice length: ${length}`)
    }
    if (length === 1) return 0

    const unbiasedUpperBound = UINT32_RANGE - (UINT32_RANGE % length)
    let randomValue: number
    do {
      randomValue = readUint32()
    } while (randomValue >= unbiasedUpperBound)

    return randomValue % length
  }
}

export const secureRandomIndex = createUniformRandomIndex(() => {
  const randomValue = new Uint32Array(1)
  globalThis.crypto.getRandomValues(randomValue)
  return randomValue[0]!
})

function choose<T>(options: readonly T[], randomIndex: RandomIndex) {
  if (!options.length) throw new Error('Cannot choose from an empty option set')
  const index = randomIndex(options.length)
  if (!Number.isInteger(index) || index < 0 || index >= options.length) {
    throw new Error(`Random index ${index} is outside the option set`)
  }
  return options[index]!
}

function chooseDifferent<T extends { id: string }>(
  options: readonly T[],
  currentId: string | undefined,
  randomIndex: RandomIndex,
) {
  const differentOptions = options.filter(({ id }) => id !== currentId)
  return choose(
    differentOptions.length ? differentOptions : options,
    randomIndex,
  )
}

export function getNextRelicTier(
  selectedRelics: Readonly<Record<number, string>>,
) {
  return RELIC_TIERS.find(({ tier }) => !selectedRelics[tier])?.tier
}

export function createRandomizedRelicForTier(
  tier: number,
  currentId?: string,
  randomIndex: RandomIndex = secureRandomIndex,
  blockedRelicIds: ReadonlySet<string> = NO_BLOCKED_OPTIONS,
) {
  const options = RELIC_TIERS.find(
    (entry) => entry.tier === tier,
  )?.options.filter(({ id }) => !blockedRelicIds.has(id))
  if (!options) throw new Error(`Unknown relic tier: ${tier}`)
  return chooseDifferent(options, currentId, randomIndex).id
}

export function hasAvailableRelicForTier(
  tier: number,
  blockedRelicIds: ReadonlySet<string>,
) {
  return Boolean(
    RELIC_TIERS.find((entry) => entry.tier === tier)?.options.some(
      ({ id }) => !blockedRelicIds.has(id),
    ),
  )
}

export function createRandomizedRejuvenatedRelic(
  selectedRelics: Readonly<Record<number, string>>,
  currentId?: string,
  randomIndex: RandomIndex = secureRandomIndex,
  blockedRelicIds: ReadonlySet<string> = NO_BLOCKED_OPTIONS,
) {
  const rejuvenatedTier = RELIC_TIERS.find(({ options, tier }) =>
    options.some(
      ({ id, label }) =>
        id === selectedRelics[tier] && label === REJUVENATED_RELIC_NAME,
    ),
  )?.tier

  if (!rejuvenatedTier) return ''

  const selectedIds = Object.values(selectedRelics)
  const candidates = RELIC_TIERS.filter(
    ({ tier }) => tier < rejuvenatedTier,
  ).flatMap(({ options }) =>
    options.filter(
      ({ id }) => !selectedIds.includes(id) && !blockedRelicIds.has(id),
    ),
  )

  return candidates.length
    ? chooseDifferent(candidates, currentId, randomIndex).id
    : ''
}

export function resolveRandomizedRejuvenatedRelic(
  selectedRelics: Readonly<Record<number, string>>,
  currentRejuvenatedRelic: string,
  randomIndex: RandomIndex = secureRandomIndex,
  blockedRelicIds: ReadonlySet<string> = NO_BLOCKED_OPTIONS,
) {
  if (getRejuvenatedRelicTier(selectedRelics) === undefined) return ''
  return (
    currentRejuvenatedRelic ||
    createRandomizedRejuvenatedRelic(
      selectedRelics,
      undefined,
      randomIndex,
      blockedRelicIds,
    )
  )
}

export function getNextBlessingTier(
  selectedBlessings: Readonly<BlessingSelections>,
) {
  return SELECTABLE_BLESSING_TIERS.find((tier) => !selectedBlessings[tier])
}

export function createRandomizedBlessingForTier(
  tier: SelectableBlessingTier,
  currentId?: BlessingId,
  randomIndex: RandomIndex = secureRandomIndex,
  blockedBlessingKeys: ReadonlySet<string> = NO_BLOCKED_OPTIONS,
) {
  if (!SELECTABLE_BLESSING_TIERS.includes(tier)) {
    throw new Error(`Unknown selectable blessing tier: ${tier}`)
  }
  return chooseDifferent(
    LEAGUE_OPTIONS.blessings.filter(
      ({ id }) => !blockedBlessingKeys.has(getBlessingBlockKey(tier, id)),
    ),
    currentId,
    randomIndex,
  ).id as BlessingId
}

export function hasAvailableBlessingForTier(
  tier: SelectableBlessingTier,
  blockedBlessingKeys: ReadonlySet<string>,
) {
  return LEAGUE_OPTIONS.blessings.some(
    ({ id }) => !blockedBlessingKeys.has(getBlessingBlockKey(tier, id)),
  )
}

export function createRandomizedNextRegion(
  currentRegionIds: readonly string[],
  randomIndex: RandomIndex = secureRandomIndex,
  blockedRegionIds: ReadonlySet<string> = NO_BLOCKED_OPTIONS,
) {
  const optionalRegionIds = currentRegionIds
    .filter((regionId) => !GUARANTEED_REGION_IDS.includes(regionId))
    .slice(0, OPTIONAL_REGION_PICK_COUNT)

  if (optionalRegionIds.length === OPTIONAL_REGION_PICK_COUNT) {
    return [...GUARANTEED_REGION_IDS, ...optionalRegionIds]
  }

  const candidates = LEAGUE_OPTIONS.regions.filter(
    ({ id }) =>
      !GUARANTEED_REGION_IDS.includes(id) &&
      !optionalRegionIds.includes(id) &&
      !blockedRegionIds.has(id),
  )

  return [
    ...GUARANTEED_REGION_IDS,
    ...optionalRegionIds,
    choose(candidates, randomIndex).id,
  ]
}

export function hasAvailableNextRegion(
  currentRegionIds: readonly string[],
  blockedRegionIds: ReadonlySet<string>,
) {
  const optionalRegionIds = currentRegionIds.filter(
    (regionId) => !GUARANTEED_REGION_IDS.includes(regionId),
  )
  if (optionalRegionIds.length >= OPTIONAL_REGION_PICK_COUNT) return false

  return LEAGUE_OPTIONS.regions.some(
    ({ id }) =>
      !GUARANTEED_REGION_IDS.includes(id) &&
      !optionalRegionIds.includes(id) &&
      !blockedRegionIds.has(id),
  )
}

export function createRandomizedRelics(
  currentRelics: Readonly<Record<number, string>> = {},
  randomIndex: RandomIndex = secureRandomIndex,
): RandomizedRelicSelection {
  const relics = Object.fromEntries(
    RELIC_TIERS.map(({ options, tier }) => [
      tier,
      chooseDifferent(options, currentRelics[tier], randomIndex).id,
    ]),
  )

  const rejuvenatedTier = RELIC_TIERS.find(({ options, tier }) =>
    options.some(
      ({ id, label }) =>
        id === relics[tier] && label === REJUVENATED_RELIC_NAME,
    ),
  )?.tier

  const rejuvenatedCandidates = rejuvenatedTier
    ? RELIC_TIERS.filter(({ tier }) => tier < rejuvenatedTier).flatMap(
        ({ options }) =>
          options.filter(({ id }) => !Object.values(relics).includes(id)),
      )
    : []

  return {
    rejuvenatedRelic: rejuvenatedCandidates.length
      ? choose(rejuvenatedCandidates, randomIndex).id
      : '',
    relics,
  }
}

export function createRandomizedBlessings(
  currentBlessings: Readonly<BlessingSelections> = {},
  randomIndex: RandomIndex = secureRandomIndex,
): BlessingSelections {
  return Object.fromEntries(
    SELECTABLE_BLESSING_TIERS.map((tier) => [
      tier,
      chooseDifferent(
        LEAGUE_OPTIONS.blessings,
        currentBlessings[tier],
        randomIndex,
      ).id as BlessingId,
    ]),
  ) as BlessingSelections
}

export function createRandomizedRegions(
  randomIndex: RandomIndex = secureRandomIndex,
) {
  const availableRegions = LEAGUE_OPTIONS.regions.filter(
    ({ id }) => !GUARANTEED_REGION_IDS.includes(id),
  )
  const selectedRegionIds: string[] = []

  while (
    selectedRegionIds.length < OPTIONAL_REGION_PICK_COUNT &&
    selectedRegionIds.length < availableRegions.length
  ) {
    const remainingRegions = availableRegions.filter(
      ({ id }) => !selectedRegionIds.includes(id),
    )
    selectedRegionIds.push(choose(remainingRegions, randomIndex).id)
  }

  return [...GUARANTEED_REGION_IDS, ...selectedRegionIds]
}
