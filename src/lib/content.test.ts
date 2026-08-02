import { describe, expect, it } from 'vitest'
import {
  guideCatalog,
  guideSectionsForPath,
  isLeaguesRoute,
  primaryNavigationForPath,
} from './content'

describe('site guide catalog', () => {
  it('loads every current MDX route with a unique identity', () => {
    const paths = guideCatalog.documents.map((document) => document.path)

    expect(paths.length).toBeGreaterThanOrEqual(91)
    expect(new Set(paths).size).toBe(paths.length)
    for (const document of guideCatalog.documents) {
      expect(guideCatalog.get(document.path)).toBe(document)
    }
  })

  it('keeps configured sections in primary-navigation order', () => {
    expect(guideCatalog.sections.map((section) => section.id)).toEqual([
      'setup',
      'getting-started',
      'guides',
      'extras',
      'leagues',
    ])
    expect(guideCatalog.sections.every((section) => section.index)).toBe(true)
  })

  it('keeps a category index adjacent to its first child', () => {
    const melee = guideCatalog.get('/guides/melee')
    const magic = guideCatalog.get('/guides/magic')

    expect(melee).toBeDefined()
    expect(magic).toBeDefined()
    expect(guideCatalog.adjacent(melee!).next?.path).toBe('/guides/melee/basic-abilities')
    expect(guideCatalog.adjacent(magic!).next?.path).toBe('/guides/magic/basic-abilities')
  })

  it('keeps the leagues hub in its configured content hierarchy', () => {
    const leagues = guideCatalog.section('leagues')
    const leaguesTwo = leagues?.navigation.find(
      (node) => node.doc.path === '/leagues/leagues-ii',
    )
    const osPlayers = leagues?.navigation.find(
      (node) => node.doc.path === '/leagues/rs-for-os-players',
    )
    const regions = leagues?.navigation.find(
      (node) => node.doc.path === '/leagues/map',
    )

    expect(leagues?.navigation.map((node) => node.doc.path)).toEqual([
      '/leagues/leagues-ii',
      '/leagues/rs-for-os-players',
      '/leagues/map',
    ])
    expect(leagues?.navigation.map((node) => node.label)).toEqual([
      'Leagues II',
      'RS for OS',
      'Regions',
    ])
    expect(regions?.doc.title).toBe('Map')
    expect(leaguesTwo?.children.map((node) => node.doc.title)).toEqual([
      'Relics',
      'Blessings',
      'Routes',
      'Skilling Solves',
    ])
    expect(regions?.children.map((node) => node.doc.title)).toEqual([
      'Starting Regions',
      'Karamja',
      'Anachronia',
      'Asgarnia',
      'Fremennik',
      'Kandarin',
      'Desert',
      'Morytania',
      'Tirannwn',
      'Wilderness',
    ])
    expect(osPlayers?.children.map((node) => node.doc.title)).toEqual([
      'Similarities',
      'Differences',
      'Combat',
      'Bosses',
      'Navigation (Teleports)',
      'Resources',
    ])
  })

  it('isolates navigation according to the active content tree', () => {
    expect(isLeaguesRoute('/leagues/map/anachronia')).toBe(true)
    expect(isLeaguesRoute('/leagues/')).toBe(true)
    expect(isLeaguesRoute('/guides/leagues')).toBe(false)

    expect(guideSectionsForPath('/guides/melee').map((section) => section.id)).toEqual([
      'setup',
      'getting-started',
      'guides',
      'extras',
    ])
    expect(
      guideSectionsForPath('/leagues/leagues-ii/relics').map((section) => section.id),
    ).toEqual(['leagues'])
    expect(
      primaryNavigationForPath('/leagues/leagues-ii/relics').map((link) => link.label),
    ).toEqual(['Leagues II', 'RS for OS', 'Regions'])
    expect(primaryNavigationForPath('/guides/melee').map((link) => link.label)).toEqual([
      'Setup',
      'Getting Started',
      'Guides',
      'Extras',
      'Leagues',
    ])
    expect(
      primaryNavigationForPath('/guides/melee', 'leagues').map((link) => link.label),
    ).toEqual(['Setup', 'Getting Started', 'Guides', 'Extras', 'Leagues'])
  })
})
