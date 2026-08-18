import {
  GUARANTEED_REGION_IDS,
  OPTIONAL_REGION_PICK_COUNT,
  RELIC_TIERS,
  SELECTABLE_BLESSING_TIERS,
  isBlessingId,
  normalizeRejuvenatedRelic,
  type BlessingSelections,
} from '@/lib/picks-state'
import { functionalStorageAllowed } from '@/lib/privacy-preferences'
import {
  LEAGUE_OPTIONS,
  normalizeLeagueRegionIds,
} from '../../../shared/league-options'
import { getBlessingBlockKey } from './randomizer-utils'

export const RANDOMIZER_STORAGE_KEY = 'rs3-leagues-randomizer-state-v1'

export type RandomizerState = {
  blockedBlessingKeys: Set<string>
  blockedRegionIds: Set<string>
  blockedRelicIds: Set<string>
  selectedBlessings: BlessingSelections
  selectedRegionIds: string[]
  selectedRejuvenatedRelic: string
  selectedRelics: Record<number, string>
}

const RELIC_TIER_BY_ID = new Map(
  RELIC_TIERS.flatMap(({ options, tier }) =>
    options.map(({ id }) => [id, tier] as const),
  ),
)
const OPTIONAL_REGION_IDS = new Set(
  LEAGUE_OPTIONS.regions
    .map(({ id }) => id)
    .filter((id) => !GUARANTEED_REGION_IDS.includes(id)),
)
const BLESSING_BLOCK_KEYS = new Set(
  SELECTABLE_BLESSING_TIERS.flatMap((tier) =>
    LEAGUE_OPTIONS.blessings.map(({ id }) => getBlessingBlockKey(tier, id)),
  ),
)

export function createDefaultRandomizerState(): RandomizerState {
  return {
    blockedBlessingKeys: new Set(),
    blockedRegionIds: new Set(),
    blockedRelicIds: new Set(),
    selectedBlessings: {},
    selectedRegionIds: [...GUARANTEED_REGION_IDS],
    selectedRejuvenatedRelic: '',
    selectedRelics: {},
  }
}

function validStringSet(value: unknown, validValues: ReadonlySet<string>) {
  if (!Array.isArray(value)) return new Set<string>()
  return new Set(
    value.filter(
      (item): item is string =>
        typeof item === 'string' && validValues.has(item),
    ),
  )
}

export function parseRandomizerState(value: unknown): RandomizerState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return createDefaultRandomizerState()
  }

  const stored = value as Record<string, unknown>
  const blockedRelicIds = validStringSet(
    stored.blockedRelicIds,
    new Set(RELIC_TIER_BY_ID.keys()),
  )
  const blockedBlessingKeys = validStringSet(
    stored.blockedBlessingKeys,
    BLESSING_BLOCK_KEYS,
  )
  const blockedRegionIds = validStringSet(
    stored.blockedRegionIds,
    OPTIONAL_REGION_IDS,
  )

  const selectedRelics: Record<number, string> = {}
  if (
    stored.selectedRelics &&
    typeof stored.selectedRelics === 'object' &&
    !Array.isArray(stored.selectedRelics)
  ) {
    Object.entries(stored.selectedRelics).forEach(([tierValue, relicValue]) => {
      const tier = Number(tierValue)
      if (
        Number.isInteger(tier) &&
        typeof relicValue === 'string' &&
        RELIC_TIER_BY_ID.get(relicValue) === tier &&
        !blockedRelicIds.has(relicValue)
      ) {
        selectedRelics[tier] = relicValue
      }
    })
  }

  const selectedBlessings: BlessingSelections = {}
  if (
    stored.selectedBlessings &&
    typeof stored.selectedBlessings === 'object' &&
    !Array.isArray(stored.selectedBlessings)
  ) {
    SELECTABLE_BLESSING_TIERS.forEach((tier) => {
      const blessing = (stored.selectedBlessings as Record<string, unknown>)[
        tier
      ]
      if (
        isBlessingId(blessing) &&
        !blockedBlessingKeys.has(getBlessingBlockKey(tier, blessing))
      ) {
        selectedBlessings[tier] = blessing
      }
    })
  }

  const optionalRegionIds = Array.isArray(stored.selectedRegionIds)
    ? normalizeLeagueRegionIds(
        stored.selectedRegionIds.filter(
          (regionId): regionId is string => typeof regionId === 'string',
        ),
      )
        .filter(
          (regionId) =>
            OPTIONAL_REGION_IDS.has(regionId) &&
            !blockedRegionIds.has(regionId),
        )
        .slice(0, OPTIONAL_REGION_PICK_COUNT)
    : []

  const selectedRejuvenatedRelic = normalizeRejuvenatedRelic(
    stored.selectedRejuvenatedRelic,
    selectedRelics,
  )

  return {
    blockedBlessingKeys,
    blockedRegionIds,
    blockedRelicIds,
    selectedBlessings,
    selectedRegionIds: [...GUARANTEED_REGION_IDS, ...optionalRegionIds],
    selectedRejuvenatedRelic: blockedRelicIds.has(selectedRejuvenatedRelic)
      ? ''
      : selectedRejuvenatedRelic,
    selectedRelics,
  }
}

export function loadRandomizerState(): RandomizerState {
  try {
    if (typeof window === 'undefined' || !functionalStorageAllowed()) {
      return createDefaultRandomizerState()
    }
    const storedValue = window.localStorage.getItem(RANDOMIZER_STORAGE_KEY)
    return storedValue
      ? parseRandomizerState(JSON.parse(storedValue))
      : createDefaultRandomizerState()
  } catch {
    return createDefaultRandomizerState()
  }
}

export function saveRandomizerState(state: RandomizerState) {
  try {
    if (typeof window === 'undefined' || !functionalStorageAllowed()) return
    window.localStorage.setItem(
      RANDOMIZER_STORAGE_KEY,
      JSON.stringify({
        ...state,
        blockedBlessingKeys: [...state.blockedBlessingKeys],
        blockedRegionIds: [...state.blockedRegionIds],
        blockedRelicIds: [...state.blockedRelicIds],
      }),
    )
  } catch {
    // The randomizer remains usable when storage is unavailable or full.
  }
}
