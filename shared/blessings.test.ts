import { describe, expect, it } from 'vitest'

import {
  BLESSING_IDS,
  canDeriveGodBlessing,
  type BlessingId,
  type GodBlessingTier,
  type SelectableBlessingTier,
} from './blessings'

const blockKey = (tier: SelectableBlessingTier, blessing: BlessingId) =>
  `${tier}-${blessing}`

function canDerive(
  target: BlessingId,
  godTier: GodBlessingTier,
  blocked: readonly string[],
) {
  const blockedKeys = new Set(blocked)
  return canDeriveGodBlessing(
    target,
    godTier,
    (tier, blessing) => !blockedKeys.has(blockKey(tier, blessing)),
  )
}

describe('God Blessing availability', () => {
  it.each([
    ['a', 'Order'],
    ['c', 'Chaos'],
  ] as const)(
    'makes %s unavailable after two matching paths are blocked',
    (target) => {
      const blocked = [blockKey(1, target), blockKey(2, target)]

      expect(canDerive(target, 4, blocked)).toBe(false)
      expect(
        BLESSING_IDS.filter((blessing) =>
          canDerive(blessing, 4, blocked),
        ),
      ).not.toContain(target)
    },
  )

  it('keeps Balance available after two Balance paths are blocked', () => {
    const blocked = [blockKey(1, 'b'), blockKey(2, 'b')]

    expect(canDerive('b', 4, blocked)).toBe(true)
  })

  it('makes Balance unavailable when every Balance path is blocked', () => {
    const blocked = [blockKey(1, 'b'), blockKey(2, 'b'), blockKey(3, 'b')]

    expect(canDerive('b', 4, blocked)).toBe(false)
  })

  it('keeps the two God Tier groups independent', () => {
    const blocked = [blockKey(1, 'a'), blockKey(2, 'a')]

    expect(canDerive('a', 4, blocked)).toBe(false)
    expect(canDerive('a', 8, blocked)).toBe(true)
  })
})
