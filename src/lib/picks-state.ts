import {
  OPTIONAL_REGION_PICK_COUNT,
  type SharedBuild,
} from '../../shared/share-contract'
import {
  SELECTABLE_BLESSING_TIERS,
  blessingSelectionsFromArray,
  createLegacyBlessingSelections,
  isBlessingId,
  type BlessingSelections,
} from '../../shared/blessings'
import {
  LEAGUE_OPTIONS,
  normalizeLeagueRegionIds,
} from '../../shared/league-options'

export {
  OPTIONAL_REGION_PICK_COUNT,
} from '../../shared/share-contract'
export {
  BLESSING_IDS,
  BLESSING_SELECTION_COUNT,
  BLESSING_TIERS,
  GOD_BLESSING_TIERS,
  SELECTABLE_BLESSING_TIERS,
  blessingSelectionsToArray,
  deriveGodBlessing,
  getBlessingForTier,
  getResolvedBlessingCount,
  isBlessingId,
  isBlessingTreeComplete,
  type BlessingId,
  type BlessingSelections,
  type BlessingTier,
  type GodBlessingTier,
  type SelectableBlessingTier,
} from '../../shared/blessings'

export const DEFAULT_REGION_ID = 'misthalin-havenhythe'
export const KARAMJA_REGION_ID = 'karamja'
export const GUARANTEED_REGION_IDS = [DEFAULT_REGION_ID, KARAMJA_REGION_ID]

export const RELIC_TIERS = LEAGUE_OPTIONS.relicTiers.map((tier) => ({
  ...tier,
  optionCount: tier.options.length,
}))
export const PICKS_STORAGE_KEY = 'rs3-leagues-planner-state-v1'
export const REJUVENATED_RELIC_NAME = 'Rejuvenated'

const VALID_RELIC_NAMES = new Set(
  RELIC_TIERS.flatMap(({ options }) => options.map((option) => option.id)),
)
const LEGACY_CONFIRMED_RELIC_ID_ALIASES: Readonly<Record<string, string>> = {
  '1a': '1c',
  '1b': '1a',
  '1c': '1b',
}
const LEGACY_SPECULATIVE_RELIC_ID_ALIASES: Readonly<Record<string, string>> = {
  '4b': '4c',
  '4c': '4b',
  '5a': '5b',
  '5b': '5a',
  '7a': '7b',
  '7b': '7a',
}

function getOptionalRegionIds(regionIds: unknown[]) {
  return normalizeLeagueRegionIds(
    regionIds.filter((regionId): regionId is string => typeof regionId === 'string'),
  )
    .filter((regionId) => !GUARANTEED_REGION_IDS.includes(regionId))
    .slice(0, OPTIONAL_REGION_PICK_COUNT)
}

export type PicksState = {
  buildName: string
  selectedBlessings: BlessingSelections
  selectedRejuvenatedRelic: string
  selectedRegionIds: string[]
  selectedRelics: Record<number, string>
}

export type RegionSelection = {
  color?: string
  id: string
  name: string
}

export function getRejuvenatedRelicTier(
  selectedRelics: Record<number, string>,
) {
  return RELIC_TIERS.find(({ options, tier }) =>
    options.some(
      ({ id, label }) =>
        id === selectedRelics[tier] && label === REJUVENATED_RELIC_NAME,
    ),
  )?.tier
}

export function getRejuvenatedRelicOptions(
  selectedRelics: Record<number, string>,
) {
  const rejuvenatedTier = getRejuvenatedRelicTier(selectedRelics)
  if (!rejuvenatedTier) return []

  return RELIC_TIERS
    .filter(({ tier }) => tier < rejuvenatedTier)
    .flatMap(({ options, tier }) =>
      options.map((option) => ({ ...option, tier })),
    )
}

export function normalizeRejuvenatedRelic(
  relicId: unknown,
  selectedRelics: Record<number, string>,
) {
  if (typeof relicId !== 'string' || Object.values(selectedRelics).includes(relicId)) {
    return ''
  }

  return getRejuvenatedRelicOptions(selectedRelics).some(
    ({ id }) => id === relicId,
  )
    ? relicId
    : ''
}

