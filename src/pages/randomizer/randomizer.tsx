import { useEffect, useRef, useState } from 'react'

import {
  GUARANTEED_REGION_IDS,
  OPTIONAL_REGION_PICK_COUNT,
  type BlessingSelections,
} from '@/lib/picks-state'
import { BlessingSelector } from '@/pages/picks/components/BlessingSelector'
import { RegionOutlineMap } from '@/pages/picks/components/RegionOutlineMap'
import { RelicSelector } from '@/pages/picks/components/RelicSelector'
import {
  createRandomizedBlessingForTier,
  createRandomizedNextRegion,
  createRandomizedRejuvenatedRelic,
  createRandomizedRelicForTier,
  getNextBlessingTier,
  getNextRelicTier,
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

export default function RandomizerPage() {
  const runTokenRef = useRef(0)
  const [stage, setStage] = useState<RandomizerStage>('idle')
  const [selectedRelics, setSelectedRelics] = useState<Record<number, string>>({})
  const [selectedRejuvenatedRelic, setSelectedRejuvenatedRelic] = useState('')
  const [selectedBlessings, setSelectedBlessings] =
    useState<BlessingSelections>({})
  const [selectedRegionIds, setSelectedRegionIds] = useState<string[]>([
    ...GUARANTEED_REGION_IDS,
  ])

  useEffect(() => () => {
    runTokenRef.current += 1
  }, [])

  const nextRelicTier = getNextRelicTier(selectedRelics)
  const nextBlessingTier = getNextBlessingTier(selectedBlessings)
  const selectedOptionalRegionCount = selectedRegionIds.filter(
    (regionId) => !GUARANTEED_REGION_IDS.includes(regionId),
  ).length
  const nextRegionNumber = selectedOptionalRegionCount + 1
  const isRolling = stage !== 'idle'

  async function spinNextRelic() {
    if (!nextRelicTier || isRolling) return

    const token = runTokenRef.current + 1
    runTokenRef.current = token
    setStage('relics')
    const targetId = createRandomizedRelicForTier(nextRelicTier)

    if (!prefersReducedMotion()) {
      let previousId: string | undefined
      for (let frame = 0; frame < ROLL_FRAME_COUNT; frame += 1) {
        if (runTokenRef.current !== token) return
        const rollingId = createRandomizedRelicForTier(
          nextRelicTier,
          previousId,
        )
        previousId = rollingId
        setSelectedRelics((current) => ({
          ...current,
          [nextRelicTier]: rollingId,
        }))
        await delay(
          ROLL_FRAME_BASE_DURATION + frame * ROLL_FRAME_SLOWDOWN,
        )
      }
    }

    if (runTokenRef.current !== token) return
    const finalRelics = { ...selectedRelics, [nextRelicTier]: targetId }
    const targetRejuvenatedRelic = resolveRandomizedRejuvenatedRelic(
      finalRelics,
      selectedRejuvenatedRelic,
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
        )
        previousId = rollingId
        setSelectedRejuvenatedRelic(rollingId)
        await delay(
          ROLL_FRAME_BASE_DURATION + frame * ROLL_FRAME_SLOWDOWN,
        )
      }
    }

    if (runTokenRef.current !== token) return
    setSelectedRejuvenatedRelic(targetRejuvenatedRelic)
    setStage('idle')
  }

  async function spinNextBlessing() {
    if (!nextBlessingTier || isRolling) return

    const token = runTokenRef.current + 1
    runTokenRef.current = token
    setStage('blessings')
    const targetId = createRandomizedBlessingForTier(nextBlessingTier)

    if (!prefersReducedMotion()) {
      let previousId: BlessingSelections[typeof nextBlessingTier]
      for (let frame = 0; frame < ROLL_FRAME_COUNT; frame += 1) {
        if (runTokenRef.current !== token) return
        const rollingId = createRandomizedBlessingForTier(
          nextBlessingTier,
          previousId,
        )
        previousId = rollingId
        setSelectedBlessings((current) => ({
          ...current,
          [nextBlessingTier]: rollingId,
        }))
        await delay(
          ROLL_FRAME_BASE_DURATION + frame * ROLL_FRAME_SLOWDOWN,
        )
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
      isRolling
    ) return

    const token = runTokenRef.current + 1
    runTokenRef.current = token
    setStage('regions')
    const targetRegionIds = createRandomizedNextRegion(selectedRegionIds)

    if (!prefersReducedMotion()) {
      for (let frame = 0; frame < ROLL_FRAME_COUNT; frame += 1) {
        if (runTokenRef.current !== token) return
        setSelectedRegionIds(createRandomizedNextRegion(selectedRegionIds))
        await delay(
          ROLL_FRAME_BASE_DURATION + frame * ROLL_FRAME_SLOWDOWN,
        )
      }
    }

    if (runTokenRef.current !== token) return
    setSelectedRegionIds(targetRegionIds)
    setStage('idle')
  }

  return (
    <div
      className="leagues-picker leagues-randomizer"
      data-randomizing={isRolling ? 'true' : 'false'}
    >
      <div className="mx-auto flex max-w-[78rem] flex-col gap-16 py-4 sm:py-6">
        <section
          aria-busy={stage === 'relics'}
          className="randomizer-stage"
          data-active={stage === 'relics' ? 'true' : 'false'}
        >
          <div inert={isRolling ? true : undefined}>
            <RelicSelector
              onChange={setSelectedRelics}
              onRejuvenatedRelicChange={setSelectedRejuvenatedRelic}
              selectedRejuvenatedRelic={selectedRejuvenatedRelic}
              selectedRelics={selectedRelics}
              spinAction={{
                disabled: isRolling || nextRelicTier === undefined,
                isSpinning: stage === 'relics',
                label: nextRelicTier ? `Spin Tier ${nextRelicTier}` : 'All spun',
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
              onChange={setSelectedBlessings}
              selectedBlessings={selectedBlessings}
              spinAction={{
                disabled: isRolling || nextBlessingTier === undefined,
                isSpinning: stage === 'blessings',
                label: nextBlessingTier
                  ? `Spin Tier ${nextBlessingTier}`
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
              onSelectedRegionIdsChange={setSelectedRegionIds}
              selectedRegionIds={selectedRegionIds}
              spinAction={{
                disabled:
                  isRolling ||
                  selectedOptionalRegionCount >= OPTIONAL_REGION_PICK_COUNT,
                isSpinning: stage === 'regions',
                label:
                  selectedOptionalRegionCount < OPTIONAL_REGION_PICK_COUNT
                    ? `Spin Region ${nextRegionNumber}`
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
