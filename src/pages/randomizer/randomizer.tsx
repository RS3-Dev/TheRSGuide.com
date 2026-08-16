import { useEffect, useRef, useState } from 'react'

import {
  GUARANTEED_REGION_IDS,
  OPTIONAL_REGION_PICK_COUNT,
  RELIC_TIERS,
  REJUVENATED_RELIC_NAME,
  type BlessingId,
  type BlessingSelections,
  type SelectableBlessingTier,
} from '@/lib/picks-state'
import { BlessingSelector } from '@/pages/picks/components/BlessingSelector'
import { RegionOutlineMap } from '@/pages/picks/components/RegionOutlineMap'
import { RelicSelector } from '@/pages/picks/components/RelicSelector'
import {
  createRandomizedBlessingForTier,
  createRandomizedNextRegion,
  createRandomizedRejuvenatedRelic,
  createRandomizedRelicForTier,
  getBlessingBlockKey,
  getNextBlessingTier,
  getNextRelicTier,
  hasAvailableBlessingForTier,
  hasAvailableNextRegion,
  hasAvailableRelicForTier,
  resolveRandomizedRejuvenatedRelic,
} from './randomizer-utils'
import '@/styles/picker.css'
import '@/styles/randomizer.css'

type RandomizerStage = 'relics' | 'blessings' | 'regions' | 'idle'

const ROLL_FRAME_COUNT = 18
const ROLL_FRAME_BASE_DURATION = 80
const ROLL_FRAME_SLOWDOWN = 20

const delay = (duration: number) =>
  new Promise<void>((resolve) => window.setTimeout(resolve, duration))

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function toggledSet(current: ReadonlySet<string>, value: string) {
  const next = new Set(current)
  if (next.has(value)) {
    next.delete(value)
  } else {
    next.add(value)
  }
  return next
}

