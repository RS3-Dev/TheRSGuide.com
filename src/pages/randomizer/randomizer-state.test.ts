// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest'

import {
  GUARANTEED_REGION_IDS,
  RELIC_TIERS,
  SELECTABLE_BLESSING_TIERS,
  type BlessingId,
} from '@/lib/picks-state'
import { LEAGUE_OPTIONS } from '../../../shared/league-options'
import { getBlessingBlockKey } from './randomizer-utils'
import {
  RANDOMIZER_STORAGE_KEY,
  loadRandomizerState,
  parseRandomizerState,
  saveRandomizerState,
} from './randomizer-state'

beforeEach(() => {
  window.localStorage.clear()
  document.head.innerHTML =
    '<meta name="rs-guide-privacy-region" content="standard">'
})

describe('randomizer state storage', () => {
  it('round-trips picks and blocklists through localStorage', () => {
    const relicId = RELIC_TIERS[0]!.options[0]!.id
    const blockedRelicId = RELIC_TIERS[1]!.options[0]!.id
    const blessingTier = SELECTABLE_BLESSING_TIERS[0]!
    const blessingId = LEAGUE_OPTIONS.blessings[0]!.id as BlessingId
    const blockedBlessingKey = getBlessingBlockKey(
      SELECTABLE_BLESSING_TIERS[1]!,
      LEAGUE_OPTIONS.blessings[1]!.id,
    )
    const selectedRegionId = LEAGUE_OPTIONS.regions.find(
      ({ id }) => !GUARANTEED_REGION_IDS.includes(id),
    )!.id
    const blockedRegionId = LEAGUE_OPTIONS.regions.find(
      ({ id }) =>
        !GUARANTEED_REGION_IDS.includes(id) && id !== selectedRegionId,
    )!.id

    saveRandomizerState({
      blockedBlessingKeys: new Set([blockedBlessingKey]),
      blockedRegionIds: new Set([blockedRegionId]),
      blockedRelicIds: new Set([blockedRelicId]),
      selectedBlessings: { [blessingTier]: blessingId },
      selectedRegionIds: [...GUARANTEED_REGION_IDS, selectedRegionId],
      selectedRejuvenatedRelic: '',
      selectedRelics: { [RELIC_TIERS[0]!.tier]: relicId },
    })

    const serialized = JSON.parse(
      window.localStorage.getItem(RANDOMIZER_STORAGE_KEY)!,
    )
    expect(serialized.blockedRelicIds).toEqual([blockedRelicId])

    const restored = loadRandomizerState()
    expect(restored).toMatchObject({
      selectedBlessings: { [blessingTier]: blessingId },
      selectedRegionIds: [...GUARANTEED_REGION_IDS, selectedRegionId],
      selectedRelics: { [RELIC_TIERS[0]!.tier]: relicId },
    })
    expect(restored.blockedBlessingKeys).toEqual(
      new Set([blockedBlessingKey]),
    )
    expect(restored.blockedRegionIds).toEqual(new Set([blockedRegionId]))
    expect(restored.blockedRelicIds).toEqual(new Set([blockedRelicId]))
  })

  it('drops invalid and contradictory stored values', () => {
    const relicTier = RELIC_TIERS[0]!
    const blockedRelicId = relicTier.options[0]!.id
    const blessingTier = SELECTABLE_BLESSING_TIERS[0]!
    const blockedBlessingId = LEAGUE_OPTIONS.blessings[0]!.id
    const blockedBlessingKey = getBlessingBlockKey(
      blessingTier,
      blockedBlessingId,
    )
    const blockedRegionId = LEAGUE_OPTIONS.regions.find(
      ({ id }) => !GUARANTEED_REGION_IDS.includes(id),
    )!.id

    const restored = parseRandomizerState({
      blockedBlessingKeys: [blockedBlessingKey, 'not-a-blessing'],
      blockedRegionIds: [blockedRegionId, 'not-a-region'],
      blockedRelicIds: [blockedRelicId, 'not-a-relic'],
      selectedBlessings: {
        [blessingTier]: blockedBlessingId,
        999: 'a',
      },
      selectedRegionIds: [
        ...GUARANTEED_REGION_IDS,
        blockedRegionId,
        'not-a-region',
      ],
      selectedRejuvenatedRelic: 'not-a-relic',
      selectedRelics: {
        [relicTier.tier]: blockedRelicId,
        999: 'not-a-relic',
      },
    })

    expect(restored.blockedBlessingKeys).toEqual(
      new Set([blockedBlessingKey]),
    )
    expect(restored.blockedRegionIds).toEqual(new Set([blockedRegionId]))
    expect(restored.blockedRelicIds).toEqual(new Set([blockedRelicId]))
    expect(restored.selectedBlessings).toEqual({})
    expect(restored.selectedRegionIds).toEqual(GUARANTEED_REGION_IDS)
    expect(restored.selectedRejuvenatedRelic).toBe('')
    expect(restored.selectedRelics).toEqual({})
  })

  it('does not save when functional storage is disabled', () => {
    document.head.innerHTML = ''

    saveRandomizerState(parseRandomizerState({}))

    expect(window.localStorage.getItem(RANDOMIZER_STORAGE_KEY)).toBeNull()
  })
})
