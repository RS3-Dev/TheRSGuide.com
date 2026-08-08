import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import LeaguesRegionMap from '@/components/mdx/leagues-region-map'
import { regionMapData } from '@/data/leagues/region-map-data'
import {
  displayRegionId,
  displayRegions,
  leaguesRegionGuidePaths,
  regionGuidePath,
  type RegionMapData,
} from './leagues-region-map'

const mapData: RegionMapData = {
  columns: 2,
  rows: 1,
  pixels: [['asgarnia', 'troll-country']],
  regions: [
    {
      id: 'asgarnia',
      name: 'Asgarnia',
      color: '#111111',
      hoverColor: '#ffffff',
    },
    {
      id: 'troll-country',
      name: 'Troll Country',
      color: '#222222',
      hoverColor: '#ffffff',
    },
  ],
  superRegions: [{
    id: 'troll-country-asgarnia',
    name: 'Troll Country & Asgarnia',
    regionIds: ['troll-country', 'asgarnia'],
  }],
}

describe('Leagues region map', () => {
  it('groups source regions into one displayed destination', () => {
    expect(displayRegionId(mapData, 'troll-country')).toBe('troll-country-asgarnia')
    expect(displayRegions(mapData)).toEqual([{
      id: 'troll-country-asgarnia',
      name: 'Troll Country & Asgarnia',
      color: '#111111',
      hoverColor: '#ffffff',
      regionIds: ['troll-country', 'asgarnia'],
    }])
  })

  it('maps every displayed map region directly to a Regions guide', () => {
    for (const [regionId, path] of Object.entries(leaguesRegionGuidePaths)) {
      expect(regionGuidePath(regionId)).toBe(path)
      expect(path).toMatch(/^\/leagues\/regions\/[a-z0-9-]+$/)
    }
    expect(regionGuidePath('unknown')).toBe('/leagues/regions')
  })

  it('renders production regions as guide links', () => {
    const linkedRegion = displayRegions(regionMapData).find(
      ({ id }) => leaguesRegionGuidePaths[id],
    )
    expect(linkedRegion).toBeDefined()

    const markup = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(LeaguesRegionMap)),
    )

    expect(markup).toContain('<figure')
    expect(markup).toContain(`href="${regionGuidePath(linkedRegion!.id)}"`)
    expect(markup).toContain(linkedRegion!.name)
  })
})