export default function RandomizerPage() {
  const runTokenRef = useRef(0)
  const [stage, setStage] = useState<RandomizerStage>('idle')
  const [blockedRelicIds, setBlockedRelicIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [blockedBlessingKeys, setBlockedBlessingKeys] = useState<Set<string>>(
    () => new Set(),
  )
  const [blockedRegionIds, setBlockedRegionIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [selectedRelics, setSelectedRelics] = useState<Record<number, string>>(
    {},
  )
  const [selectedRejuvenatedRelic, setSelectedRejuvenatedRelic] = useState('')
  const [selectedBlessings, setSelectedBlessings] =
    useState<BlessingSelections>({})
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([
    ...GUARANTEED_REGION_IDS,
  ])

  useEffect(
    () => () => {
      runTokenRef.current += 1
    },
    [],
  )

  const nextRelicTier = getNextRelicTier(selectedRelics)
  const nextBlessingTier = getNextBlessingTier(selectedBlessings)
  const selectedOptionalRegionCount = selectedRegionIds.filter(
    (regionId) => !GUARANTEED_REGION_IDS.includes(regionId),
  ).length
  const nextRegionNumber = selectedOptionalRegionCount + 1
  const isRolling = stage !== 'idle'
  const canSpinNextRelic = Boolean(
    nextRelicTier !== undefined &&
      hasAvailableRelicForTier(nextRelicTier, blockedRelicIds),
  )
  const canSpinNextBlessing = Boolean(
    nextBlessingTier !== undefined &&
      hasAvailableBlessingForTier(nextBlessingTier, blockedBlessingKeys),
  )
  const canSpinNextRegion = hasAvailableNextRegion(
    selectedRegionIds,
    blockedRegionIds,
  )

  async function spinNextRelic() {
    if (!nextRelicTier || !canSpinNextRelic || isRolling) return

    const token = runTokenRef.current + 1
    runTokenRef.current = token
    setStage('relics')
    const targetId = createRandomizedRelicForTier(
      nextRelicTier,
      undefined,
      undefined,
      blockedRelicIds,
    )

    if (!prefersReducedMotion()) {
      let previousId: string | undefined
      for (let frame = 0; frame < ROLL_FRAME_COUNT; frame += 1) {
        if (runTokenRef.current !== token) return
        const rollingId = createRandomizedRelicForTier(
          nextRelicTier,
          previousId,
          undefined,
          blockedRelicIds,
        )
        previousId = rollingId
        setSelectedRelics((current) => ({
          ...current,
          [nextRelicTier]: rollingId,
        }))
        await delay(ROLL_FRAME_BASE_DURATION + frame * ROLL_FRAME_SLOWDOWN)
      }
    }

    if (runTokenRef.current !== token) return
    const finalRelics = { ...selectedRelics, [nextRelicTier]: targetId }
    const targetRejuvenatedRelic = resolveRandomizedRejuvenatedRelic(
      finalRelics,
      selectedRejuvenatedRelic,
      undefined,
      blockedRelicIds,
    )
    setSelectedRelics(finalRelics)

    if (
      targetRejuvenatedRelic &&
      !selectedRejuvenatedRelic &&
      !prefersReducedMotion()
    ) {
      let previousId: string | undefined
      for (let frame = 0; frame < ROLL_FRAME_COUNT; frame += 1) {
        if (runTokenRef.current !== token) return
        const rollingId = createRandomizedRejuvenatedRelic(
          finalRelics,
          previousId,
          undefined,
          blockedRelicIds,
        )
        previousId = rollingId
        setSelectedRejuvenatedRelic(rollingId)
        await delay(ROLL_FRAME_BASE_DURATION + frame * ROLL_FRAME_SLOWDOWN)
      }
    }

    if (runTokenRef.current !== token) return
    setSelectedRejuvenatedRelic(targetRejuvenatedRelic)
    setStage('idle')
  }

  async function spinNextBlessing() {
    if (!nextBlessingTier || !canSpinNextBlessing || isRolling) return

    const token = runTokenRef.current + 1
    runTokenRef.current = token
    setStage('blessings')
    const targetId = createRandomizedBlessingForTier(
      nextBlessingTier,
      undefined,
      undefined,
      blockedBlessingKeys,
    )

    if (!prefersReducedMotion()) {
      let previousId: BlessingSelections[typeof nextBlessingTier]
      for (let frame = 0; frame < ROLL_FRAME_COUNT; frame += 1) {
        if (runTokenRef.current !== token) return
        const rollingId = createRandomizedBlessingForTier(
          nextBlessingTier,
          previousId,
          undefined,
          blockedBlessingKeys,
        )
        previousId = rollingId
        setSelectedBlessings((current) => ({
          ...current,
          [nextBlessingTier]: rollingId,
        }))
        await delay(ROLL_FRAME_BASE_DURATION + frame * ROLL_FRAME_SLOWDOWN)
      }
    }

    if (runTokenRef.current !== token) return
    setSelectedBlessings((current) => ({
      ...current,
      [nextBlessingTier]: targetId,
    }))
    setStage('idle')
  }

  async function spinNextRegion() {
    if (
      selectedOptionalRegionCount >= OPTIONAL_REGION_PICK_COUNT ||
      !canSpinNextRegion ||
      isRolling
    )
      return

    const token = runTokenRef.current + 1
    runTokenRef.current = token
    setStage('regions')
    const targetRegionIds = createRandomizedNextRegion(
      selectedRegionIds,
      undefined,
      blockedRegionIds,
    )

    if (!prefersReducedMotion()) {
      for (let frame = 0; frame < ROLL_FRAME_COUNT; frame += 1) {
        if (runTokenRef.current !== token) return
        setSelectedRegionIds(
          createRandomizedNextRegion(
            selectedRegionIds,
            undefined,
            blockedRegionIds,
          ),
        )
        await delay(ROLL_FRAME_BASE_DURATION + frame * ROLL_FRAME_SLOWDOWN)
      }
    }

    if (runTokenRef.current !== token) return
    setSelectedRegionIds(targetRegionIds)
    setStage('idle')
  }

  function toggleBlockedRelic(tier: number, relicId: string) {
    const isBlocking = !blockedRelicIds.has(relicId)
    setBlockedRelicIds((current) => toggledSet(current, relicId))
    if (!isBlocking) return

    const isSelectedRejuvenatedRelic = RELIC_TIERS.find(
      (entry) => entry.tier === tier,
    )?.options.some(
      ({ id, label }) =>
        id === relicId &&
        label === REJUVENATED_RELIC_NAME &&
        selectedRelics[tier] === relicId,
    )
    setSelectedRelics((current) => {
      if (current[tier] !== relicId) return current
      const next = { ...current }
      delete next[tier]
      return next
    })
    setSelectedRejuvenatedRelic((current) =>
      current === relicId || isSelectedRejuvenatedRelic ? '' : current,
    )
  }

  function toggleBlockedBlessing(
    tier: SelectableBlessingTier,
    blessingId: BlessingId,
  ) {
    const key = getBlessingBlockKey(tier, blessingId)
    const isBlocking = !blockedBlessingKeys.has(key)
    setBlockedBlessingKeys((current) => toggledSet(current, key))
    if (!isBlocking) return

    setSelectedBlessings((current) => {
      if (current[tier] !== blessingId) return current
      const next = { ...current }
      delete next[tier]
      return next
    })
  }

  function toggleBlockedRegion(regionId: string) {
    const isBlocking = !blockedRegionIds.has(regionId)
    setBlockedRegionIds((current) => toggledSet(current, regionId))
    if (isBlocking) {
      setSelectedRegionIds((current) =>
        current.filter((selectedId) => selectedId !== regionId),
      )
    }
  }

  return (
    <div
      className="leagues-picker leagues-randomizer"
      data-randomizing={isRolling ? 'true' : 'false'}
    >
      <div className="mx-auto flex max-w-[78rem] flex-col gap-16 py-4 sm:py-6">
        <p className="-mb-10 text-sm text-muted-foreground">
          Right-click any relic, blessing, or optional region to block it from
          randomizer spins. Right-click it again to allow it.
        </p>
        <section
          aria-busy={stage === 'relics'}
          className="randomizer-stage"
          data-active={stage === 'relics' ? 'true' : 'false'}
        >
          <div inert={isRolling ? true : undefined}>
            <RelicSelector
              blockedRelicIds={blockedRelicIds}
              onChange={setSelectedRelics}
              onBlockedRelicToggle={toggleBlockedRelic}
              onRejuvenatedRelicChange={setSelectedRejuvenatedRelic}
              selectedRejuvenatedRelic={selectedRejuvenatedRelic}
              selectedRelics={selectedRelics}
              spinAction={{
                disabled: isRolling || !canSpinNextRelic,
                isSpinning: stage === 'relics',
                label: nextRelicTier
                  ? canSpinNextRelic
                    ? `Spin Tier ${nextRelicTier}`
                    : 'No eligible relics'
                  : 'All spun',
                onSpin: () => void spinNextRelic(),
              }}
            />
          </div>
        </section>

        <section
          aria-busy={stage === 'blessings'}
          className="randomizer-stage"
          data-active={stage === 'blessings' ? 'true' : 'false'}
        >
          <div inert={isRolling ? true : undefined}>
            <BlessingSelector
              blockedBlessingKeys={blockedBlessingKeys}
              onChange={setSelectedBlessings}
              onBlockedBlessingToggle={toggleBlockedBlessing}
              selectedBlessings={selectedBlessings}
              spinAction={{
                disabled: isRolling || !canSpinNextBlessing,
                isSpinning: stage === 'blessings',
                label: nextBlessingTier
                  ? canSpinNextBlessing
                    ? `Spin Tier ${nextBlessingTier}`
                    : 'No eligible blessings'
                  : 'All spun',
                onSpin: () => void spinNextBlessing(),
              }}
            />
          </div>
        </section>

        <section
          aria-busy={stage === 'regions'}
          className="randomizer-stage"
          data-active={stage === 'regions' ? 'true' : 'false'}
        >
          <div inert={isRolling ? true : undefined}>
            <RegionOutlineMap
              blockedRegionIds={blockedRegionIds}
              onBlockedRegionToggle={toggleBlockedRegion}
              onSelectedRegionIdsChange={setSelectedRegionIds}
              selectedRegionIds={selectedRegionIds}
              spinAction={{
                disabled: isRolling || !canSpinNextRegion,
                isSpinning: stage === 'regions',
                label:
                  selectedOptionalRegionCount < OPTIONAL_REGION_PICK_COUNT
                    ? canSpinNextRegion
                      ? `Spin Region ${nextRegionNumber}`
                      : 'No eligible regions'
                    : 'All spun',
                onSpin: () => void spinNextRegion(),
              }}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
