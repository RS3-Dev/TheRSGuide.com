import {
  type DisplayRegion,
  type DrawBounds,
  type RegionMapData,
  getDisplayRegionId,
  getDrawBounds,
  getLabelLines,
} from '../../map/utils/map'
import { REQUIRED_REGION_COUNT } from '../../../../shared/share-contract'

type CanvasSize = {
  height: number
  width: number
}

type CanvasPointBounds = Pick<DOMRect, 'height' | 'left' | 'top' | 'width'>

export const MAX_REGION_PICKS = REQUIRED_REGION_COUNT

export function getRegionIdFromCanvasPoint(options: {
  bounds: DrawBounds
  clientX: number
  clientY: number
  mapData: RegionMapData
  rect: CanvasPointBounds
}) {
  const { bounds, clientX, clientY, mapData, rect } = options
  const x = clientX - rect.left
  const y = clientY - rect.top
  if (
    x < bounds.x ||
    y < bounds.y ||
    x >= bounds.x + bounds.width ||
    y >= bounds.y + bounds.height
  ) {
    return null
  }

  const column = Math.floor(((x - bounds.x) / bounds.width) * mapData.columns)
  const row = Math.floor(((y - bounds.y) / bounds.height) * mapData.rows)
  return getDisplayRegionId(mapData, mapData.pixels[row]?.[column] ?? null)
}

export function toggleOptionalRegionSelection(options: {
  clickedRegionId: string
  guaranteedRegionIds: ReadonlySet<string>
  selectedRegionIds: string[]
}) {
  const { clickedRegionId, guaranteedRegionIds, selectedRegionIds } = options
  if (guaranteedRegionIds.has(clickedRegionId)) return selectedRegionIds
  if (selectedRegionIds.includes(clickedRegionId)) {
    return selectedRegionIds.filter((regionId) => regionId !== clickedRegionId)
  }
  if (selectedRegionIds.length >= MAX_REGION_PICKS) return selectedRegionIds
  return [...selectedRegionIds, clickedRegionId]
}

function drawRegionOutlines(options: {
  bounds: DrawBounds
  context: CanvasRenderingContext2D
  highlightedRegionIds?: Set<string>
  lineWidth: number
  mapData: RegionMapData
  strokeStyle: string
}) {
  const {
    bounds,
    context,
    highlightedRegionIds,
    lineWidth,
    mapData,
    strokeStyle,
  } = options
  const cellWidth = bounds.width / mapData.columns
  const cellHeight = bounds.height / mapData.rows
  context.strokeStyle = strokeStyle
  context.lineWidth = lineWidth
  context.lineCap = 'butt'
  context.beginPath()

  for (let rowIndex = 0; rowIndex < mapData.rows; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < mapData.columns; columnIndex += 1) {
      const regionId = mapData.pixels[rowIndex]?.[columnIndex]
      if (
        !regionId ||
        (highlightedRegionIds && !highlightedRegionIds.has(regionId))
      )
        continue

      const x = bounds.x + columnIndex * cellWidth
      const y = bounds.y + rowIndex * cellHeight
      const right = x + cellWidth
      const bottom = y + cellHeight
      const topRegion = mapData.pixels[rowIndex - 1]?.[columnIndex] ?? null
      const bottomRegion = mapData.pixels[rowIndex + 1]?.[columnIndex] ?? null
      const leftRegion = mapData.pixels[rowIndex]?.[columnIndex - 1] ?? null
      const rightRegion = mapData.pixels[rowIndex]?.[columnIndex + 1] ?? null
      const isVisibleEdge = (neighbor: string | null) =>
        neighbor !== regionId &&
        (!highlightedRegionIds || !highlightedRegionIds.has(neighbor ?? ''))

      if (isVisibleEdge(topRegion)) {
        context.moveTo(x, y)
        context.lineTo(right, y)
      }
      if (isVisibleEdge(bottomRegion)) {
        context.moveTo(x, bottom)
        context.lineTo(right, bottom)
      }
      if (isVisibleEdge(leftRegion)) {
        context.moveTo(x, y)
        context.lineTo(x, bottom)
      }
      if (isVisibleEdge(rightRegion)) {
        context.moveTo(right, y)
        context.lineTo(right, bottom)
      }
    }
  }
  context.stroke()
}

