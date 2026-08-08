import { describe, expect, it } from 'vitest'
import {
  guideCatalog,
  guideSectionDefinitionsForMode,
  guideSections,
  primaryNavigation,
} from './content'
import { isLeaguesMode } from './homepage-mode'

const leaguesMode = isLeaguesMode(import.meta.env.VITE_HOMEPAGE_MODE)

describe('site guide catalog', () => {
  it('resolves every visible MDX document through the catalog', () => {
    expect(
      guideCatalog.documents.some((document) => document.path.startsWith('/leagues')),
    ).toBe(leaguesMode)
    for (const document of guideCatalog.documents) {
      expect(guideCatalog.get(document.path)).toBe(document)
    }
  })

  it('keeps configured sections in primary-navigation order', () => {
    expect(guideCatalog.sections.map((section) => section.id)).toEqual(
      guideSections.map((section) => section.id),
    )
    expect(guideCatalog.sections.every((section) => section.index)).toBe(true)
  })

  it('uses one consistent navigation tree across every guide route', () => {
    expect(primaryNavigation.map((link) => link.label)).toEqual(
      guideSections.map((section) => section.label),
    )
    expect(
      guideSectionDefinitionsForMode('leagues').some((section) => section.id === 'leagues'),
    ).toBe(true)
  })
})
