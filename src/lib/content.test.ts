import { describe, expect, it } from 'vitest'
import {
  guideCatalog,
  guideSectionDefinitionsForMode,
  guideSections,
  primaryNavigation,
} from './content'
import { isLeaguesMode } from './homepage-mode'

const leaguesMode = isLeaguesMode(import.meta.env.VITE_HOMEPAGE_MODE)
const expectedSectionIds = [
  'setup',
  'getting-started',
  'guides',
  'extras',
  ...(leaguesMode ? ['leagues'] : []),
]

describe('site guide catalog', () => {
  it('loads every current MDX route with a unique identity', () => {
    const paths = guideCatalog.documents.map((document) => document.path)

    expect(paths.length).toBeGreaterThanOrEqual(60)
    expect(new Set(paths).size).toBe(paths.length)
    expect(paths.some((path) => path.startsWith('/leagues'))).toBe(leaguesMode)
    for (const document of guideCatalog.documents) {
      expect(guideCatalog.get(document.path)).toBe(document)
    }
  })

  it('keeps configured sections in primary-navigation order', () => {
    expect(guideCatalog.sections.map((section) => section.id)).toEqual(expectedSectionIds)
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

  it('uses one consistent navigation tree across every guide route', () => {
    expect(guideSections.map((section) => section.id)).toEqual(expectedSectionIds)
    expect(primaryNavigation.map((link) => link.label)).toEqual(
      guideSections.map((section) => section.label),
    )
    expect(guideSectionDefinitionsForMode('leagues').map((section) => section.label)).toEqual([
      'Setup',
      'Getting Started',
      'Guides',
      'Extras',
      'Leagues',
    ])
  })
})
