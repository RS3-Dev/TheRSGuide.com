import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  PICKS_STORAGE_KEY,
  RELIC_TIERS,
  getRejuvenatedRelicOptions,
  getRejuvenatedRelicTier,
  loadPicksState,
  normalizeRejuvenatedRelic,
} from './picks-state'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('confirmed relic migration', () => {
  it('preserves the relic names selected in the old Tier 1 order', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) =>
          key === PICKS_STORAGE_KEY
            ? JSON.stringify({
                isSpeculativeRelics: false,
                selectedRelics: { 1: '1a' },
              })
            : null,
      },
    })

    expect(loadPicksState().selectedRelics).toEqual({ 1: '1c' })
  })

  it('preserves relic names from the old speculative slot order', () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) =>
          key === PICKS_STORAGE_KEY
            ? JSON.stringify({
                isSpeculativeRelics: true,
                selectedRelics: { 4: '4b', 5: '5a', 7: '7a' },
              })
            : null,
      },
    })

    expect(loadPicksState().selectedRelics).toEqual({
      4: '4c',
      5: '5b',
      7: '7b',
    })
  })
})

describe('Rejuvenated relic picks', () => {
  it('offers the configured relics from tiers below Rejuvenated', () => {
    const rejuvenatedTierConfig = RELIC_TIERS.find(({ options }) =>
      options.some(({ label }) => label === 'Rejuvenated'),
    )
    const rejuvenatedOption = rejuvenatedTierConfig?.options.find(
      ({ label }) => label === 'Rejuvenated',
    )
    expect(rejuvenatedTierConfig).toBeDefined()
    expect(rejuvenatedOption).toBeDefined()

    const selectedRelics = {
      [rejuvenatedTierConfig!.tier]: rejuvenatedOption!.id,
    }
    const rejuvenatedTier = getRejuvenatedRelicTier(selectedRelics)
    const options = getRejuvenatedRelicOptions(selectedRelics)

    expect(rejuvenatedTier).toBe(rejuvenatedTierConfig!.tier)
    expect(options.every(({ tier }) => tier < rejuvenatedTier!)).toBe(true)

    for (const tier of RELIC_TIERS.filter(({ tier }) => tier < rejuvenatedTier!)) {
      for (const option of tier.options) {
        expect(options).toContainEqual({ ...option, tier: tier.tier })
      }
    }
  })

  it('accepts lower-tier bonus picks and rejects invalid or duplicate picks', () => {
    const selectedRelics = { 1: '1a', 6: '6a' }

    expect(normalizeRejuvenatedRelic('1b', selectedRelics)).toBe('1b')
    expect(normalizeRejuvenatedRelic('1a', selectedRelics)).toBe('')
    expect(normalizeRejuvenatedRelic('6b', selectedRelics)).toBe('')
    expect(normalizeRejuvenatedRelic('7a', selectedRelics)).toBe('')
  })

  it('removes the bonus pick when Rejuvenated is no longer selected', () => {
    expect(normalizeRejuvenatedRelic('1b', { 6: '6b' })).toBe('')
    expect(getRejuvenatedRelicTier({ 6: '6b' })).toBeUndefined()
  })
})
