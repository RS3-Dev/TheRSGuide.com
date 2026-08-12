import { describe, expect, it } from 'vitest'

import {
  GUARANTEED_REGION_IDS,
  OPTIONAL_REGION_PICK_COUNT,
  RELIC_TIERS,
  REJUVENATED_RELIC_NAME,
  SELECTABLE_BLESSING_TIERS,
} from '@/lib/picks-state'
import {
  createRandomizedBlessingForTier,
  createRandomizedBlessings,
  createRandomizedNextRegion,
  createRandomizedRejuvenatedRelic,
  createRandomizedRelicForTier,
  createRandomizedRegions,
  createRandomizedRelics,
  createUniformRandomIndex,
  getNextBlessingTier,
  getNextRelicTier,
  resolveRandomizedRejuvenatedRelic,
} from './randomizer-utils'

const firstIndex = () => 0

describe('Leagues randomizer', () => {
  it('targets the first unresolved relic and blessing tier', () => {
    expect(getNextRelicTier({ 1: '1a', 2: '2a', 3: '3a' })).toBe(4)
    expect(getNextBlessingTier({ 1: 'a', 2: 'b', 3: 'c' })).toBe(5)
  })

  it('spins only the requested relic or blessing tier', () => {
    const relicId = createRandomizedRelicForTier(4, undefined, firstIndex)
    const blessingId = createRandomizedBlessingForTier(5, undefined, firstIndex)

    expect(relicId.startsWith('4')).toBe(true)
    expect(['a', 'b', 'c']).toContain(blessingId)
  })

  it('adds exactly one unique optional region per spin', () => {
    const firstSpin = createRandomizedNextRegion(
      GUARANTEED_REGION_IDS,
      firstIndex,
    )
    const secondSpin = createRandomizedNextRegion(firstSpin, firstIndex)

    expect(firstSpin).toHaveLength(GUARANTEED_REGION_IDS.length + 1)
    expect(secondSpin).toHaveLength(GUARANTEED_REGION_IDS.length + 2)
    expect(new Set(secondSpin).size).toBe(secondSpin.length)
  })

  it('keeps an existing Rejuvenated pick locked during later tier spins', () => {
    const rejuvenatedTier = RELIC_TIERS.find(({ options }) =>
      options.some(({ label }) => label === REJUVENATED_RELIC_NAME),
    )!
    const rejuvenated = rejuvenatedTier.options.find(
      ({ label }) => label === REJUVENATED_RELIC_NAME,
    )!
    const relics = Object.fromEntries(
      RELIC_TIERS.filter(({ tier }) => tier <= rejuvenatedTier.tier).map(
        ({ options, tier }) => [tier, options[0]!.id],
      ),
    )
    relics[rejuvenatedTier.tier] = rejuvenated.id
    const initialPick = createRandomizedRejuvenatedRelic(
      relics,
      undefined,
      firstIndex,
    )

    expect(initialPick).toBeTruthy()
    expect(
      createRandomizedRejuvenatedRelic(relics, initialPick, firstIndex),
    ).not.toBe(initialPick)
    expect(
      resolveRandomizedRejuvenatedRelic(relics, initialPick, () => 1),
    ).toBe(initialPick)
  })

  it('rejects uneven uint32 overflow instead of biasing an option', () => {
    const values = [0xffff_ffff, 4]
    const randomIndex = createUniformRandomIndex(() => values.shift()!)

    expect(randomIndex(3)).toBe(1)
    expect(values).toEqual([])
  })

  it('chooses one different option from every relic tier', () => {
    const currentRelics = Object.fromEntries(
      RELIC_TIERS.map(({ options, tier }) => [tier, options[0]!.id]),
    )
    const result = createRandomizedRelics(currentRelics, firstIndex)

    expect(Object.keys(result.relics)).toHaveLength(RELIC_TIERS.length)
    RELIC_TIERS.forEach(({ options, tier }) => {
      expect(options.some(({ id }) => id === result.relics[tier])).toBe(true)
      expect(result.relics[tier]).not.toBe(currentRelics[tier])
    })

    const rejuvenatedTier = RELIC_TIERS.find(({ options, tier }) =>
      options.some(
        ({ id, label }) =>
          id === result.relics[tier] && label === REJUVENATED_RELIC_NAME,
      ),
    )?.tier
    if (rejuvenatedTier) {
      expect(result.rejuvenatedRelic).toBeTruthy()
      expect(Number(result.rejuvenatedRelic[0])).toBeLessThan(rejuvenatedTier)
    } else {
      expect(result.rejuvenatedRelic).toBe('')
    }
  })

  it('chooses a different blessing path for every selectable tier', () => {
    const currentBlessings = Object.fromEntries(
      SELECTABLE_BLESSING_TIERS.map((tier) => [tier, 'a']),
    )
    const result = createRandomizedBlessings(currentBlessings, firstIndex)

    SELECTABLE_BLESSING_TIERS.forEach((tier) => {
      expect(['a', 'b', 'c']).toContain(result[tier])
      expect(result[tier]).not.toBe(currentBlessings[tier])
    })
  })

  it('returns the guaranteed regions plus three unique optional regions', () => {
    const result = createRandomizedRegions(firstIndex)
    const optionalRegions = result.filter(
      (regionId) => !GUARANTEED_REGION_IDS.includes(regionId),
    )

    expect(result.slice(0, GUARANTEED_REGION_IDS.length)).toEqual(
      GUARANTEED_REGION_IDS,
    )
    expect(optionalRegions).toHaveLength(OPTIONAL_REGION_PICK_COUNT)
    expect(new Set(optionalRegions).size).toBe(OPTIONAL_REGION_PICK_COUNT)
  })
})