export function loadPicksState(): PicksState {
  const fallback: PicksState = {
    buildName: '',
    selectedBlessings: {},
    selectedRejuvenatedRelic: '',
    selectedRegionIds: [...GUARANTEED_REGION_IDS],
    selectedRelics: {},
  }

  try {
    const storedValue = window.localStorage.getItem(PICKS_STORAGE_KEY)
    if (!storedValue) return fallback

    const parsed = JSON.parse(storedValue) as Record<string, unknown>
    const selectedRelics: Record<number, string> = {}

    if (
      parsed.selectedRelics &&
      typeof parsed.selectedRelics === 'object' &&
      !Array.isArray(parsed.selectedRelics)
    ) {
      const legacyRelicIdAliases =
        parsed.isSpeculativeRelics === false
          ? LEGACY_CONFIRMED_RELIC_ID_ALIASES
          : parsed.isSpeculativeRelics === true
            ? LEGACY_SPECULATIVE_RELIC_ID_ALIASES
            : undefined
      Object.entries(parsed.selectedRelics).forEach(([tierValue, relicValue]) => {
        const tier = Number(tierValue)
        const normalizedRelicValue =
          typeof relicValue === 'string' && legacyRelicIdAliases
            ? (legacyRelicIdAliases[relicValue] ?? relicValue)
            : relicValue
        if (
          Number.isInteger(tier) &&
          tier >= 1 &&
          tier <= RELIC_TIERS.length &&
          typeof normalizedRelicValue === 'string' &&
          VALID_RELIC_NAMES.has(normalizedRelicValue) &&
          normalizedRelicValue.startsWith(String(tier))
        ) {
          selectedRelics[tier] = normalizedRelicValue
        }
      })
    }

    const optionalRegionIds = Array.isArray(parsed.selectedRegionIds)
      ? getOptionalRegionIds(parsed.selectedRegionIds)
      : []

    const selectedBlessings: BlessingSelections = {}
    if (
      parsed.selectedBlessings &&
      typeof parsed.selectedBlessings === 'object' &&
      !Array.isArray(parsed.selectedBlessings)
    ) {
      SELECTABLE_BLESSING_TIERS.forEach((tier) => {
        const blessing = (
          parsed.selectedBlessings as Record<string, unknown>
        )[tier]
        if (isBlessingId(blessing)) selectedBlessings[tier] = blessing
      })
    } else if (isBlessingId(parsed.selectedBlessing)) {
      Object.assign(
        selectedBlessings,
        createLegacyBlessingSelections(parsed.selectedBlessing),
      )
    }

    return {
      buildName:
        typeof parsed.buildName === 'string' ? parsed.buildName.slice(0, 60) : '',
      selectedBlessings,
      selectedRejuvenatedRelic: normalizeRejuvenatedRelic(
        parsed.selectedRejuvenatedRelic,
        selectedRelics,
      ),
      selectedRegionIds: [...GUARANTEED_REGION_IDS, ...optionalRegionIds],
      selectedRelics,
    }
  } catch {
    return fallback
  }
}

export function savePicksState(state: PicksState) {
  try {
    window.localStorage.setItem(PICKS_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // The picker remains usable when storage is unavailable or full.
  }
}

export function createPicksStateFromSharedBuild(
  build: SharedBuild,
  selectedRejuvenatedRelic: unknown = '',
): PicksState {
  const selectedRelics: Record<number, string> = {}
  build.relics.forEach((relic, index) => {
    const tier = index + 1
    if (VALID_RELIC_NAMES.has(relic) && relic.startsWith(String(tier))) {
      selectedRelics[tier] = relic
    }
  })

  const optionalRegionIds = getOptionalRegionIds(build.regions)

  return {
    buildName: build.buildName.slice(0, 60),
    selectedBlessings: blessingSelectionsFromArray(build.blessings),
    selectedRejuvenatedRelic: normalizeRejuvenatedRelic(
      selectedRejuvenatedRelic || build.rejuvenatedRelic,
      selectedRelics,
    ),
    selectedRegionIds: [...GUARANTEED_REGION_IDS, ...optionalRegionIds],
    selectedRelics,
  }
}

export function getInitialRegionSelections(regionIds: string[]): RegionSelection[] {
  const regionById = new Map(
    LEAGUE_OPTIONS.regions.map((region) => [region.id, region]),
  )

  return regionIds.map((id) => {
    const region = regionById.get(id)
    return {
      color: region?.color,
      id,
      name: region?.label ?? id,
    }
  })
}


