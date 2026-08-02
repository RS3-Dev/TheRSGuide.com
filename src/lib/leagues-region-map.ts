export type RegionMapRegion = {
  color: string
  hoverColor: string
  id: string
  labelPosition?: {
    column: number
    row: number
  }
  name: string
}

export type RegionMapSuperRegion = {
  id: string
  name: string
  regionIds: string[]
}

export type RegionMapData = {
  columns: number
  pixels: (string | null)[][]
  regions: RegionMapRegion[]
  rows: number
  superRegions?: RegionMapSuperRegion[]
}

export type DisplayRegion = {
  color?: string
  hoverColor?: string
  id: string
  name: string
  regionIds: string[]
}

export type RegionMapBounds = {
  height: number
  width: number
  x: number
  y: number
}

export const leaguesRegionGuidePaths: Readonly<Record<string, string>> = {
  'kharidian-desert': '/leagues/map/desert',
  misthalin: '/leagues/map/starting-regions',
  asgarnia: '/leagues/map/asgarnia',
  morytania: '/leagues/map/morytania',
  wilderness: '/leagues/map/wilderness',
  karamja: '/leagues/map/karamja',
  'fremennik-providence': '/leagues/map/fremennik',
  kandarin: '/leagues/map/kandarin',
  tirannwn: '/leagues/map/tirannwn',
  anachronia: '/leagues/map/anachronia',
  havenhythe: '/leagues/map/starting-regions',
}

export const regionGuidePath = (displayRegionId: string) =>
  leaguesRegionGuidePaths[displayRegionId] ?? '/leagues/map'

export function getRegionMapBounds(
  width: number,
  height: number,
  columns: number,
  rows: number,
): RegionMapBounds {
  const padding = width < 700 ? 14 : 24
  const availableWidth = Math.max(1, width - padding * 2)
  const availableHeight = Math.max(1, height - padding * 2)
  const mapAspect = columns / rows
  const viewportAspect = availableWidth / availableHeight
  const drawWidth =
    viewportAspect > mapAspect ? availableHeight * mapAspect : availableWidth
  const drawHeight =
    viewportAspect > mapAspect ? availableHeight : availableWidth / mapAspect

  return {
    height: drawHeight,
    width: drawWidth,
    x: (width - drawWidth) / 2,
    y: (height - drawHeight) / 2,
  }
}

export function displayRegionId(
  mapData: RegionMapData,
  regionId: string | null,
) {
  if (!regionId) return null
  return (
    mapData.superRegions?.find((region) => region.regionIds.includes(regionId))?.id
    ?? regionId
  )
}

export function displayRegions(mapData: RegionMapData): DisplayRegion[] {
  const result: DisplayRegion[] = []
  const included = new Set<string>()

  for (const region of mapData.regions) {
    const superRegion = mapData.superRegions?.find((candidate) =>
      candidate.regionIds.includes(region.id),
    )

    if (superRegion) {
      if (!included.has(superRegion.id)) {
        const firstRegion = mapData.regions.find((candidate) =>
          superRegion.regionIds.includes(candidate.id),
        )
        result.push({
          color: firstRegion?.color,
          hoverColor: firstRegion?.hoverColor,
          id: superRegion.id,
          name: superRegion.name,
          regionIds: superRegion.regionIds,
        })
        included.add(superRegion.id)
      }
      continue
    }

    result.push({
      color: region.color,
      hoverColor: region.hoverColor,
      id: region.id,
      name: region.name,
      regionIds: [region.id],
    })
  }

  return result
}

export function regionLabelLines(label: string, maxLineLength = 7) {
  const lines: string[] = []

  for (const word of label.trim().split(/\s+/).filter(Boolean)) {
    const currentLine = lines.at(-1)
    const nextLine = currentLine ? `${currentLine} ${word}` : word
    if (currentLine && nextLine.length > maxLineLength) {
      lines.push(word)
    } else if (currentLine) {
      lines[lines.length - 1] = nextLine
    } else {
      lines.push(word)
    }
  }

  return lines
}
