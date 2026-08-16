import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Ban, CircleCheck, Lock } from 'lucide-react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { regionMapData } from '@/data/leagues/region-map-data'
import {
  type DisplayRegion,
  type DrawBounds,
  type RegionMapData,
  getDisplayRegions,
} from '@/pages/map/utils/map'
import { GUARANTEED_REGION_IDS, type RegionSelection } from '@/lib/picks-state'
import { LEAGUE_OPTIONS } from '../../../../shared/league-options'
import { RegionPickerHeader } from './RegionPickerHeader'
import { SelectedRegionList } from './SelectedRegionList'
import type { PickerSpinAction } from './PickerSpinButton'
import {
  drawRegionPickerMap,
  getRegionIdFromCanvasPoint,
  toggleOptionalRegionSelection,
} from '../utils/region-picker'

export type { RegionSelection } from '@/lib/picks-state'

type CanvasSize = {
  height: number
  width: number
}

const GUARANTEED_REGION_ID_SET = new Set<string>(GUARANTEED_REGION_IDS)
const NO_BLOCKED_REGIONS = new Set<string>()
type RegionOutlineMapProps = {
  blockedRegionIds?: ReadonlySet<string>
  onBlockedRegionToggle?: (regionId: string) => void
  onSelectedRegionIdsChange: (regionIds: string[]) => void
  onSelectionDetailsChange?: (regions: RegionSelection[]) => void
  selectedRegionIds: string[]
  showHeader?: boolean
  spinAction?: PickerSpinAction
}