export function drawRegionPickerMap(options: {
  activeRegionIds: Set<string>
  blockedRegionIds?: Set<string>
  canvas: HTMLCanvasElement
  canvasSize: CanvasSize
  displayRegionById: Map<string, DisplayRegion>
  hoveredRegionId: string | null
  mapData: RegionMapData
}) {
  const {
    activeRegionIds,
    blockedRegionIds = new Set<string>(),
    canvas,
    canvasSize,
    displayRegionById,
    hoveredRegionId,
    mapData,
  } = options
  const context = canvas.getContext('2d')
  if (!context) return null

  const styles = getComputedStyle(canvas)
  const cardColor = styles.getPropertyValue('--card').trim() || '#141210'
  const borderColor = styles.getPropertyValue('--border').trim() || '#4b3a2a'
  const primaryColor = styles.getPropertyValue('--primary').trim() || '#cc9a63'
  const foregroundColor =
    styles.getPropertyValue('--foreground').trim() || '#efe4d2'

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = Math.floor(canvasSize.width * dpr)
  canvas.height = Math.floor(canvasSize.height * dpr)
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.clearRect(0, 0, canvasSize.width, canvasSize.height)
  context.fillStyle = cardColor
  context.fillRect(0, 0, canvasSize.width, canvasSize.height)

  const bounds = getDrawBounds(
    canvasSize.width,
    canvasSize.height,
    mapData.columns,
    mapData.rows,
  )
  const cellWidth = bounds.width / mapData.columns
  const cellHeight = bounds.height / mapData.rows
  const baseLineWidth = canvasSize.width < 700 ? 1 : 1.5
  const regionById = new Map(
    mapData.regions.map((region) => [region.id, region]),
  )

  for (let rowIndex = 0; rowIndex < mapData.rows; rowIndex += 1) {
    for (let columnIndex = 0; columnIndex < mapData.columns; columnIndex += 1) {
      const regionId = mapData.pixels[rowIndex]?.[columnIndex]
      if (!regionId || !activeRegionIds.has(regionId)) continue
      context.fillStyle = regionById.get(regionId)?.color ?? '#2a3a30'
      context.fillRect(
        Math.floor(bounds.x + columnIndex * cellWidth),
        Math.floor(bounds.y + rowIndex * cellHeight),
        Math.ceil(cellWidth) + 1,
        Math.ceil(cellHeight) + 1,
      )
    }
  }

  if (blockedRegionIds.size) {
    context.save()
    context.globalAlpha = 0.22
    context.fillStyle = foregroundColor
    context.strokeStyle = foregroundColor
    context.lineWidth = Math.max(1, baseLineWidth)
    for (let rowIndex = 0; rowIndex < mapData.rows; rowIndex += 1) {
      for (
        let columnIndex = 0;
        columnIndex < mapData.columns;
        columnIndex += 1
      ) {
        const regionId = mapData.pixels[rowIndex]?.[columnIndex]
        if (!regionId || !blockedRegionIds.has(regionId)) continue

        const x = bounds.x + columnIndex * cellWidth
        const y = bounds.y + rowIndex * cellHeight
        context.fillRect(
          Math.floor(x),
          Math.floor(y),
          Math.ceil(cellWidth) + 1,
          Math.ceil(cellHeight) + 1,
        )
        context.beginPath()
        context.moveTo(x, y + cellHeight)
        context.lineTo(x + cellWidth, y)
        context.stroke()
      }
    }
    context.restore()
  }

  drawRegionOutlines({
    bounds,
    context,
    lineWidth: baseLineWidth,
    mapData,
    strokeStyle: borderColor,
  })
  if (hoveredRegionId) {
    drawRegionOutlines({
      bounds,
      context,
      highlightedRegionIds: new Set(
        displayRegionById.get(hoveredRegionId)?.regionIds ?? [hoveredRegionId],
      ),
      lineWidth: baseLineWidth + 0.5,
      mapData,
      strokeStyle: primaryColor,
    })
  }
  if (blockedRegionIds.size) {
    context.save()
    context.globalAlpha = 0.65
    drawRegionOutlines({
      bounds,
      context,
      highlightedRegionIds: blockedRegionIds,
      lineWidth: baseLineWidth + 0.5,
      mapData,
      strokeStyle: foregroundColor,
    })
    context.restore()
  }

  const fontSize = Math.max(9, Math.min(13, cellWidth * 1.65))
  context.font = `bold ${fontSize}px ui-monospace, monospace`
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  for (const region of mapData.regions) {
    if (!region.labelPosition) continue
    const labelX = bounds.x + (region.labelPosition.column + 0.5) * cellWidth
    const labelY = bounds.y + (region.labelPosition.row + 0.5) * cellHeight
    const words = getLabelLines(region.name.toUpperCase())
    const lineHeight = fontSize * 1.3
    const totalHeight = words.length * lineHeight
    const padding = 6
    const boxWidth =
      words.reduce(
        (width, word) => Math.max(width, context.measureText(word).width),
        0,
      ) +
      padding * 2
    const boxHeight = totalHeight + padding * 2
    context.fillStyle = cardColor
    context.fillRect(
      labelX - boxWidth / 2,
      labelY - boxHeight / 2,
      boxWidth,
      boxHeight,
    )
    context.strokeStyle = primaryColor
    context.lineWidth = 1
    context.strokeRect(
      labelX - boxWidth / 2,
      labelY - boxHeight / 2,
      boxWidth,
      boxHeight,
    )
    const startY = labelY - totalHeight / 2 + lineHeight / 2
    words.forEach((word, index) => {
      context.fillStyle = foregroundColor
      context.fillText(word, labelX, startY + index * lineHeight)
    })
  }
  return bounds
}
