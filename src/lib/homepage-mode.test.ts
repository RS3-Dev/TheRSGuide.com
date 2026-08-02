import { describe, expect, it } from 'vitest'
import {
  homepagePrimaryLinks,
  isGuideSectionEnabled,
  resolveHomepageMode,
} from './homepage-mode'

describe('homepage mode', () => {
  it('defaults missing and unrecognized values to normal mode', () => {
    expect(resolveHomepageMode()).toBe('normal')
    expect(resolveHomepageMode('true')).toBe('normal')
    expect(resolveHomepageMode('seasonal')).toBe('normal')
  })

  it('accepts the leagues value without case or surrounding whitespace sensitivity', () => {
    expect(resolveHomepageMode('leagues')).toBe('leagues')
    expect(resolveHomepageMode('  LEAGUES  ')).toBe('leagues')
  })

  it('only includes the Leagues content section in Leagues mode', () => {
    expect(isGuideSectionEnabled('leagues', 'normal')).toBe(false)
    expect(isGuideSectionEnabled('leagues', 'leagues')).toBe(true)
    expect(isGuideSectionEnabled('guides', 'normal')).toBe(true)
  })

  it('highlights Guides and omits Leagues in normal mode', () => {
    expect(homepagePrimaryLinks('normal')).toEqual([
      { label: 'Guides', to: '/guides', highlighted: true },
      { label: 'Getting Started', to: '/getting-started' },
      { label: 'Setup Guide', to: '/setup' },
      { label: 'Extras', to: '/extras' },
    ])
  })

  it('inserts and highlights Leagues in leagues mode', () => {
    const links = homepagePrimaryLinks('leagues')

    expect(links.map((link) => link.label)).toEqual([
      'Guides',
      'Getting Started',
      'Leagues',
      'Setup Guide',
      'Extras',
    ])
    expect(links.filter((link) => link.highlighted)).toEqual([
      { label: 'Leagues', to: '/leagues', highlighted: true },
    ])
  })
})