export function RegionOutlineMap({
  blockedRegionIds = NO_BLOCKED_REGIONS,
  onBlockedRegionToggle,
  onSelectedRegionIdsChange,
  onSelectionDetailsChange,
  selectedRegionIds,
  showHeader = true,
  spinAction,
}: RegionOutlineMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mapBoundsRef = useRef<DrawBounds | null>(null)
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({
    height: 1,
    width: 1,
  })
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null)
  const [contextRegionId, setContextRegionId] = useState<string | null>(null)

  const pickerMapData = useMemo<RegionMapData>(() => {
    return {
      ...regionMapData,
      superRegions: LEAGUE_OPTIONS.regions
        .filter((region) => region.regionIds.length > 1)
        .map((region) => ({
          id: region.id,
          name: region.label,
          regionIds: region.regionIds,
        })),
    }
  }, [])
  const displayRegions = useMemo(
    () => getDisplayRegions(pickerMapData),
    [pickerMapData],
  )
  const displayRegionById = useMemo(
    () =>
      new Map<string, DisplayRegion>(
        displayRegions.map((region) => [region.id, region]),
      ),
    [displayRegions],
  )
  const selectedRegions = useMemo(
    () =>
      selectedRegionIds.map((regionId) => {
        const leagueRegion = LEAGUE_OPTIONS.regions.find(
          (region) => region.id === regionId,
        )
        return (
          displayRegionById.get(regionId) ?? {
            color: leagueRegion?.color,
            id: regionId,
            name: leagueRegion?.label ?? regionId,
            regionIds: leagueRegion?.regionIds ?? [regionId],
          }
        )
      }),
    [displayRegionById, selectedRegionIds],
  )
  const blockedSourceRegionIds = useMemo(
    () =>
      new Set(
        Array.from(blockedRegionIds).flatMap(
          (displayId) =>
            displayRegionById.get(displayId)?.regionIds ?? [displayId],
        ),
      ),
    [blockedRegionIds, displayRegionById],
  )
  const activeRegionIds = useMemo(() => {
    const activeDisplayIds = new Set(selectedRegionIds)

    if (hoveredRegionId && !blockedRegionIds.has(hoveredRegionId)) {
      activeDisplayIds.add(hoveredRegionId)
    }

    return new Set(
      Array.from(activeDisplayIds).flatMap(
        (displayId) =>
          displayRegionById.get(displayId)?.regionIds ?? [displayId],
      ),
    )
  }, [blockedRegionIds, displayRegionById, hoveredRegionId, selectedRegionIds])

  useEffect(() => {
    if (!onSelectionDetailsChange) return

    onSelectionDetailsChange(
      selectedRegions.map(({ color, id, name }) => ({ color, id, name })),
    )
  }, [onSelectionDetailsChange, selectedRegions])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const observer = new ResizeObserver(([entry]) => {
      const { height, width } = entry.contentRect
      setCanvasSize({
        height: Math.max(1, height),
        width: Math.max(1, width),
      })
    })

    observer.observe(canvas)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    mapBoundsRef.current = drawRegionPickerMap({
      activeRegionIds,
      blockedRegionIds: blockedSourceRegionIds,
      canvas,
      canvasSize,
      displayRegionById,
      hoveredRegionId,
      mapData: pickerMapData,
    })
  }, [
    activeRegionIds,
    blockedSourceRegionIds,
    canvasSize,
    displayRegionById,
    hoveredRegionId,
    pickerMapData,
  ])

  const getRegionIdFromPoint = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      const bounds = mapBoundsRef.current
      if (!canvas || !bounds) {
        return null
      }

      return getRegionIdFromCanvasPoint({
        bounds,
        clientX,
        clientY,
        mapData: pickerMapData,
        rect: canvas.getBoundingClientRect(),
      })
    },
    [pickerMapData],
  )

  const handleRegionClick = useCallback(
    (clientX: number, clientY: number) => {
      const clickedRegionId = getRegionIdFromPoint(clientX, clientY)

      if (!clickedRegionId || blockedRegionIds.has(clickedRegionId)) return
      onSelectedRegionIdsChange(
        toggleOptionalRegionSelection({
          clickedRegionId,
          guaranteedRegionIds: GUARANTEED_REGION_ID_SET,
          selectedRegionIds,
        }),
      )
    },
    [
      blockedRegionIds,
      getRegionIdFromPoint,
      onSelectedRegionIdsChange,
      selectedRegionIds,
    ],
  )

  const optionalRegionCount = Math.max(
    0,
    selectedRegionIds.length - GUARANTEED_REGION_IDS.length,
  )
  const isHoveredRegionBlocked = Boolean(
    hoveredRegionId && blockedRegionIds.has(hoveredRegionId),
  )
  const contextRegionName = contextRegionId
    ? (displayRegionById.get(contextRegionId)?.name ?? contextRegionId)
    : ''
  const isContextRegionGuaranteed = Boolean(
    contextRegionId && GUARANTEED_REGION_ID_SET.has(contextRegionId),
  )

  const mapCanvas = (
    <canvas
      aria-label="Region outline picker map"
      className={`block h-[34rem] w-full sm:h-[38rem] ${
        isHoveredRegionBlocked
          ? 'cursor-not-allowed'
          : hoveredRegionId
            ? 'cursor-pointer'
            : ''
      }`}
      onClick={(event) => handleRegionClick(event.clientX, event.clientY)}
      onContextMenu={(event) => {
        const regionId = getRegionIdFromPoint(event.clientX, event.clientY)
        if (!regionId) {
          event.preventDefault()
          return
        }
        setContextRegionId(regionId)
      }}
      onPointerLeave={() => setHoveredRegionId(null)}
      onPointerMove={(event) =>
        setHoveredRegionId(getRegionIdFromPoint(event.clientX, event.clientY))
      }
      ref={canvasRef}
    />
  )

  return (
    <section>
      {showHeader && (
        <RegionPickerHeader
          canReset={selectedRegionIds.length !== GUARANTEED_REGION_IDS.length}
          onReset={() => onSelectedRegionIdsChange([...GUARANTEED_REGION_IDS])}
          selectedCount={optionalRegionCount}
          spinAction={spinAction}
        />
      )}
      <div className="grid lg:grid-cols-[18rem_minmax(0,1fr)]">
        <SelectedRegionList regions={selectedRegions} />

        <div className="relative min-w-0 overflow-hidden border border-border bg-card/30">
          <p className="pointer-events-none absolute left-3 top-3 z-10 rounded-sm border border-border bg-card/90 px-3 py-2 text-xs text-muted-foreground shadow-sm backdrop-blur-sm">
            {onBlockedRegionToggle
              ? 'Click to select · Right-click to block'
              : 'Click the map to add or remove a region'}
          </p>
          {onBlockedRegionToggle ? (
            <ContextMenu
              onOpenChange={(open) => {
                if (!open) setContextRegionId(null)
              }}
            >
              <ContextMenuTrigger asChild>{mapCanvas}</ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuGroup>
                  <ContextMenuItem
                    disabled={isContextRegionGuaranteed}
                    onSelect={() => {
                      if (contextRegionId && !isContextRegionGuaranteed) {
                        onBlockedRegionToggle(contextRegionId)
                      }
                    }}
                  >
                    {isContextRegionGuaranteed ? (
                      <Lock />
                    ) : blockedRegionIds.has(contextRegionId ?? '') ? (
                      <CircleCheck />
                    ) : (
                      <Ban />
                    )}
                    {isContextRegionGuaranteed
                      ? `${contextRegionName} is always included`
                      : blockedRegionIds.has(contextRegionId ?? '')
                        ? `Allow ${contextRegionName}`
                        : `Block ${contextRegionName}`}
                  </ContextMenuItem>
                </ContextMenuGroup>
              </ContextMenuContent>
            </ContextMenu>
          ) : (
            mapCanvas
          )}
        </div>
      </div>
    </section>
  )
}
